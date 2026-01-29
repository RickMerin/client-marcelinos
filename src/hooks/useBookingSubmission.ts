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
   * @param onSuccess - Callback with API response (e.g. to redirect to receipt)
   * @param onError - Callback function called on error
   */
  const submitBooking = async (
    formData: FormData,
    onSuccess?: (response: BookingResponse) => void,
    onError?: (error: unknown) => void,
  ) => {
    try {
      const response = (await createBooking.mutateAsync({
        url: "/bookings",
        body: buildBookingPayload(formData),
      })) as BookingResponse;

      if (onSuccess) {
        onSuccess(response);
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
};;
