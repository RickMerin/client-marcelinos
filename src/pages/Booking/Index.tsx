import { useParams, useLocation } from "react-router-dom";
import { MultiStepForm } from "./Multi-Step-Form";
import { BookingReceiptPage } from "@/pages/Booking/BookingReceiptPage";

export default function BookingIndex() {
  const { reference_number } = useParams<{ reference_number: string }>();
  const location = useLocation();
  const isReceiptRoute = location.pathname.startsWith("/booking-receipt/");

  if (isReceiptRoute && reference_number) {
    return <BookingReceiptPage referenceNumber={reference_number} />;
  }

  return (
    <main className="min-h-screen bg-gray-50 bg-linear-to-br from-background to-muted/20 flex p-4">
      <MultiStepForm />
    </main>
  );
}
