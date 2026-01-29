import { BookingResponse } from "@/types/booking.types";
import { FormData } from "@/types/booking.types";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import { buildBookingPayload } from "@/lib/utils/booking.utils";

/**
 * Custom hook for handling booking submission
 */
export const useBookingSubmission = () => {
  const createBooking = useApiMutation<BookingResponse>("post");

  /**
   * Submits the booking to the API
   * @param formData - The form data to submit
   * @param onSuccess - Callback function called on successful submission
   * @param onError - Callback function called on error
   */
  const submitBooking = async (
    formData: FormData,
    onSuccess?: () => void,
    onError?: (error: unknown) => void
  ) => {
    try {
      await createBooking.mutateAsync({
        url: "/bookings/store",
        body: buildBookingPayload(formData),
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        alert("Failed to complete booking.");
      }
    }
  };

  return {
    submitBooking,
    isSubmitting: createBooking.isPending,
  };
};
