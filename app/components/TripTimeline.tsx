"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadData, saveData } from "@/lib/storage";
import { Trip, Activity } from "@/lib/types";
import ActivityCard from "./ActivityCard";
import AddActivityModal from "./AddActivityModal";

// ─── helpers ────────────────────────────────────────────────────────────────

/** "YYYY-MM-DD" → Date (local, no TZ shift) */
function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Date → "YYYY-MM-DD" */
function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Enumerate every day between start and end inclusive */
function eachDay(start: string, end: string): string[] {
  const days: string[] = [];
  const cur = parseLocal(start);
  const last = parseLocal(end);
  while (cur <= last) {
    days.push(toISODate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/** "YYYY-MM-DD" → "Sunday, Aug 12" */
function fmtDayLabel(iso: string): string {
  return parseLocal(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/** "Mon DD" range label */
function fmtDateRange(start: string, end: string): string {
  const fmt = (iso: string) =>
    parseLocal(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

/** "HH:MM" (24h) → "H:MM AM/PM" */
function fmt12h(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** Sort activities within a day by time */
function sortByTime(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => a.time.localeCompare(b.time));
}

/** Total cost of activities */
function totalCost(activities: Activity[]): number {
  return activities.reduce((sum, a) => sum + (a.cost ?? 0), 0);
}

// ─── storage key ─────────────────────────────────────────────────────────────

function activitiesKey(tripId: string) {
  return `activities-${tripId}`;
}

// ─── Fallback cover images ────────────────────────────────────────────────────

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
  "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=400&q=80",
  "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
];

function coverFor(trip: Trip): string {
  if (trip.coverImage) return trip.coverImage;
  const idx = trip.id.charCodeAt(0) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[idx];
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  tripId: string;
}

export default function TripTimeline({ tripId }: Props) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [addForDate, setAddForDate] = useState<string | null>(null);

  // ── load trip + activities ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const trips = await loadData<Trip[]>("trips");
        const found = (trips ?? []).find((t) => t.id === tripId) ?? null;
        setTrip(found);
        if (found) {
          const acts = await loadData<Activity[]>(activitiesKey(tripId));
          setActivities(acts ?? []);
        }
      } catch (err) {
        console.error("Failed to load trip:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tripId]);

  // ── save activities ─────────────────────────────────────────────────────────
  const persistActivities = useCallback(
    async (updated: Activity[]) => {
      setActivities(updated);
      try {
        await saveData(activitiesKey(tripId), updated);
      } catch (err) {
        console.error("Failed to save activities:", err);
        // revert already handled by caller keeping prev state if needed
      }
    },
    [tripId]
  );

  function handleAddActivity(act: Activity) {
    const updated = [...activities, act];
    persistActivities(updated);
    setModalOpen(false);
    setAddForDate(null);
  }

  function handleDeleteActivity(id: string) {
    const updated = activities.filter((a) => a.id !== id);
    persistActivities(updated);
  }

  // ── derived ─────────────────────────────────────────────────────────────────
  const days = trip ? eachDay(trip.startDate, trip.endDate) : [];
  const actsByDay = days.reduce<Record<string, Activity[]>>((acc, d) => {
    acc[d] = sortByTime(activities.filter((a) => a.date === d));
    return acc;
  }, {});

  // ── render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen bg-white"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      >
        <div className="max-w-md mx-auto px-5 pt-14 animate-pulse space-y-4">
          <div className="h-56 bg-gray-100 rounded-3xl" />
          <div className="h-8 bg-gray-100 rounded-2xl w-1/2" />
          <div className="h-40 bg-gray-100 rounded-3xl" />
          <div className="h-40 bg-gray-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div
        className="min-h-screen bg-white flex flex-col items-center justify-center gap-4"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      >
        <p className="text-gray-400 text-sm">Trip not found.</p>
        <button
          onClick={() => router.push("/")}
          className="text-sm font-semibold text-gray-900 underline"
        >
          Back to trips
        </button>
      </div>
    );
  }

  const cover = coverFor(trip);
  const allCost = totalCost(activities);
  const dateRange = fmtDateRange(trip.startDate, trip.endDate);

  return (
    <div
      className="min-h-screen bg-white text-gray-900"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <div className="max-w-md mx-auto px-5 pt-6 pb-28">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden h-56 mb-6 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={trip.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Back button */}
          <div className="absolute top-4 left-4">
            <button
              onClick={() => router.push("/")}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition"
              aria-label="Back"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Meta */}
          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">{dateRange}</p>
            <h2 className="text-2xl font-bold text-white mt-1">{trip.name}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full">
                {days.length} {days.length === 1 ? "day" : "days"}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full">
                {activities.length} {activities.length === 1 ? "activity" : "activities"}
              </span>
              {allCost > 0 && (
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  ${allCost.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Day sections ────────────────────────────────────────────────── */}
        {days.map((date, idx) => {
          const dayActivities = actsByDay[date] ?? [];
          return (
            <DaySection
              key={date}
              dayNumber={idx + 1}
              date={date}
              activities={dayActivities}
              onAddActivity={() => {
                setAddForDate(date);
                setModalOpen(true);
              }}
              onDeleteActivity={handleDeleteActivity}
              fmt12h={fmt12h}
            />
          );
        })}
      </div>

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-1/2 translate-x-1/2 max-w-md w-full px-5 pointer-events-none">
        <div className="flex justify-end pointer-events-auto">
          <button
            onClick={() => {
              setAddForDate(null);
              setModalOpen(true);
            }}
            className="bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-xl flex items-center gap-2 hover:bg-gray-700 active:scale-95 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 4v16M4 12h16" />
            </svg>
            Add Activity
          </button>
        </div>
      </div>

      {/* ── Add Activity Modal ────────────────────────────────────────────────── */}
      {modalOpen && (
        <AddActivityModal
          tripId={tripId}
          trip={trip}
          defaultDate={addForDate}
          onClose={() => {
            setModalOpen(false);
            setAddForDate(null);
          }}
          onSave={handleAddActivity}
        />
      )}
    </div>
  );
}

// ─── DaySection ──────────────────────────────────────────────────────────────

interface DaySectionProps {
  dayNumber: number;
  date: string;
  activities: Activity[];
  onAddActivity: () => void;
  onDeleteActivity: (id: string) => void;
  fmt12h: (time: string) => string;
}

function DaySection({
  dayNumber,
  date,
  activities,
  onAddActivity,
  onDeleteActivity,
  fmt12h,
}: DaySectionProps) {
  const label = fmtDayLabel(date);

  return (
    <div className="mb-6">
      {/* Day header */}
      <div className="flex items-center justify-between mb-3 sticky top-0 bg-white/90 backdrop-blur-sm py-1 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {dayNumber}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Day {dayNumber}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        </div>
        {/* Inline add button per day */}
        <button
          onClick={onAddActivity}
          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
          aria-label={`Add activity on day ${dayNumber}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 4v16M4 12h16" />
          </svg>
        </button>
      </div>

      {/* Activity waterfall grid (2-col masonry via CSS columns) */}
      {activities.length > 0 ? (
        <div style={{ columns: 2, columnGap: "12px" }}>
          {activities.map((act) => (
            <div key={act.id} style={{ breakInside: "avoid", marginBottom: "12px" }}>
              <ActivityCard
                activity={act}
                fmt12h={fmt12h}
                onDelete={() => onDeleteActivity(act.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Empty day placeholder */
        <button
          onClick={onAddActivity}
          className="w-full h-20 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400 text-sm hover:border-gray-300 hover:bg-gray-50 hover:text-gray-500 transition group"
        >
          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 4v16M4 12h16" />
          </svg>
          Add an activity
        </button>
      )}
    </div>
  );
}
