import { z } from "zod";
import { FormWrapper } from "./FormWrapper";

// Define schema
const bookingSchema = z.object({
  days: z.number().min(1, "Invalid number of days"),
  check_in: z.preprocess(
    (val) =>
      val === "" || val == null
        ? undefined
        : typeof val === "string" ||
          typeof val === "number" ||
          val instanceof Date
        ? new Date(val)
        : undefined,
    z.date("Select check-in date")
  ),
  check_out: z.preprocess(
    (val) =>
      val === "" || val == null
        ? undefined
        : typeof val === "string" ||
          typeof val === "number" ||
          val instanceof Date
        ? new Date(val)
        : undefined,
    z.date("Select check-in date").optional()
  ),
});

export default function BookingForm() {
  const fields = [
    {
      name: "days", // ✅ must match schema
      type: "counter" as const,
      label: "Number of Days",
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
    },
  ];

  const handleSubmit = (values: z.infer<typeof bookingSchema>) => {
    console.log("Form submitted:", values); // should log { days: <number> }
  };

  return (
    <FormWrapper
      schema={bookingSchema}
      fields={fields}
      onSubmit={handleSubmit}
      className="space-y-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
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
