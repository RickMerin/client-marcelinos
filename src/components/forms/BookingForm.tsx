import { z } from "zod";
import { useMemo, useState } from "react";
import { FormWrapper } from "./FormWrapper";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { getFromLocalStorage } from "@/lib/storage/localStorage";
import type { BookingKind } from "@/types/booking.types";
import { cn } from "@/lib/utils";
import { useBookingBarBlockedSet } from "@/hooks/useBookingBarBlockedSet";
import {
  applyBookingBarOnChangeFields,
  buildBookingBarFields,
  buildSchema,
  deriveBookingKindFromCart,
  persistBarReservation,
} from "@/lib/utils/bookingBarDates";
import BookingBarSkeleton from "@/components/skeleton/BookingBarSkeleton";

const KIND_OPTIONS: { value: BookingKind; label: string }[] = [
  { value: "room", label: "Room Stay" },
  { value: "venue", label: "Venue Only" },
  { value: "both", label: "Room + Venue" },
];

export default function BookingForm() {
  const navigate = useNavigate();

  const reservationDate = getFromLocalStorage("reservationDate") ?? {};
  const cartDrivenKind = deriveBookingKindFromCart();

  const [kind, setKind] = useState<BookingKind>(
    (cartDrivenKind ||
      (reservationDate.booking_type as BookingKind) ||
      "room") as BookingKind,
  );

  const { blockedSet, isLoadingBlocked } = useBookingBarBlockedSet();

  const schema = useMemo(() => buildSchema(kind), [kind]);

  const fields = useMemo(
    () =>
      buildBookingBarFields({
        kind,
        reservationDate: reservationDate as Record<string, unknown>,
        blockedSet,
      }),
    [kind, reservationDate, blockedSet],
  );

  const handleSubmit = (values: z.infer<typeof schema>) => {
    const checkIn = values.check_in as Date;
    const checkOut = values.check_out as Date;
    persistBarReservation(kind, checkIn, checkOut);
    navigate("/create-booking");
  };

  const formGridClass = cn(
    "relative z-10 flex-1 min-w-0",
    "flex flex-col lg:flex-row lg:items-stretch",
    "[&_label]:w-full [&_label]:justify-center [&_label]:text-center",
    "[&_label]:text-gold-light [&_label]:text-[13px] [&_label]:tracking-[0.2em] [&_label]:uppercase [&_label]:font-medium",
  );

  return (
    <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch">
      <div className="booking-bar-segment flex flex-col gap-1.5 px-5 py-5 lg:py-6 border-b lg:border-b-0 lg:border-r border-cream/[0.07] xl:w-75 items-center text-center">
        <span className="text-gold-light text-[13px] tracking-[0.2em] uppercase font-medium">
          Booking Type
        </span>
        <div className="booking-kind-select-wrap w-full max-w-full">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as BookingKind)}
            className="booking-kind-select bg-transparent border-none outline-none font-display text-cream w-full min-w-0 cursor-pointer appearance-none text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {KIND_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-ink text-cream"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="booking-kind-chevron size-4 text-cream/40 pointer-events-none" />
        </div>
      </div>

      {!reservationDate.check_in && isLoadingBlocked ? (
        <BookingBarSkeleton />
      ) : (
        <div className="flex flex-col flex-1 min-w-0">
          <FormWrapper
            key={kind}
            schema={schema}
            fields={fields}
            onSubmit={handleSubmit}
            submitLabel="Check Availability"
            blockedDateStayMode={kind === "venue" ? "single_calendar" : "nights"}
            isSubmitDisabled={(values) => {
              if (!values.check_in || !values.check_out) return true;
              return false;
            }}
            className={formGridClass}
            onChangeFields={(values) =>
              applyBookingBarOnChangeFields(kind, {
                check_in: values.check_in as Date | undefined,
                check_out: values.check_out as Date | undefined,
                days: values.days as number | undefined,
                venue_event_date: values.venue_event_date as Date | undefined,
              })
            }
          />
        </div>
      )}
    </div>
  );
}
