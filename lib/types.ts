export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // ISO date string "YYYY-MM-DD"
  endDate: string;   // ISO date string "YYYY-MM-DD"
  coverImage?: string;
  createdAt: string; // ISO timestamp
}

export interface Activity {
  id: string;
  tripId: string;
  date: string;   // "YYYY-MM-DD" — which day this belongs to
  time: string;   // "HH:MM" 24h
  title: string;
  notes?: string;
  cost?: number;  // USD
  image?: string; // URL or data URI
  createdAt: string;
}
