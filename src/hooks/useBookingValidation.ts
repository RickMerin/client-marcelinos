import { FormData, type VenueEventType } from "@/types/booking.types";
import { personalDetailsSchema } from "@/lib/validators/personalDetails.schema";
import { generateReferenceId } from "@/lib/utils/booking.utils";

const VENUE_EVENT_TYPES = new Set<VenueEventType>([
  "wedding",
  "birthday",
  "seminar",
]);

function hasValidVenueEventType(formData: FormData): boolean {
  if (!formData.venues?.length) return true;
  const t = (formData.venue_event_type || "wedding") as VenueEventType;
  return VENUE_EVENT_TYPES.has(t);
}

/**
 * Custom hook for booking form validation logic
 */
export const useBookingValidation = (
  formData: FormData,
  updateFormData: (updates: Partial<FormData>) => void,
) => {
  const personalDetails = {
    firstName: formData.firstName,
    middleName: formData.middleName,
    lastName: formData.lastName,
    gender: formData.gender,
    phone: formData.phone,
    email: formData.email,
    address: formData.address,
  };

  /**
   * Checks if a specific step is complete and valid
   * @param step - The step number to validate
   * @returns boolean indicating if the step is complete
   */
  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: {
        const t = formData.booking_type ?? "room";
        if (t === "room") return formData.rooms.length > 0;
        if (t === "venue") return formData.venues.length > 0;
        /** "both" on the home page: guest may book only rooms, only venues, or both */
        return formData.rooms.length > 0 || formData.venues.length > 0;
      }
      case 2:
        return personalDetailsSchema.safeParse(personalDetails).success;
      case 3: {
        const t = formData.booking_type ?? "room";
        const hasSelection =
          t === "room"
            ? formData.rooms.length > 0
            : t === "venue"
              ? formData.venues.length > 0
              : formData.rooms.length + formData.venues.length > 0;

        if (!hasSelection) return false;
        if (!hasValidVenueEventType(formData)) return false;

        let refId = formData.reference_number;
        if (!refId) {
          refId = generateReferenceId();
          updateFormData({ reference_number: refId });
        }
        return true;
      }
      case 4:
        return formData.paymentMethod !== "";
      default:
        return true;
    }
  };

  /**
   * Validates if the form is ready for submission
   * @returns boolean indicating if the form can be submitted
   */
  const isFormValidForSubmission = (): boolean => {
    return isStepComplete(2) && isStepComplete(4);
  };

  return {
    personalDetails,
    isStepComplete,
    isFormValidForSubmission,
  };
};
