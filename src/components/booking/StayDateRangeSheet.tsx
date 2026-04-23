import { z } from "zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormWrapper } from "@/components/forms/FormWrapper";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import BookingBarSkeleton from "@/components/skeleton/BookingBarSkeleton";
import { getFromLocalStorage } from "@/lib/storage/localStorage";
import { cn } from "@/lib/utils";
import type { BookingKind } from "@/types/booking.types";
import { useBookingBarBlockedSet } from "@/hooks/useBookingBarBlockedSet";
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
  "relative z-10 flex w-full min-w-0 max-w-full flex-col gap-3 sm:gap-4",
  "[&_label]:w-full [&_label]:text-center",
  "[&_label]:text-gold-light [&_label]:text-[13px] [&_label]:tracking-[0.2em] [&_label]:uppercase [&_label]:font-medium",
  "[&_.booking-bar-field]:w-full min-w-0",
  "[&_.booking-bar-field>button]:!w-full",
  "[&_.booking-bar-reset>div>button]:shrink-0",
  "[&_.booking-bar-reset]:flex w-full min-w-0 justify-center",
  "[&_.booking-bar-submit]:w-full pt-1",
  "[&_.booking-bar-submit>button]:!w-full",
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="center"
        className="border-cream/15 bg-ink p-0 text-cream gap-0 shadow-[0_24px_80px_rgba(0,0,0,0.45)] [scrollbar-gutter:stable]"
      >
        <SheetHeader className="space-y-1 border-b border-cream/[0.07] px-4 py-4 text-left sm:px-5 sm:pr-12">
          <SheetTitle className="font-display text-lg font-medium text-cream pr-2 sm:text-xl">
            Stay dates
          </SheetTitle>
          <SheetDescription className="text-cream/70 text-sm leading-relaxed">
            Select check-in and check-out. Blocked dates match the home booking
            bar.
          </SheetDescription>
        </SheetHeader>

        <div className="px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pb-6 sm:pt-4">
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
              className={sheetFormClass}
              onChangeFields={onChangeFields}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
