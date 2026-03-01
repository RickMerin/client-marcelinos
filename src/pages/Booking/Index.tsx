import { useParams, useLocation } from "react-router-dom";
import { MultiStepForm } from "./Multi-Step-Form";
import { BookingReceiptPage } from "@/pages/Booking/BookingReceiptPage";
import { usePageSEO } from "@/hooks/usePageSEO";

const CREATE_BOOKING_SEO = {
  title: "Book Your Stay | Marcelino's Resort and Hotel | Hilongos, Leyte",
  description:
    "Reserve your room or event at Marcelino's Resort and Hotel. Choose dates, venue, and accommodations in Hilongos, Leyte, Philippines. Secure booking in a few steps.",
  path: "/create-booking",
  keywords:
    "book Marcelinos, reserve hotel Hilongos Leyte, Marcelinos booking, resort reservation Philippines, event venue booking",
};

export default function BookingIndex() {
  const { reference_number } = useParams<{ reference_number: string }>();
  const location = useLocation();
  const isReceiptRoute = location.pathname.startsWith("/booking-receipt/");
  const isCreateBooking = location.pathname === "/create-booking";

  usePageSEO(isCreateBooking ? CREATE_BOOKING_SEO : null);

  if (isReceiptRoute && reference_number) {
    return <BookingReceiptPage referenceNumber={reference_number} />;
  }

  return (
    <div
      className="booking-funnel min-h-screen landing-section-alt"
      style={{ backgroundColor: "var(--color-cream)" }}>
      <MultiStepForm />
    </div>
  );
}
