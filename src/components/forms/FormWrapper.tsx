import * as React from "react";
import { useForm, SubmitHandler, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarWithDisabledReasons as Calendar } from "@/components/calendar/CalendarWithDisabledReasons";

import { CalendarDays, Minus, Plus, RotateCcw } from "lucide-react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { toBlockedDateKey } from "@/lib/utils/booking.utils";
import {
  stayNightRangeModifiers,
  BOOKING_STAY_RANGE_MODIFIERS_CLASS_NAMES,
} from "@/lib/calendar/stayRange";

/** Local calendar date as YYYY-MM-DD (avoid `toISOString()` shifting the day in non-UTC zones). */
function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Calendar days between two local dates (check-out − check-in). Same day → 0. */
function diffDays(a: Date, b: Date): number {
  const sa = startOfDay(a).getTime();
  const sb = startOfDay(b).getTime();
  return Math.round((sb - sa) / 86400000);
}

/**
 * Returns true if any calendar day in the booking window hits a blocked date.
 * - `nights`: `numberOfNights` is the stay length in nights; we check `nights + 1` calendar days
 *   (check-in day through morning check-out day), same as room stays.
 * - `single_calendar`: same-day event / venue — only the check-in calendar day is checked.
 */
function stayOverlapsBlocked(
  checkIn: Date,
  numberOfNights: number,
  blockedDates: Date[],
  mode: "nights" | "single_calendar" = "nights",
): boolean {
  const blockedSet = new Set(blockedDates.map(toDayKey));
  const start = new Date(
    checkIn.getFullYear(),
    checkIn.getMonth(),
    checkIn.getDate(),
  );
  const maxI = mode === "single_calendar" ? 0 : numberOfNights;
  for (let i = 0; i <= maxI; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (blockedSet.has(toDayKey(d))) return true;
  }
  return false;
}

/** True if choosing this date as check-in with `nights` would make the stay overlap a blocked date */
function isInvalidCheckIn(
  date: Date,
  nights: number,
  blockedDates: Date[],
  mode: "nights" | "single_calendar" = "nights",
): boolean {
  return stayOverlapsBlocked(date, nights, blockedDates, mode);
}

export type FormWrapperField = {
  name: string;
  /** Applied to the wrapping FormItem (e.g. `sm:col-span-2` for full-width row). */
  itemClassName?: string;
  label?: string;
  placeholder?: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "textarea"
    | "counter"
    | "calendar"
    | "select"
    | "drawer"
    | "date"
    | "radio"
    | "display"
    | "reset";
  className?: string;
  onClick?: (form: any) => void;
  disabled?: boolean;
  readOnly?: boolean;
  options?: any[];
  value?: any;
  /** For `calendar`: `stay` = multi-day stay rules; `single` = one calendar day (e.g. venue event). */
  calendarVariant?: "stay" | "single";
  /**
   * For `calendar` on `check_out`: minimum calendar days after check-in (0 = same day OK, 1 = at least one night).
   */
  minCheckOutOffsetDays?: number;
};

export type BlockedDateStayMode = "nights" | "single_calendar";

type CaptchaConfig = {
  enabled: boolean;
  siteKey: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  className?: string;
  errorMessage?: string;
};

interface FormWrapperProps<T extends z.ZodType<any, any>> {
  schema: T;
  fields: FormWrapperField[];
  onSubmit: SubmitHandler<z.infer<T>>;
  submitLabel?: string;
  className?: string;
  captcha?: CaptchaConfig;
  onChangeFields?: (values: Partial<z.infer<T>>) => Partial<z.infer<T>>;
  /** When true, submit button is disabled (visually and functionally) */
  isSubmitDisabled?: (values: z.infer<T>) => boolean;
  /**
   * How to test overlap with property-wide blocked dates.
   * `nights` = room-style multi-night stay (check-in day through check-out morning).
   * `single_calendar` = venue/event same calendar day (check-in date only).
   */
  blockedDateStayMode?: BlockedDateStayMode;
}

export function FormWrapper<T extends z.ZodType<any, any>>({
  schema,
  fields,
  onSubmit,
  submitLabel = "Submit",
  className,
  onChangeFields,
  isSubmitDisabled,
  blockedDateStayMode = "nights",
}: FormWrapperProps<T>) {
  /** Which calendar popover is open (field name), so multiple calendars do not share one `open` flag. */
  const [openCalendarField, setOpenCalendarField] = React.useState<
    string | null
  >(null);
  const suppressNextCalendarCloseRef = React.useRef<string | null>(null);

  // ✅ derive default values from fields
  const defaultValues = Object.fromEntries(
    fields.map((f) => [
      f.name,
      f.value ?? (f.type === "counter" ? 1 : f.type === "display" ? "" : ""),
    ]),
  ) as z.output<T>;

  React.useEffect(() => {
    const openCheckInCalendar = () => setOpenCalendarField("check_in");
    window.addEventListener("open-checkin", openCheckInCalendar);
    return () => {
      window.removeEventListener("open-checkin", openCheckInCalendar);
    };
  }, []);

  const form = useForm<z.output<T>>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  const days = form.watch("days" as Path<z.output<T>>);
  const checkIn = form.watch("check_in" as Path<z.output<T>>);
  const checkOut = form.watch("check_out" as Path<z.output<T>>);
  const venueEventDate = form.watch("venue_event_date" as Path<z.output<T>>);
  const allValues = form.watch();
  const submitDisabled = isSubmitDisabled?.(allValues as z.infer<T>) ?? false;

  // ✅ dynamically update computed fields like check_out
  React.useEffect(() => {
    if (!onChangeFields) return;
    const updated = onChangeFields({
      days,
      check_in: checkIn,
      check_out: checkOut,
      venue_event_date: venueEventDate,
    } as unknown as Partial<z.infer<T>>);
    if (updated) {
      Object.entries(updated).forEach(([key, val]) => {
        const current = form.getValues(key as Path<z.output<T>>);
        if (current === val) return;
        form.setValue(key as Path<z.output<T>>, val as any, {
          shouldValidate: false,
        });
      });
    }
  }, [days, checkIn, checkOut, venueEventDate, onChangeFields]);

  /** Laravel `ApiResponse::success($rows)` returns `{ success, data: [...] }`. */
  type BlockedDatesResponse = {
    success?: boolean;
    data?: Array<{ date: string; reason?: string | null }>;
    blocked_dates?: Array<{ date: string; reason?: string | null }>;
  };

  const { data } = useApiQuery<BlockedDatesResponse>(
    ["blocked-dates"],
    "/blocked-dates",
  );

  const blockedDateRows = React.useMemo(() => {
    const rows = data?.data ?? data?.blocked_dates ?? [];
    const list = Array.isArray(rows) ? rows : [];
    return list
      .map((row) => ({
        ...row,
        date: toBlockedDateKey(row.date),
      }))
      .filter((row) => row.date);
  }, [data]);

  const blockedDates = React.useMemo(() => {
    return blockedDateRows.map((d) => new Date(d.date + "T12:00:00"));
  }, [blockedDateRows]);

  const blockedReasons = React.useMemo(() => {
    const map: Record<string, string> = {};
    blockedDateRows.forEach((d) => {
      if (d?.date) {
        map[d.date] = d.reason ?? "Unavailable";
      }
    });
    return map;
  }, [blockedDateRows]);

  const todayStart = React.useMemo(
    () => new Date(new Date().setHours(0, 0, 0, 0)),
    [],
  );

  // Calculate the earliest available booking date based on current time
  const earliestAvailableDate = React.useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    // If current time is 9 PM (21:00) or later, bookings start from tomorrow
    if (currentHour >= 21) {
      const tomorrow = new Date(todayStart);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    // Otherwise, bookings can start from today
    return todayStart;
  }, [todayStart]);

  const overlapNights = React.useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const checkInDate =
      checkIn && typeof checkIn === "object" && "getTime" in checkIn
        ? (checkIn as Date)
        : new Date(checkIn as string | number);
    const checkOutDate =
      checkOut && typeof checkOut === "object" && "getTime" in checkOut
        ? (checkOut as Date)
        : new Date(checkOut as string | number);
    const ci = startOfDay(checkInDate);
    const co = startOfDay(checkOutDate);
    if (co < ci) return null;
    return diffDays(ci, co);
  }, [checkIn, checkOut]);

  // Validate that stay range does not overlap any blocked date; set/clear error on check_in
  React.useEffect(() => {
    if (!checkIn || blockedDates.length === 0) {
      form.clearErrors("check_in" as Path<z.output<T>>);
      return;
    }
    if (overlapNights === null) {
      form.clearErrors("check_in" as Path<z.output<T>>);
      return;
    }
    const checkInDate =
      checkIn && typeof checkIn === "object" && "getTime" in checkIn
        ? (checkIn as Date)
        : new Date(checkIn as string | number);
    const nightsForOverlap =
      blockedDateStayMode === "single_calendar" ? 0 : overlapNights;
    if (
      stayOverlapsBlocked(
        checkInDate,
        nightsForOverlap,
        blockedDates,
        blockedDateStayMode,
      )
    ) {
      const msg =
        blockedDateStayMode === "single_calendar"
          ? "This date is blocked for bookings. Please choose another day."
          : "Your stay overlaps blocked dates. Please choose a different check-in or fewer days so your stay is continuous.";
      form.setError("check_in" as Path<z.output<T>>, {
        type: "manual",
        message: msg,
      });
    } else {
      form.clearErrors("check_in" as Path<z.output<T>>);
    }
  }, [checkIn, overlapNights, blockedDates, blockedDateStayMode, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as Path<z.output<T>>}
            render={({ field: inputField }) => (
              <FormItem className={cn(field.itemClassName)}>
                {field.label && <FormLabel>{field.label}</FormLabel>}
                <FormControl>
                  {(() => {
                    switch (field.type) {
                      case "textarea":
                        return (
                          <Textarea
                            {...inputField}
                            placeholder={field.placeholder}
                          />
                        );

                      case "counter":
                        return (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              onClick={() =>
                                form.setValue(
                                  field.name as Path<z.output<T>>,
                                  Math.max(
                                    1,
                                    (form.getValues(
                                      field.name as Path<z.output<T>>,
                                    ) || 1) - 1,
                                  ) as any,
                                )
                              }
                            >
                              <Minus />
                            </Button>
                            <Input
                              {...inputField}
                              type="number"
                              className="text-center"
                              min={1}
                              onChange={(e) =>
                                inputField.onChange(Number(e.target.value))
                              }
                            />
                            <Button
                              type="button"
                              onClick={() =>
                                form.setValue(
                                  field.name as Path<z.output<T>>,
                                  ((form.getValues(
                                    field.name as Path<z.output<T>>,
                                  ) || 0) + 1) as any,
                                )
                              }
                            >
                              <Plus />
                            </Button>
                          </div>
                        );

                      case "calendar": {
                        const variant = field.calendarVariant ?? "stay";
                        const minOff = field.minCheckOutOffsetDays ?? 1;

                        const nightsForStayCandidate = (
                          candidate: Date,
                          fieldName: string,
                        ): number => {
                          if (fieldName === "check_out") {
                            const ci = form.getValues(
                              "check_in" as Path<z.output<T>>,
                            );
                            if (!ci) return 0;
                            const ciDate =
                              ci &&
                              typeof ci === "object" &&
                              "getTime" in (ci as object)
                                ? (ci as Date)
                                : new Date(ci as string);
                            return Math.max(
                              0,
                              diffDays(
                                startOfDay(ciDate),
                                startOfDay(candidate),
                              ),
                            );
                          }
                          if (fieldName === "check_in") {
                            const co = form.getValues(
                              "check_out" as Path<z.output<T>>,
                            );
                            if (co) {
                              const coDate =
                                co &&
                                typeof co === "object" &&
                                "getTime" in (co as object)
                                  ? (co as Date)
                                  : new Date(co as string);
                              return Math.max(
                                0,
                                diffDays(
                                  startOfDay(candidate),
                                  startOfDay(coDate),
                                ),
                              );
                            }
                          }
                          return typeof days === "number" && days >= 1
                            ? days
                            : 1;
                        };

                        const isDateDisabledForField = (date: Date) => {
                          const d = new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate(),
                          );
                          if (d < earliestAvailableDate) return true;
                          if (
                            blockedDates.some(
                              (b) => toDayKey(b) === toDayKey(d),
                            )
                          )
                            return true;
                          if (variant === "single") {
                            if (field.name === "venue_event_date") {
                              const ci = form.getValues(
                                "check_in" as Path<z.output<T>>,
                              );
                              const co = form.getValues(
                                "check_out" as Path<z.output<T>>,
                              );
                              if (ci && co) {
                                const start = new Date(ci as Date | string);
                                const end = new Date(co as Date | string);
                                start.setHours(0, 0, 0, 0);
                                end.setHours(0, 0, 0, 0);
                                const t = d.getTime();
                                if (t < start.getTime() || t > end.getTime())
                                  return true;
                              }
                            }
                            return false;
                          }
                          if (field.name === "check_out") {
                            const ci = form.getValues(
                              "check_in" as Path<z.output<T>>,
                            );
                            if (!ci) return true;
                            const ciDate =
                              ci &&
                              typeof ci === "object" &&
                              "getTime" in (ci as object)
                                ? (ci as Date)
                                : new Date(ci as string);
                            const ciD = startOfDay(ciDate);
                            const n = diffDays(ciD, d);
                            if (n < minOff) return true;
                            const nightsForOverlap =
                              blockedDateStayMode === "single_calendar" ? 0 : n;
                            return stayOverlapsBlocked(
                              ciD,
                              nightsForOverlap,
                              blockedDates,
                              blockedDateStayMode,
                            );
                          }
                          if (field.name === "check_in") {
                            // We allow selecting any valid check-in date regardless of current check-out
                          }
                          const numNights = nightsForStayCandidate(
                            d,
                            field.name,
                          );
                          const nightsForOverlap =
                            blockedDateStayMode === "single_calendar"
                              ? 0
                              : numNights;
                          return isInvalidCheckIn(
                            d,
                            nightsForOverlap,
                            blockedDates,
                            blockedDateStayMode,
                          );
                        };
                        const isOverlapInvalidForField = (date: Date) => {
                          const d = new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate(),
                          );
                          if (d < earliestAvailableDate) return false;
                          if (
                            blockedDates.some(
                              (b) => toDayKey(b) === toDayKey(d),
                            )
                          )
                            return false;
                          if (variant === "single") return false;
                          if (field.name === "check_out") {
                            const ci = form.getValues(
                              "check_in" as Path<z.output<T>>,
                            );
                            if (!ci) return false;
                            const ciDate =
                              ci &&
                              typeof ci === "object" &&
                              "getTime" in (ci as object)
                                ? (ci as Date)
                                : new Date(ci as string);
                            const ciD = startOfDay(ciDate);
                            const n = diffDays(ciD, d);
                            if (n < minOff) return false;
                            return stayOverlapsBlocked(
                              ciD,
                              blockedDateStayMode === "single_calendar" ? 0 : n,
                              blockedDates,
                              blockedDateStayMode,
                            );
                          }
                          if (field.name === "check_in") {
                            return false;
                          }
                          const numNights = nightsForStayCandidate(
                            d,
                            field.name,
                          );
                          const nightsForOverlap =
                            blockedDateStayMode === "single_calendar"
                              ? 0
                              : numNights;
                          return isInvalidCheckIn(
                            d,
                            nightsForOverlap,
                            blockedDates,
                            blockedDateStayMode,
                          );
                        };
                        const showStayRange =
                          variant === "stay" &&
                          (field.name === "check_in" ||
                            field.name === "check_out") &&
                          checkIn &&
                          checkOut;
                        const stayRangeModifiers = showStayRange
                          ? stayNightRangeModifiers(checkIn, checkOut)
                          : undefined;
                        return (
                          <Popover
                            open={openCalendarField === field.name}
                            onOpenChange={(o) =>
                              suppressNextCalendarCloseRef.current ===
                                field.name && !o
                                ? (suppressNextCalendarCloseRef.current = null)
                                : setOpenCalendarField(o ? field.name : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  " font-normal h-12",
                                  field.itemClassName?.includes(
                                    "booking-bar-field",
                                  ) && "w-full",
                                  !inputField.value && "text-muted-foreground",
                                  field.className,
                                )}
                              >
                                {inputField.value ? (
                                  new Date(inputField.value).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    },
                                  )
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <CalendarDays size={16} />
                                    <span>
                                      {field.placeholder || "Pick date"}
                                    </span>
                                  </div>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="center"
                              className="-mt-7.5 p-0"
                            >
                              <Calendar
                                defaultMonth={
                                  field.name === "check_out"
                                    ? (() => {
                                        const ci = form.getValues(
                                          "check_in" as Path<z.output<T>>,
                                        );
                                        return ci
                                          ? new Date(ci as string | Date)
                                          : inputField.value
                                            ? new Date(inputField.value)
                                            : undefined;
                                      })()
                                    : inputField.value
                                      ? new Date(inputField.value)
                                      : undefined
                                }
                                mode="single"
                                selected={inputField.value}
                                onSelect={(date) => {
                                  const selectedDate = date
                                    ? startOfDay(new Date(date))
                                    : undefined;

                                  if (
                                    field.name === "check_in" &&
                                    selectedDate
                                  ) {
                                    // Set check-in date
                                    inputField.onChange(selectedDate);

                                    // Auto-calculate and set check-out
                                    const minOff =
                                      field.minCheckOutOffsetDays ?? 1;
                                    const newCo = new Date(selectedDate);
                                    newCo.setDate(newCo.getDate() + minOff);

                                    form.setValue(
                                      "check_out" as Path<z.output<T>>,
                                      newCo as any,
                                      { shouldValidate: true },
                                    );
                                    suppressNextCalendarCloseRef.current =
                                      "check_out";
                                    setOpenCalendarField("check_out");
                                  } else if (
                                    field.name === "check_out" &&
                                    selectedDate
                                  ) {
                                    const ci = form.getValues(
                                      "check_in" as Path<z.output<T>>,
                                    );

                                    // Validate check-out relative to check-in
                                    let finalCheckOut = selectedDate;
                                    if (ci) {
                                      const ciDate = new Date(
                                        ci as string | Date,
                                      );
                                      const ciNorm = startOfDay(ciDate);
                                      const minOff =
                                        field.minCheckOutOffsetDays ?? 1;
                                      const dayDiff = diffDays(
                                        ciNorm,
                                        selectedDate,
                                      );

                                      // Only adjust if selected date violates minimum offset
                                      if (dayDiff < minOff) {
                                        finalCheckOut = new Date(ciNorm);
                                        finalCheckOut.setDate(
                                          finalCheckOut.getDate() + minOff,
                                        );
                                      }
                                    }

                                    // Apply the final validated date
                                    inputField.onChange(finalCheckOut);
                                    suppressNextCalendarCloseRef.current = null;
                                    setOpenCalendarField(null);
                                  } else {
                                    suppressNextCalendarCloseRef.current = null;
                                    setOpenCalendarField(null);
                                  }
                                }}
                                disabled={isDateDisabledForField}
                                blockedReasons={blockedReasons}
                                overlapInvalidReason={
                                  variant === "single"
                                    ? "This date is unavailable or outside your stay."
                                    : "Your stay would include blocked dates. Pick another check-in or fewer days."
                                }
                                isOverlapInvalid={isOverlapInvalidForField}
                                {...(stayRangeModifiers
                                  ? {
                                      modifiers: stayRangeModifiers,
                                      modifiersClassNames:
                                        BOOKING_STAY_RANGE_MODIFIERS_CLASS_NAMES,
                                    }
                                  : {})}
                              />
                            </PopoverContent>
                          </Popover>
                        );
                      }
                      //reset button//
                      case "reset":
                        return (
                          <div
                            className={cn(
                              "flex justify-center items-center",
                              field.itemClassName?.includes("booking-bar-reset")
                                ? "mt-0 w-full min-h-12 lg:min-h-13 lg:flex-1"
                                : "mt-5",
                            )}
                          >
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "h-12 w-12 rounded-full p-0",
                                field.className,
                              )}
                              onClick={() => field.onClick?.(form)}
                            >
                              <RotateCcw className="size-5" />
                              <span className="sr-only">
                                {field.label || "Reset dates"}
                              </span>
                            </Button>
                          </div>
                        );

                      case "radio":
                        return (
                          <div className="flex flex-wrap gap-2">
                            {(field.options ?? []).map(
                              (opt: { value: string; label: string }) => (
                                <Button
                                  key={opt.value}
                                  type="button"
                                  variant={
                                    inputField.value === opt.value
                                      ? "default"
                                      : "outline"
                                  }
                                  className="font-normal"
                                  onClick={() => inputField.onChange(opt.value)}
                                >
                                  {opt.label}
                                </Button>
                              ),
                            )}
                          </div>
                        );

                      case "date":
                        return (
                          <Input
                            {...inputField}
                            type="text"
                            className={field.className}
                            readOnly={field.readOnly}
                            disabled={field.disabled}
                            value={
                              inputField.value
                                ? new Date(inputField.value).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    },
                                  )
                                : field.placeholder || "Select date"
                            }
                          />
                        );

                      case "display":
                        return (
                          <Input
                            {...inputField}
                            readOnly
                            tabIndex={-1}
                            className={cn(
                              field.itemClassName?.includes("booking-bar-field")
                                ? "cursor-default border-0 bg-transparent text-center font-normal shadow-none select-none h-auto! min-h-0"
                                : "cursor-default bg-muted/50 text-center font-medium",
                              field.className,
                            )}
                            value={
                              inputField.value !== "" &&
                              inputField.value != null &&
                              Number(inputField.value) >= 1
                                ? String(inputField.value)
                                : "—"
                            }
                            onChange={() => {}}
                          />
                        );

                      default:
                        return (
                          <Input
                            {...inputField}
                            type={field.type || "text"}
                            placeholder={field.placeholder}
                            className={field.className}
                            disabled={field.disabled}
                            readOnly={field.readOnly}
                          />
                        );
                    }
                  })()}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="booking-bar-submit col-span-full flex items-center justify-center pt-2 lg:pt-0">
          <Button
            type="submit"
            disabled={submitDisabled}
            className="w-full sm:w-auto max-w-full bg-gold hover:bg-gold-light text-ink font-semibold text-[14px] tracking-[0.15em] uppercase whitespace-nowrap px-8 py-3.5 rounded-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 min-h-13"
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
