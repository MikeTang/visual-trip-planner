"use client";

import { useState } from "react";
import { Trip } from "@/lib/types";

interface NewTripModalProps {
  onClose: () => void;
  onSave: (trip: Trip) => void;
}

export default function NewTripModal({ onClose, onSave }: NewTripModalProps) {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Trip name is required.");
    if (!destination.trim()) return setError("Destination is required.");
    if (!startDate) return setError("Start date is required.");
    if (!endDate) return setError("End date is required.");
    if (endDate < startDate) return setError("End date must be on or after start date.");

    const trip: Trip = {
      id: crypto.randomUUID(),
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
    };
    onSave(trip);
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet */}
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl px-6 pt-6 pb-10 sm:pb-6">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">New Trip</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Trip Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer in Europe"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Paris, France"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-500 bg-red-50 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition-all duration-150 mt-1"
          >
            Create Trip
          </button>
        </form>
      </div>
    </div>
  );
}
