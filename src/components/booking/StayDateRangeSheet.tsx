import { z } from "zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormWrapper } from "@/components/forms/FormWrapper";
import BookingBarSkeleton from "@/components/skeleton/BookingBarSkeleton";
import { getFromLocalStorage } from "@/lib/storage/localStorage";
import { cn } from "@/lib/utils";
import type { BookingKind } from "@/types/booking.types";
import { useBookingBarBlockedSet } from "@/hooks/useBookingBarBlockedSet";
import Modal from "@/components/modals/Modal";
import {
  applyBookingBarOnChangeFields,
  buildBookingBarFields,
  buildSchema,
  persistBarReservation,
} from "@/lib/utils/bookingBarDates";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: BookingKind;
  /** Bumps when `reservationDate` or related storage changes so the form remounts with fresh defaults. */
  storageEpoch: number;
  onApplied?: () => void;
};

/**
 * Stacked layout for the sheet only — the home bar uses `lg:flex-row`; that row
 * squishes check-in, reset, check-out, nights, and the submit into one line and
 * causes overlap inside a max-width ~32rem card.
 */
const sheetFormClass = cn(
  "relative z-10 flex w-full min-w-0 max-w-full flex-col gap-2.5 sm:gap-3.5",
  "[&_label]:w-full [&_label]:text-center",
  "[&_label]:text-gold-light [&_label]:text-[11px] sm:[&_label]:text-[12px] [&_label]:tracking-[0.16em] sm:[&_label]:tracking-[0.2em] [&_label]:uppercase [&_label]:font-medium",
  "[&_.booking-bar-field]:w-full min-w-0",
  "[&_.booking-bar-field>button]:!w-full",
  "[&_.booking-bar-reset>div>button]:shrink-0",
  "[&_.booking-bar-reset]:flex w-full min-w-0 justify-center",
  "[&_.booking-bar-submit]:w-full pt-0.5 sm:pt-1",
  "[&_.booking-bar-submit>button]:!w-full",
  "[&_.booking-bar-field>button]:min-h-10 [&_.booking-bar-field>button]:rounded-[10px] [&_.booking-bar-field>button]:border-cream/40 [&_.booking-bar-field>button]:bg-white/6 [&_.booking-bar-field>button]:text-cream",
);

export function StayDateRangeSheet({
  open,
  onOpenChange,
  kind,
  storageEpoch,
  onApplied,
}: Props) {
  /** Remount form when the sheet opens so defaults match localStorage; must not include `storageEpoch` or every `persistBarReservation` from the form loops ( epoch → key change → remount → effect → persist → … ). */
  const [sheetFormMountKey, setSheetFormMountKey] = useState(0);
  const prevOpen = useRef<boolean | null>(null);
  useEffect(() => {
    if (open && prevOpen.current !== true) {
      setSheetFormMountKey((k) => k + 1);
    }
    prevOpen.current = open;
  }, [open]);

  const reservationDate = useMemo(
    () => (getFromLocalStorage("reservationDate") ?? {}) as Record<string, unknown>,
    [open, storageEpoch, kind],
  );

  const { blockedSet, isLoadingBlocked } = useBookingBarBlockedSet();

  const schema = useMemo(() => buildSchema(kind), [kind]);

  const fields = useMemo(
    () =>
      buildBookingBarFields({
        kind,
        reservationDate,
        blockedSet,
      }),
    [kind, reservationDate, blockedSet],
  );

  const handleSubmit = (values: z.infer<typeof schema>) => {
    const checkIn = values.check_in as Date;
    const checkOut = values.check_out as Date;
    persistBarReservation(kind, checkIn, checkOut);
    onApplied?.();
    onOpenChange(false);
  };

  const onChangeFields = useCallback(
    (values: {
      check_in?: Date;
      check_out?: Date;
      days?: number;
      venue_event_date?: Date;
    }) =>
      applyBookingBarOnChangeFields(kind, {
        check_in: values.check_in,
        check_out: values.check_out,
        days: values.days,
        venue_event_date: values.venue_event_date,
      }),
    [kind],
  );

  const isSubmitDisabled = useCallback(
    (values: z.infer<typeof schema>) => {
      if (!values.check_in || !values.check_out) return true;
      return false;
    },
    [],
  );

  const r = reservationDate as { check_in?: string };
  const showSkeleton = !r.check_in && isLoadingBlocked;

  return (
    <Modal
    open={open}
    onClose={() => onOpenChange(false)}
    contentClassName="
      relative 
  
      w-[calc(100vw-2rem)] 
      max-w-[28rem]   /* 🔥 smaller modal */
  
      mx-auto
  
      rounded-xl 
      border border-[#d7c089]/25 
      bg-[#0c2c27]/95 
  
      px-3 py-3
      text-center text-cream 
      shadow-2xl backdrop-blur-sm
    "
  >
    {/* HEADER */}
    <div className="mx-auto mb-2 max-w-md rounded-lg border border-white/16 bg-white/6 px-3 py-2 text-center">
      <p className="text-[15px] font-semibold tracking-[0.18em] text-gold-light/90 uppercase">
        Welcome
      </p>
  
      <h2 className="mt-0.5 font-display text-xl font-semibold text-cream">
        Stay dates
      </h2>
  
      <p className="mt-1 text-[11px] text-cream/75 leading-tight">
        Select check-in and check-out.
      </p>
    </div>
  
    {/* FORM */}
    <div className="mx-auto max-w-md rounded-lg border border-white/16 bg-white/6 px-2.5 py-2.5">
      {showSkeleton ? (
        <BookingBarSkeleton />
      ) : (
        <FormWrapper
          key={`${kind}-${sheetFormMountKey}`}
          schema={schema}
          fields={fields}
          onSubmit={handleSubmit}
          submitLabel="Save dates"
          blockedDateStayMode={
            kind === "venue" ? "single_calendar" : "nights"
          }
          isSubmitDisabled={isSubmitDisabled}
          className={cn(
            sheetFormClass,
            "gap-2 [&_label]:text-[10px] [&_.booking-bar-field>button]:min-h-9"
          )}
          onChangeFields={onChangeFields}
        />
      )}
    </div>
  </Modal>
  );
}
