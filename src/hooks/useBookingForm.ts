import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormData } from "@/types/booking.types";
import { defaultFormData } from "@/lib/constants/booking.constants";
import { formatDate } from "@/lib/formatters/formatDate";
import {
  saveToLocalStorage,
  getFromLocalStorage,
  BOOKING_EXPIRATION,
} from "@/lib/storage/localStorage";
import {
  calculateTotalPrice,
  calculateGrandTotalPrice,
  calculateVenuesLineTotal,
} from "@/lib/math/calculate";
import {
  alignFormDataToBookingType,
  parseRoomTypeFilters,
} from "@/lib/utils/booking.utils";

function normalizeStoredVenueEventType(
  v: string | undefined,
): FormData["venue_event_type"] {
  if (!v) return "";
  if (v === "seminar") return "meeting_staff";
  return v as FormData["venue_event_type"];
}

/**
 * Custom hook for managing booking form state and persistence
 */
export const useBookingForm = () => {
  const navigate = useNavigate();

  // Load initial form data from localStorage
  const reservationDate = getFromLocalStorage("reservationDate");
  const storedFormData = getFromLocalStorage("reservationDetails");

  // Redirect if no valid reservation date
  if (reservationDate?.days === 0) {
    navigate("/");
  }

	const bookingTypeInit =
		(reservationDate?.booking_type as FormData["booking_type"]) ||
		storedFormData?.booking_type ||
		defaultFormData.booking_type;

  const initialFormData: FormData = {
		...defaultFormData,
		...(storedFormData || {}),
		booking_type: bookingTypeInit,
		venue_event_date:
			(reservationDate?.venue_event_date &&
				formatDate(reservationDate.venue_event_date)) ||
			storedFormData?.venue_event_date ||
			(bookingTypeInit === "both" && reservationDate?.check_in
				? formatDate(reservationDate.check_in)
				: "") ||
			"",
		check_in:
			formatDate(reservationDate?.check_in) || storedFormData?.check_in || "",
		check_out:
			formatDate(reservationDate?.check_out) || storedFormData?.check_out || "",
		days: reservationDate?.days || storedFormData?.days || 1,
		room_type_filters:
			bookingTypeInit === "venue"
				? []
				: parseRoomTypeFilters(
						reservationDate?.room_type_filters ??
							storedFormData?.room_type_filters,
					),
		venue_event_type: (() => {
			const v = normalizeStoredVenueEventType(
				storedFormData?.venue_event_type as string | undefined,
			);
			if (v) return v;
			if (
				Array.isArray(storedFormData?.venues) &&
				storedFormData.venues.length > 0
			) {
				return "wedding";
			}
			return defaultFormData.venue_event_type;
		})(),
	};

  const [formData, setFormData] = useState<FormData>(
    alignFormDataToBookingType(initialFormData, bookingTypeInit),
  );

  // Keep localStorage synced with formData
  useEffect(() => {
    saveToLocalStorage("reservationDetails", formData, BOOKING_EXPIRATION);
  }, [formData]);

  // Autoload from localStorage when mounted (in case user refreshes)
  useEffect(() => {
    const saved = getFromLocalStorage("reservationDetails") as
      | Partial<FormData>
      | undefined;
    if (saved) {
      const merged = { ...saved };
      if (typeof merged.venue_event_type === "string") {
        merged.venue_event_type = normalizeStoredVenueEventType(
          merged.venue_event_type,
        );
      }
      setFormData((prev) =>
        alignFormDataToBookingType(
          { ...prev, ...merged, booking_type: bookingTypeInit },
          bookingTypeInit,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- align once on mount; bookingTypeInit is from initial reservationDate
  }, []);

  // Redirect if no reservation date (must start from home booking bar)
  useEffect(() => {
    if (!reservationDate || reservationDate.days === 0) {
      navigate("/");
    }
  }, [reservationDate, navigate]);
  // Keep grandTotalPrice in sync when days, rooms, venues, or event type change.
  // Do not clear venue_event_type when venues are empty — guests can pick event type
  // before selecting venues (prices on cards follow this choice).
  useEffect(() => {
    setFormData((prev) => {
      const rooms = prev.rooms ?? [];
      const venues = prev.venues ?? [];
      const venueEventType = prev.venue_event_type || "wedding";
      const totalPrice =
        calculateTotalPrice(rooms) +
        calculateVenuesLineTotal(venues, venueEventType);
      const grandTotalPrice = calculateGrandTotalPrice(
        rooms,
        prev.days,
        venues,
        prev.booking_type,
        venueEventType,
      );

      if (
        totalPrice === prev.totalPrice &&
        grandTotalPrice === prev.grandTotalPrice
      ) {
        return prev;
      }

      return { ...prev, totalPrice, grandTotalPrice };
    });
  }, [formData.days, formData.rooms, formData.venues, formData.venue_event_type]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const setSelectedRooms = (rooms: any[]) =>
    setFormData((prev) => {
      const venues = prev.venues ?? [];
      const venueEventType = prev.venue_event_type || "wedding";
      const totalPrice =
        calculateTotalPrice(rooms) +
        calculateVenuesLineTotal(venues, venueEventType);
      const grandTotalPrice = calculateGrandTotalPrice(
        rooms,
        prev.days,
        venues,
        prev.booking_type,
        venueEventType,
      );
      return { ...prev, rooms, totalPrice, grandTotalPrice };
    });

  const setSelectedVenues = (venues: any[]) =>
    setFormData((prev) => {
      const v = venues ?? [];
      const venueEventType = prev.venue_event_type || "wedding";
      const totalPrice =
        calculateTotalPrice(prev.rooms) +
        calculateVenuesLineTotal(v, venueEventType);
      const grandTotalPrice = calculateGrandTotalPrice(
        prev.rooms,
        prev.days,
        v,
        prev.booking_type,
        venueEventType,
      );
      return {
        ...prev,
        venues: v,
        totalPrice,
        grandTotalPrice,
      };
    });

  const setPaymentMethod = (method: string) =>
    setFormData((prev) => ({ ...prev, paymentMethod: method }));

  const setOnlinePaymentPlan = (plan: FormData["onlinePaymentPlan"]) =>
    setFormData((prev) => ({ ...prev, onlinePaymentPlan: plan }));

  const updateFormData = (updates: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  const goToStep = (step: number) =>
    setFormData((prev) => ({ ...prev, current_step: step }));

  const nextStep = () =>
    setFormData((prev) => ({ ...prev, current_step: prev.current_step + 1 }));

  const previousStep = () =>
    setFormData((prev) => ({ ...prev, current_step: prev.current_step - 1 }));

  return {
    formData,
    setFormData,
    handleInputChange,
    setSelectedRooms,
    setSelectedVenues,
    setPaymentMethod,
    setOnlinePaymentPlan,
    updateFormData,
    goToStep,
    nextStep,
    previousStep,
  };
};
