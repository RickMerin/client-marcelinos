import { z } from "zod";
import { FormWrapper } from "./FormWrapper";
import { useNavigate } from "react-router-dom";

/**
 * Defines a schema for booking data using the zod library.
 * @returns A zod object schema for booking data with the following properties:
 * - days: A number representing the number of days for the booking (minimum 1).
 * - check_in: A preprocessed date value for the check-in date.
 * - check_out: A preprocessed date value for the check-out date (optional).
 * - rooms: An array of numbers representing the selected rooms (minimum 1).
 */
const bookingSchema = z.object({
  days: z.coerce.number().min(1, "Invalid number of days"),
  check_in: z.coerce.date({
    error: "Select check-in date",
  }),
  check_out: z.coerce.date().optional(),
  rooms: z.array(z.number()).min(1, "Select at least one room").optional(),
});

export default function BookingForm() {
  /**
   * An array of field objects representing different input fields for a form.
   */
  const fields = [
    {
      name: "days", // ✅ must match schema
      type: "counter" as const,
      label: "Number of Day(s)",
      inputMode: "numeric",
      pattern: "[0-9]*",
    },
    {
      name: "check_in", // ✅ must match schema
      placeholder: "Select check-in date",
      type: "calendar" as const,
      label: "Check-in Date",
    },
    {
      name: "check_out", // ❌ does not match schema
      placeholder: "Auto-calculated",
      type: "date" as const,
      label: "Check-out Date",
      readOnly: true,
      className: "bg-gray-300/50 cursor-not-allowed text-center",
    },
  ];

  // Create a browser history object for navigation purposes
  const navigate = useNavigate();

  const handleSubmit = (values: z.infer<typeof bookingSchema>) => {
    navigate("/create-booking");
    console.log("Form submitted:", values);
  };

  return (
    <FormWrapper
      schema={bookingSchema}
      fields={fields}
      onSubmit={handleSubmit}
      className="space-y-6 px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-4 items-center justify-center"
      submitLabel="Book Now"
      onChangeFields={(values) => {
        if (values.days && values.check_in) {
          const checkInDate = new Date(values.check_in);
          const checkOutDate = new Date(
            checkInDate.getTime() + values.days * 24 * 60 * 60 * 1000
          );

          return { check_out: checkOutDate };
        }
        return { check_out: undefined };
      }}
    />
  );
}
