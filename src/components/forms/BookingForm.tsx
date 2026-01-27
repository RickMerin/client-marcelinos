import { z } from "zod";
import { FormWrapper } from "./FormWrapper";
import { useNavigate } from "react-router-dom";

const bookingSchema = z.object({
  days: z.coerce.number().min(1, "Invalid number of days"),
  check_in: z.coerce.date({ error: "Select check-in date" }),
  check_out: z.coerce.date().optional(),
  rooms: z.array(z.number()).min(1, "Select at least one room").optional(),
});

export default function BookingForm() {
  const navigate = useNavigate();
  const reservationDate = JSON.parse(
    localStorage.getItem("reservationDate") || "{}"
  );

  const fields = [
    {
      name: "days",
      type: "counter" as const,
      label: "Number of Day(s)",
      value: reservationDate.days || 1,
    },
    {
      name: "check_in",
      type: "calendar" as const,
      label: "Check-in Date",
      placeholder: "Select check-in date",
      value: reservationDate.check_in ? new Date(reservationDate.check_in) : "",
    },
    {
      name: "check_out",
      type: "date" as const,
      label: "Check-out Date",
      readOnly: true,
      className: "bg-gray-300/50 cursor-not-allowed text-center",
      value: reservationDate.check_out
        ? new Date(reservationDate.check_out)
        : "",
    },
  ];

  const handleSubmit = (values: z.infer<typeof bookingSchema>) => {
    localStorage.setItem("reservationDate", JSON.stringify(values));
    navigate("/create-booking");
  };

  return (
    <div>

    <FormWrapper
      schema={bookingSchema}
      fields={fields}
      onSubmit={handleSubmit}
      submitLabel="Book Now"
      className="space-y-6 relative z-10  px-10 py-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-4 items-center justify-center"
      onChangeFields={(values) => {
        if (values.days && values.check_in) {
          const checkInDate = new Date(values.check_in);
          const checkOutDate = new Date(
            checkInDate.getTime() + values.days * 24 * 60 * 60 * 1000
          );
          return { check_out: checkOutDate };
        }
        return {};
      }}
    />
    </div>
  );
}
