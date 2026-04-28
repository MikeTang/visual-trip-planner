"use client";

import { useEffect, useState } from "react";
import { loadData, saveData } from "@/lib/storage";
import { Trip } from "@/lib/types";
import TripCard from "./TripCard";
import NewTripModal from "./NewTripModal";

const STORAGE_KEY = "trips";

export default function TripsHome() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Load persisted trips on mount
  useEffect(() => {
    loadData<Trip[]>(STORAGE_KEY)
      .then((data) => setTrips(data ?? []))
      .catch((err) => console.error("Failed to load trips:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveTrip(trip: Trip) {
    const updated = [trip, ...trips];
    setTrips(updated);
    setShowModal(false);
    try {
      await saveData(STORAGE_KEY, updated);
    } catch (err) {
      console.error("Failed to save trips:", err);
      // Revert optimistic update on failure
      setTrips(trips);
    }
  }

  const [featured, ...rest] = trips;

  return (
    <div
      className="min-h-screen bg-white text-gray-900"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <div className="max-w-md mx-auto px-5 pt-14 pb-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">My Trips</p>
            <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
            aria-label="New Trip"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 4v16M4 12h16" />
            </svg>
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            <div className="col-span-2 h-52 bg-gray-100 rounded-3xl" />
            <div className="h-40 bg-gray-100 rounded-3xl" />
            <div className="h-40 bg-gray-100 rounded-3xl" />
          </div>
        )}

        {/* Trip grid */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3">
            {/* Featured (most recent) */}
            {featured && <TripCard trip={featured} featured />}

            {/* Rest in pairs */}
            {rest.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}

            {/* New Trip placeholder */}
            <div
              className={`${trips.length === 0 ? "col-span-2 h-32" : "col-span-2 h-20"} rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition group`}
              onClick={() => setShowModal(true)}
            >
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-500">+ New Trip</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && trips.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">
            No trips yet. Tap <strong>+</strong> or the card above to plan your first adventure.
          </p>
        )}
      </div>

      {/* New Trip Modal */}
      {showModal && (
        <NewTripModal onClose={() => setShowModal(false)} onSave={handleSaveTrip} />
      )}
    </div>
  );
}
