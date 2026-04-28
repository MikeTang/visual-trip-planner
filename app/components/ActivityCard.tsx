"use client";

import { useState } from "react";
import { Activity } from "@/lib/types";

interface Props {
  activity: Activity;
  fmt12h: (time: string) => string;
  onDelete: () => void;
  onEdit: () => void;
}

export default function ActivityCard({ activity, fmt12h, onDelete, onEdit }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white group relative">
      {/* Image */}
      {activity.image && (
        <div className="rounded-t-3xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activity.image}
            alt={activity.title}
            className="w-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          {activity.time && (
            <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
              {fmt12h(activity.time)}
            </span>
          )}
          {activity.cost != null && activity.cost > 0 && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-auto">
              ${activity.cost.toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-gray-900 mt-1.5 leading-snug">{activity.title}</p>
        {activity.notes && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-3">{activity.notes}</p>
        )}
      </div>

      {/* Action buttons — appear on hover */}
      {!confirmDelete && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
          {/* Edit */}
          <button
            onClick={onEdit}
            className="w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition"
            aria-label="Edit activity"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414L12 16H9v-3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Delete */}
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition"
            aria-label="Delete activity"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Delete confirmation overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-2 p-3">
          <p className="text-xs font-semibold text-gray-700 text-center">Remove this activity?</p>
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="text-xs font-semibold bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition"
            >
              Remove
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
