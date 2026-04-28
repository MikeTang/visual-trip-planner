import TripTimeline from "@/app/components/TripTimeline";

export default function TripPage({ params }: { params: { id: string } }) {
  return <TripTimeline tripId={params.id} />;
}
