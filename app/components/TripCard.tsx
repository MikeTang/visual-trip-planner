"use client";

import { useRouter } from "next/navigation";
import { Trip } from "@/lib/types";

interface TripCardProps {
  trip: Trip;
  featured?: boolean;
  activityCount?: number;
}

/** Format "YYYY-MM-DD" → "Mon DD" */
function fmtDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Number of days between two ISO date strings (inclusive) */
function dayCount(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1);
}

// Curated Unsplash cover fallbacks keyed loosely to destination keywords
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
  "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=400&q=80",
  "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
];

function coverFor(trip: Trip): string {
  if (trip.coverImage) return trip.coverImage;
  // Deterministic fallback based on id
  const idx = trip.id.charCodeAt(0) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[idx];
}

export default function TripCard({ trip, featured = false, activityCount = 0 }: TripCardProps) {
  const router = useRouter();
  const dateRange = `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}`;
  const days = dayCount(trip.startDate, trip.endDate);
  const cover = coverFor(trip);

  function navigate() {
    router.push(`/trips/${trip.id}`);
  }

  if (featured) {
    return (
      <div
        className="col-span-2 rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group"
        onClick={navigate}
      >
        <div className="relative h-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 rounded-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-3xl" />
          <div className="absolute bottom-0 left-0 p-4">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">{dateRange}</span>
            <h2 className="text-xl font-bold text-white mt-0.5">{trip.name}</h2>
            <p className="text-xs text-white/60 mt-0.5">{trip.destination}</p>
          </div>
          <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {days} {days === 1 ? "day" : "days"}
          </span>
          {activityCount > 0 && (
            <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {activityCount} {activityCount === 1 ? "activity" : "activities"}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group"
      onClick={navigate}
    >
      <div className="relative h-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 rounded-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-3xl" />
        <div className="absolute bottom-0 left-0 p-3">
          <span className="text-xs text-white/70">{dateRange}</span>
          <h2 className="text-sm font-bold text-white mt-0.5">{trip.name}</h2>
          <p className="text-xs text-white/50 mt-0.5">{trip.destination}</p>
        </div>
        <span className="absolute top-2 right-2 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          {days}d
        </span>
      </div>
    </div>
  );
}
