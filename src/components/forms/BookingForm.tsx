import { z } from "zod";
import { useMemo, useState } from "react";
import { FormWrapper } from "./FormWrapper";
import { useNavigate } from "react-router-dom";
import { Bed, Building2, Check, Layers, type LucideIcon } from "lucide-react";
import {
  BOOKING_EXPIRATION,
  saveToLocalStorage,
  getFromLocalStorage,
} from "@/lib/storage/localStorage";
import type { BookingKind } from "@/types/booking.types";
import { cn } from "@/lib/utils";

const KIND_OPTIONS: {
	value: BookingKind;
	label: string;
	description: string;
	Icon: LucideIcon;
}[] = [
	{
		value: "room",
		label: "Room stay",
		description:
			"Overnight accommodation. Pick nights, check-in, and check-out for your stay.",
		Icon: Bed,
	},
	{
		value: "venue",
		label: "Venue only",
		description:
			"Event or function space for one calendar day—same-day check-in and check-out.",
		Icon: Building2,
	},
	{
		value: "both",
		label: "Room + venue",
		description:
			"Stay overnight and add a venue—the venue is priced for the same stay length and shares your room check-in and check-out dates.",
		Icon: Layers,
	},
];

function buildSchema(kind: BookingKind) {
	const base = z.object({
		days: z.coerce.number().min(1, "Invalid number of days").optional(),
		check_in: z.coerce.date({ error: "Select a date" }),
		check_out: z.coerce.date().optional(),
		venue_event_date: z.coerce.date().optional(),
	});

	return base.superRefine((data, ctx) => {
		if (kind === "room" || kind === "both") {
			const d = data.days;
			if (d == null || Number(d) < 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["days"],
					message: "Set at least one night",
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

  const schema = useMemo(() => buildSchema(kind), [kind]);

	const fields = useMemo(() => {
		const r = reservationDate as Record<string, unknown>;
		const daysVal = typeof r.days === "number" && r.days >= 1 ? r.days : 1;

		const checkInVal = r.check_in ? new Date(r.check_in as string) : "";
		const checkOutVal = r.check_out ? new Date(r.check_out as string) : "";
		if (kind === "venue") {
			return [
				{
					name: "check_in",
					type: "calendar" as const,
					calendarVariant: "single" as const,
					label: "Event date",
					placeholder: "Select event date",
					value: checkInVal,
				},
				{
					name: "check_out",
					type: "date" as const,
					label: "End date",
					readOnly: true,
					className: "cursor-not-allowed text-center",
					value: checkOutVal || checkInVal,
				},
			];
		}

		if (kind === "both") {
			return [
				{
					name: "days",
					type: "counter" as const,
					label: "Nights (room & venue)",
					value: daysVal,
				},
				{
					name: "check_in",
					type: "calendar" as const,
					label: "Check-in (room & venue)",
					placeholder: "Select check-in date",
					value: checkInVal,
				},
				{
					name: "check_out",
					type: "date" as const,
					label: "Check-out (room & venue)",
					readOnly: true,
					className: "cursor-not-allowed text-center",
					value: checkOutVal,
					itemClassName: "sm:col-span-2",
				},
			];
		}

		return [
			{
				name: "days",
				type: "counter" as const,
				label: "Number of Day(s)",
				value: daysVal,
			},
			{
				name: "check_in",
				type: "calendar" as const,
				label: "Check-in Date",
				placeholder: "Select check-in date",
				value: checkInVal,
			},
			{
				name: "check_out",
				type: "date" as const,
				label: "Check-out Date",
				readOnly: true,
				className: "cursor-not-allowed text-center",
				value: checkOutVal,
				itemClassName: "sm:col-span-2",
			},
		];
	}, [kind, reservationDate]);

	const handleSubmit = (values: z.infer<typeof schema>) => {
		const days = kind === "venue" ? 1 : Math.max(1, Number(values.days) || 1);
		let checkIn = values.check_in as Date;
		let checkOut = values.check_out as Date | undefined;
		let venueEventDate: Date | undefined;

		if (kind === "venue") {
			checkOut = checkIn;
		} else if (kind === "both") {
			checkOut = values.check_out as Date;
			venueEventDate = checkIn;
		} else {
			checkOut =
				values.check_out ??
				(checkIn && days ? addDays(checkIn, days) : undefined);
		}

		saveToLocalStorage(
			"reservationDate",
			{
				booking_type: kind,
				days,
				check_in: checkIn?.toISOString?.() ?? checkIn,
				check_out: checkOut?.toISOString?.() ?? checkOut,
				...(kind === "both" && venueEventDate
					? {
							venue_event_date: venueEventDate.toISOString(),
						}
					: {}),
			},
			BOOKING_EXPIRATION,
		);

		navigate("/create-booking");
	};

	const formGridClass = cn(
		"relative z-10 w-full max-w-5xl mx-auto px-4 md:px-10 py-2",
		"grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 items-start",
		"[&_label]:text-white/95 [&_label]:text-sm",
	);

	return (
		<div className="space-y-6 md:space-y-8">
			<div className="px-4 md:px-10 pt-1">
				<h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-white mb-1">
					What would you like to book?
				</h3>
				<p className="text-sm text-white/75 max-w-2xl mb-5">
					Pick one option. Room stays use multiple nights; venue bookings use a
					single day; you can combine both if you need an event space during
					your stay.
				</p>

				<div
					className="grid grid-cols-1 gap-3 sm:grid-cols-3"
					role="radiogroup"
					aria-label="Booking type">
					{KIND_OPTIONS.map((opt) => {
						const Icon = opt.Icon;
						const selected = kind === opt.value;
						return (
							<button
								key={opt.value}
								type="button"
								role="radio"
								aria-checked={selected}
								onClick={() => setKind(opt.value)}
								className={cn(
									"group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-4 md:p-5 text-left transition-all duration-300 ease-out",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-green-800",
									/* !important: .first-fold-booking button[type="button"] in index.css otherwise wins */
									selected
										? [
												"border-emerald-400! bg-white/50! text-(--color-charcoal)!",
												"shadow-[0_10px_40px_-12px_rgba(6,78,59,0.45),0_4px_16px_-6px_rgba(0,0,0,0.18)]",
												"ring-2 ring-emerald-300/40 ring-offset-2 ring-offset-green-800",
											]
										: [
												"border-white/20 bg-white/8 text-white backdrop-blur-[2px]",
												"hover:border-emerald-200/35 hover:bg-white/12 hover:shadow-md hover:shadow-black/10",
											],
								)}>
								{selected && (
									<span
										className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md"
										aria-hidden>
										<Check className="size-3.5" strokeWidth={2.75} />
									</span>
								)}
								<div
									className={cn(
										"flex items-start gap-3",
										selected && "pr-7 sm:pr-8",
									)}>
									<span
										className={cn(
											"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
											selected
												? "bg-emerald-100 text-emerald-800 shadow-inner shadow-emerald-900/5"
												: "bg-white/15 text-white group-hover:bg-white/20",
										)}>
										<Icon className="size-5 md:size-6" strokeWidth={2} />
									</span>
									<span
										className={cn(
											"font-display text-base md:text-lg font-semibold leading-tight pt-0.5",
											selected ? "text-(--color-charcoal)!" : "text-white",
										)}>
										{opt.label}
									</span>
								</div>
								<span
									className={cn(
										"text-xs md:text-sm leading-relaxed",
										selected ? "text-neutral-800!" : "text-white/85",
									)}>
									{opt.description}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			<FormWrapper
				key={kind}
				schema={schema}
				fields={fields}
				onSubmit={handleSubmit}
				submitLabel="Book Now"
				blockedDateStayMode={
					kind === "venue" ? "single_calendar" : "nights"
				}
				isSubmitDisabled={(values) => {
					if (!values.check_in) return true;
					return false;
				}}
				className={cn(formGridClass, "pb-2")}
				onChangeFields={(values) => {
					if (kind === "venue") {
						if (!values.check_in) return {};
						// Same calendar day for event; do not set `days` here — `days: 1` in the
						// form was incorrectly treated as "one night" (2 calendar days) for blocked-date overlap.
						return {
							check_out: values.check_in,
						};
					}
					if (kind === "room") {
						if (values.days && values.check_in) {
							const checkInDate = new Date(values.check_in as Date);
							return { check_out: addDays(checkInDate, Number(values.days)) };
						}
						return {};
					}
					if (kind === "both") {
						if (!values.days || !values.check_in) return {};
						const checkInDate = new Date(values.check_in as Date);
						return {
							check_out: addDays(checkInDate, Number(values.days)),
						};
					}
					return {};
				}}
			/>

			<div className="px-4 md:px-10 pb-1 max-w-5xl mx-auto">
				<p className="text-xs text-white/65 text-center sm:text-left">
					Blocked maintenance dates (when shown) cannot be selected in the
					calendar.
				</p>
			</div>
		</div>
	);
}
