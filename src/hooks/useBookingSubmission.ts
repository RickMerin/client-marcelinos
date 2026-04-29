import {
  BookingResponse,
  BookingConflictResponse,
} from "@/types/booking.types";
import { FormData } from "@/types/booking.types";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import {
  buildBookingPayload,
  type BuildBookingPayloadOptions,
} from "@/lib/utils/booking.utils";
import toast from "@/lib/logger/toast";

type ErrorWithResponse = Error & {
  response?: {
    data?: BookingConflictResponse & {
      errors?: Record<string, string[]>;
    };
  };
};

function formatConflictMessage(error: ErrorWithResponse): string {
  const data = error.response?.data;
  const fallbackMessage = "Failed to complete booking.";
  const msg = (data?.message || error.message || fallbackMessage).trim();
  const validationErrors = data?.errors;

  if (validationErrors && Object.keys(validationErrors).length > 0) {
    const flatErrors = Object.values(validationErrors)
      .flat()
      .map((entry) => String(entry).trim())
      .filter(Boolean);

    const overlapError = flatErrors.find((entry) =>
      /overlap|already have an active booking/i.test(entry),
    );
    const duplicateDetailsError = flatErrors.find((entry) =>
      /same room and venue details.*already on file/i.test(entry),
    );

    if (duplicateDetailsError) {
      return `${duplicateDetailsError}\nIf you meant a different selection, change rooms, venues, or dates and submit again.`;
    }

    if (overlapError) {
      return `${overlapError}\nPlease choose a different date range or use another email if this is a new reservation.`;
    }

    return flatErrors.join("\n");
  }

  if (data?.error === "room_unavailable") {
    const roomNames = data.conflicts?.rooms
      ?.map((room) => room.name)
      .filter(Boolean);
    const roomSuffix = roomNames?.length
      ? `\nRooms: ${roomNames.join(", ")}`
      : "";
    return `${msg}${roomSuffix}\nPlease refresh availability and choose a different room.`;
  }

  if (!data?.conflicts) return msg;
  const parts: string[] = [msg];
  if (data.conflicts.rooms?.length) {
    parts.push(`Rooms: ${data.conflicts.rooms.map((r) => r.name).join(", ")}`);
  }
  if (data.conflicts.room_lines?.length) {
    parts.push(
      data.conflicts.room_lines
        .map(
          (l) =>
            `${l.room_type} (${l.requested} requested, ${l.available} available)`,
        )
        .join("; "),
    );
  }
  if (data.conflicts.venues?.length) {
    parts.push(
      `Venues: ${data.conflicts.venues.map((v) => v.name).join(", ")}`,
    );
  }
  return parts.join("\n");
}

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
    security?: BuildBookingPayloadOptions,
  ) => {
    try {
      const response = (await createBooking.mutateAsync({
        url: "/bookings",
        body: buildBookingPayload(formData, security),
      })) as BookingResponse;

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        const message =
          error instanceof Error
            ? formatConflictMessage(error as ErrorWithResponse)
            : "Failed to complete booking.";
        toast.error({ content: message });
      }
    }
  };

  return {
    submitBooking,
    isSubmitting: createBooking.isPending,
  };
};
