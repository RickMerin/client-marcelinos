import { useParams, useLocation } from "react-router-dom";
import { MultiStepForm } from "./Multi-Step-Form";
import { BookingReceiptPage } from "@/pages/Booking/BookingReceiptPage";
import { usePageSEO } from "@/hooks/usePageSEO";

const CREATE_BOOKING_SEO = {
  title: "Book Your Stay | Marcelino's Resort Hotel | Hilongos, Leyte",
  description:
    "Reserve your room or event at Marcelino's Resort Hotel. Choose dates, venue, and accommodations in Hilongos, Leyte, Philippines. Secure booking in a few steps.",
  path: "/create-booking",
  keywords:
    "book Marcelinos, reserve hotel Hilongos Leyte, Marcelinos booking, resort reservation Philippines, event venue booking",
};

export default function BookingIndex() {
  const { receipt_token } = useParams<{ receipt_token: string }>();
  const location = useLocation();
  const isReceiptRoute = location.pathname.startsWith("/booking-receipt/");
  const isCreateBooking = location.pathname === "/create-booking";

  usePageSEO(isCreateBooking ? CREATE_BOOKING_SEO : null);

  if (isReceiptRoute && receipt_token) {
    return <BookingReceiptPage receiptToken={receipt_token} />;
  }

  return (
		<div className="booking-funnel booking-funnel--leaves-bg min-h-screen landing-section-alt">
			<div className="relative z-10">
				<MultiStepForm />
			</div>
		</div>
	);
}
