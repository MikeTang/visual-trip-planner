"use client";

import { useState, useRef, FormEvent } from "react";
import { Activity, Trip } from "@/lib/types";

interface Props {
  tripId: string;
  trip: Trip;
  defaultDate: string | null;
  /** Pass an existing activity to open the modal in edit mode */
  editActivity?: Activity | null;
  onClose: () => void;
  /** Called for both new saves and edits */
  onSave: (activity: Activity) => void;
}

/** Enumerate every day between start and end inclusive */
function eachDay(start: string, end: string): string[] {
  const days: string[] = [];
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);
  while (cur <= last) {
    const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
    days.push(iso);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function fmtDayOption(iso: string, idx: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `Day ${idx + 1} — ${label}`;
}

/** True if a string looks like a URL (http/https/data) */
function looksLikeUrl(s: string): boolean {
  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:");
}

export default function AddActivityModal({
  tripId,
  trip,
  defaultDate,
  editActivity = null,
  onClose,
  onSave,
}: Props) {
  const isEdit = editActivity != null;
  const days = eachDay(trip.startDate, trip.endDate);
  const initDate =
    (editActivity?.date ?? (defaultDate && days.includes(defaultDate) ? defaultDate : null)) ??
    days[0];

  const [date, setDate] = useState(initDate);
  const [title, setTitle] = useState(editActivity?.title ?? "");
  const [time, setTime] = useState(editActivity?.time ?? "");
  const [cost, setCost] = useState(editActivity?.cost != null ? String(editActivity.cost) : "");
  const [notes, setNotes] = useState(editActivity?.notes ?? "");

  // Image: either a data-URI from file upload or a URL string
  const [imagePreview, setImagePreview] = useState<string | null>(editActivity?.image ?? null);
  // Track which tab is active: "upload" | "url"
  const [imageTab, setImageTab] = useState<"upload" | "url">(
    editActivity?.image && !editActivity.image.startsWith("data:") ? "url" : "upload"
  );
  const [imageUrl, setImageUrl] = useState(
    editActivity?.image && !editActivity.image.startsWith("data:") ? editActivity.image : ""
  );

  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
      setImageUrl("");
    };
    reader.readAsDataURL(file);
  }

  function handleUrlBlur() {
    const trimmed = imageUrl.trim();
    if (trimmed && looksLikeUrl(trimmed)) {
      setImagePreview(trimmed);
    } else if (!trimmed) {
      setImagePreview(null);
    }
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setImageUrl(val);
    if (!val.trim()) setImagePreview(null);
  }

  function clearImage() {
    setImagePreview(null);
    setImageUrl("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    // Resolve final image: prefer explicit preview (data URI or validated URL)
    const finalImage =
      imageTab === "url"
        ? imageUrl.trim() && looksLikeUrl(imageUrl.trim())
          ? imageUrl.trim()
          : undefined
        : imagePreview ?? undefined;

    const activity: Activity = {
      id: editActivity?.id ?? `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tripId,
      date,
      time,
      title: title.trim(),
      notes: notes.trim() || undefined,
      cost: cost ? parseFloat(cost) : undefined,
      image: finalImage,
      createdAt: editActivity?.createdAt ?? new Date().toISOString(),
    };
    onSave(activity);
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Sheet */}
      <div
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl pb-10 overflow-y-auto max-h-[90vh]"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Activity" : "Add Activity"}
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
              aria-label="Close"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Day picker */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">
                Day
              </label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {days.map((d, i) => (
                  <option key={d} value={d}>
                    {fmtDayOption(d, i)}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">
                Activity Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Jungfraujoch Train"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Time + Cost row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Cost ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any details, tips, reminders…"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
              />
            </div>

            {/* Photo — tabs for Upload vs URL */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">
                Photo
              </label>

              {/* Tab switcher */}
              <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setImageTab("upload")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                    imageTab === "upload"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab("url")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                    imageTab === "url"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  URL
                </button>
              </div>

              {imageTab === "upload" ? (
                /* File upload */
                imagePreview && imagePreview.startsWith("data:") ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="preview" className="w-full object-cover max-h-48" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition"
                      aria-label="Remove photo"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-500 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-medium">Choose photo</span>
                  </button>
                )
              ) : (
                /* URL input */
                <div className="space-y-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    onBlur={handleUrlBlur}
                    placeholder="https://images.unsplash.com/…"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                  {imagePreview && !imagePreview.startsWith("data:") && (
                    <div className="relative rounded-2xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full object-cover max-h-48"
                        onError={() => setImagePreview(null)}
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition"
                        aria-label="Remove photo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-700 active:scale-[0.98] transition mt-2"
            >
              {isEdit ? "Save Changes" : "Add to Itinerary"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
