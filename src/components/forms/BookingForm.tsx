import { z } from "zod";
import { useMemo, useState } from "react";
import { FormWrapper } from "./FormWrapper";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  BOOKING_EXPIRATION,
  saveToLocalStorage,
  getFromLocalStorage,
} from "@/lib/storage/localStorage";
import type { BookingKind, FormData } from "@/types/booking.types";
import {
  DEFAULT_ROOM_TYPE_FILTERS,
  defaultFormData,
} from "@/lib/constants/booking.constants";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import {
  alignFormDataToBookingType,
  toBlockedDateKey,
} from "@/lib/utils/booking.utils";

const KIND_OPTIONS: { value: BookingKind; label: string }[] = [
  { value: "room", label: "Room Stay" },
  { value: "venue", label: "Venue Only" },
  { value: "both", label: "Room + Venue" },
];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function diffDays(a: Date, b: Date): number {
  const sa = startOfDay(a).getTime();
  const sb = startOfDay(b).getTime();
  return Math.round((sb - sa) / 86400000);
}

function buildSchema(kind: BookingKind) {
  const base = z.object({
    days: z.coerce.number().min(0).optional(),
    check_in: z.coerce.date({ error: "Select a date" }),
    check_out: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce.date({ error: "Select check-out date" }).optional(),
    ),
    venue_event_date: z.coerce.date().optional(),
  });

  return base.superRefine((data, ctx) => {
    if (!data.check_out) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["check_out"],
        message: "Select check-out date",
      });
      return;
    }
    const ci = startOfDay(data.check_in);
    const co = startOfDay(data.check_out);
    if (co < ci) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["check_out"],
        message: "Check-out must be on or after check-in",
      });
      return;
    }
    const d = diffDays(ci, co);
    if (kind === "room" || kind === "both") {
      if (d < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["check_out"],
          message: "Check-out must be after check-in (at least one night)",
        });
      }
    }
  });
}

export default function BookingForm() {
  const navigate = useNavigate();

  const reservationDate = getFromLocalStorage("reservationDate") ?? {};

  const [kind, setKind] = useState<BookingKind>(
    (reservationDate.booking_type as BookingKind) || "room",
  );

  const addDays = (date: Date, numDays: number) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + numDays);
    return d;
  };

  const { data: blockedData, isLoading: isLoadingBlocked } = useApiQuery<any>(
    ["blocked-dates"],
    "/blocked-dates",
  );

  const blockedSet = useMemo(() => {
    const rows = blockedData?.data ?? blockedData?.blocked_dates ?? [];
    const list = Array.isArray(rows) ? rows : [];
    return new Set(
      list
        .map((row: any) => (row.date ? toBlockedDateKey(row.date) : null))
        .filter(Boolean),
    );
  }, [blockedData]);

  const schema = useMemo(() => buildSchema(kind), [kind]);

  const fields = useMemo(() => {
    const r = reservationDate as Record<string, unknown>;

    let checkInVal: Date | "" = "";
    let checkOutVal: Date | "" = "";

    if (r.check_in) {
      checkInVal = new Date(r.check_in as string);
      checkOutVal = r.check_out ? new Date(r.check_out as string) : "";
    } else {
      const now = new Date();
      const currentHour = now.getHours();
      let ci = startOfDay(new Date());
      if (currentHour >= 21) {
        ci = addDays(ci, 1);
      }

      while (blockedSet.has(toBlockedDateKey(ci.toISOString()))) {
        ci = addDays(ci, 1);
      }
      checkInVal = ci;
      checkOutVal = addDays(ci, 1);
    }

    let daysStored = 0;
    if (checkInVal && checkOutVal) {
      const d = diffDays(startOfDay(checkInVal), startOfDay(checkOutVal));
      if (kind === "venue") {
        daysStored = d + 1;
      } else {
        daysStored = Math.max(1, d);
      }
    }

    const minOff = kind === "venue" ? 0 : 1;
    const daysLabel = kind === "venue" ? "Day(s)" : "Night(s)";
    const ciLabel = kind === "both" ? "Check-in" : "Check-in";
    const coLabel = kind === "both" ? "Check-out" : "Check-out";

		return [
			{
				name: "check_in",
				type: "calendar" as const,
				calendarVariant: "stay" as const,
				minCheckOutOffsetDays: minOff,
				label: ciLabel,
				placeholder: "Select Date",
				value: checkInVal,
				itemClassName: "booking-bar-field",
			},
			{
				name: "date_reset",
				type: "reset" as const,
				itemClassName: "booking-bar-reset",
				className:
					"text-gold-light/60 hover:text-gold-light hover:bg-cream/5 border-cream/10 bg-transparent",
				label: "",
				onClick: (form: any) => {
					form.setValue("check_in" as any, "");
					form.setValue("check_out" as any, "");
					form.setValue("days" as any, 0);
					form.clearErrors(["check_in" as any, "check_out" as any]);
				},
			},
			{
				name: "check_out",
				type: "calendar" as const,
				calendarVariant: "stay" as const,
				minCheckOutOffsetDays: minOff,
				label: coLabel,
				placeholder: "Select Date",
				value: checkOutVal,
				itemClassName: "booking-bar-field",
			},
			{
				name: "days",
				type: "display" as const,
				label: daysLabel,
				value: daysStored,
				itemClassName: "booking-bar-field",
			},
		];
	}, [kind, reservationDate, blockedSet]);

  const handleSubmit = (values: z.infer<typeof schema>) => {
    const checkIn = values.check_in as Date;
    const checkOut = values.check_out as Date;
    const d = diffDays(startOfDay(checkIn), startOfDay(checkOut));
    let days: number;
    if (kind === "venue") {
      days = d + 1;
    } else {
      days = Math.max(1, d);
    }
    let venueEventDate: Date | undefined;

    if (kind === "both") {
      venueEventDate = checkIn;
    }

    saveToLocalStorage(
      "reservationDate",
      {
        booking_type: kind,
        days,
        check_in: checkIn?.toISOString?.() ?? checkIn,
        check_out: checkOut?.toISOString?.() ?? checkOut,
        ...(kind === "room" || kind === "both"
          ? { room_type_filters: [...DEFAULT_ROOM_TYPE_FILTERS] }
          : {}),
        ...(kind === "both" && venueEventDate
          ? { venue_event_date: venueEventDate.toISOString() }
          : {}),
      },
      BOOKING_EXPIRATION,
    );

    const storedDetails = getFromLocalStorage(
      "reservationDetails",
    ) as Partial<FormData> | null;
    if (storedDetails) {
			const aligned = alignFormDataToBookingType(
				{ ...defaultFormData, ...storedDetails } as FormData,
				kind,
			);
			saveToLocalStorage("reservationDetails", aligned, BOOKING_EXPIRATION);
		}
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
			{/* Booking type dropdown — first field in the bar */}
			<div className="booking-bar-segment flex flex-col gap-1.5 px-5 py-5 lg:py-6 border-b lg:border-b-0 lg:border-r border-cream/[0.07] xl:w-75 items-center text-center">
				<span className="text-gold-light text-[13px] tracking-[0.2em] uppercase font-medium">
					Booking Type
				</span>
				<div className="relative w-full max-w-full">
					<select
						value={kind}
						onChange={(e) => setKind(e.target.value as BookingKind)}
						className="bg-transparent border-none outline-none font-display text-lg text-cream w-full min-w-0 cursor-pointer appearance-none px-6 text-center"
						style={{ fontFamily: "var(--font-display)" }}>
						{KIND_OPTIONS.map((opt) => (
							<option
								key={opt.value}
								value={opt.value}
								className="bg-ink text-cream">
								{opt.label}
							</option>
						))}
					</select>
					<ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 size-4 text-cream/40 pointer-events-none" />
				</div>
			</div>

			{/* Form fields */}
			{!reservationDate.check_in && isLoadingBlocked ? (
				<div className="flex flex-1 items-center justify-center p-4">
					<span className="text-cream/50 text-sm">Loading availability...</span>
				</div>
			) : (
				<div className="flex flex-col flex-1 min-w-0">
					<FormWrapper
						key={kind}
						schema={schema}
						fields={fields}
						onSubmit={handleSubmit}
						submitLabel="Check Availability"
						blockedDateStayMode={
							kind === "venue" ? "single_calendar" : "nights"
						}
						isSubmitDisabled={(values) => {
							if (!values.check_in || !values.check_out) return true;
							return false;
						}}
						className={formGridClass}
						onChangeFields={(values) => {
							const ci = values.check_in as Date | undefined;
							const co = values.check_out as Date | undefined;
							if (!ci) return {};
							if (!co) {
								return { days: 0 };
							}
							const ciD = startOfDay(new Date(ci));
							const coD = startOfDay(new Date(co));
							if (coD < ciD) {
								if (kind === "venue") {
									return { check_out: ciD, days: 1 };
								}
								return { check_out: addDays(ciD, 1), days: 1 };
							}
							const d = diffDays(ciD, coD);
							let days: number;
							if (kind === "venue") {
								days = d + 1;
							} else {
								days = Math.max(1, d);
							}
							return { days };
						}}
					/>
				</div>
			)}
		</div>
	);
}
