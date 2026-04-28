"use client";

import { useState } from "react";
import { Activity } from "@/lib/types";

interface Props {
  activity: Activity;
  fmt12h: (time: string) => string;
  onDelete: () => void;
  onEdit: () => void;
}

/**
 * ActivityCard — visual card for a single activity on the trip timeline.
 *
 * Layout:
 *  ┌──────────────────────────────┐
 *  │  Image (natural height)  OR  │
 *  │  Placeholder gradient        │
 *  ├──────────────────────────────│
 *  │  [time chip]   [cost badge]  │
 *  │  Title                       │
 *  │  Notes preview (2 lines)     │
 *  └──────────────────────────────┘
 *
 * Matches the design-mockup.html activity card spec exactly:
 *  - rounded-3xl, border border-gray-100, shadow-sm, bg-white
 *  - image: w-full object-cover, rounded-t-3xl
 *  - time: blue chip, cost: emerald chip
 *  - image placeholder: warm gradient + camera icon
 *  - hover: edit/delete buttons appear top-right
 */
export default function ActivityCard({ activity, fmt12h, onDelete, onEdit }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imgError, setImgError] = useState(false);

  const showImage = activity.image && !imgError;
  const showPlaceholder = !showImage;

  return (
    <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white group relative">

      {/* ── Image / Placeholder ─────────────────────────────────────────── */}
      {showImage ? (
        <div className="rounded-t-3xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activity.image!}
            alt={activity.title}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <Placeholder title={activity.title} />
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="p-3">
        {/* Time + cost chips row */}
        <div className="flex items-center gap-1.5 mb-1.5">
          {activity.time && (
            <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
              {fmt12h(activity.time)}
            </span>
          )}
          {activity.cost != null && activity.cost > 0 && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap ml-auto">
              ${activity.cost.toLocaleString()}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-gray-900 leading-snug">
          {activity.title}
        </p>

        {/* Notes preview */}
        {activity.notes && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
            {activity.notes}
          </p>
        )}
      </div>

      {/* ── Hover action buttons ─────────────────────────────────────────── */}
      {!confirmDelete && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={onEdit}
            className="w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
            aria-label="Edit activity"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path
                d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414L12 16H9v-3z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
            aria-label="Delete activity"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Delete confirmation overlay ───────────────────────────────────── */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-2.5 p-4">
          <p className="text-xs font-semibold text-gray-700 text-center">Remove this activity?</p>
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="text-xs font-semibold bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

/**
 * Shown when an activity has no image (or the image URL failed to load).
 * Warm amber-to-orange gradient with a camera icon — travel-inspired feel.
 * Height is fixed so cards without images are still visually balanced in the
 * 2-col masonry layout.
 */
function Placeholder({ title }: { title: string }) {
  // Derive a consistent gradient hue from the first char of the title so
  // every activity gets a distinct but stable warm color.
  const code = title.charCodeAt(0) ?? 65;
  const gradients = [
    "from-amber-200 to-orange-300",
    "from-rose-200 to-pink-300",
    "from-sky-200 to-blue-300",
    "from-emerald-200 to-teal-300",
    "from-violet-200 to-purple-300",
    "from-yellow-200 to-amber-300",
  ] as const;
  const gradient = gradients[code % gradients.length];

  return (
    <div
      className={`rounded-t-3xl h-28 bg-gradient-to-br ${gradient} flex items-center justify-center`}
      aria-hidden="true"
    >
      <svg
        className="w-8 h-8 text-white/60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        {/* Camera icon */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
        />
      </svg>
    </div>
  );
}
