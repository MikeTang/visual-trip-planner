export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // ISO date string "YYYY-MM-DD"
  endDate: string;   // ISO date string "YYYY-MM-DD"
  coverImage?: string;
  createdAt: string; // ISO timestamp
}
