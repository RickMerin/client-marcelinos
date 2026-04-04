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
import { DEFAULT_ROOM_TYPE_FILTERS } from "@/lib/constants/booking.constants";
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

function startOfDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Calendar days between two local dates (check-out − check-in). Same day → 0. */
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

  const schema = useMemo(() => buildSchema(kind), [kind]);

	const fields = useMemo(() => {
		const r = reservationDate as Record<string, unknown>;

		const checkInVal = r.check_in ? new Date(r.check_in as string) : "";
		const checkOutVal = r.check_out ? new Date(r.check_out as string) : "";
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

		if (kind === "venue") {
			return [
				{
					name: "check_in",
					type: "calendar" as const,
					calendarVariant: "stay" as const,
					minCheckOutOffsetDays: minOff,
					label: "Check-in Date",
					placeholder: "Select check-in date",
					value: checkInVal,
				},
				{
					//reset button//
					name: "date_reset",
					type: "reset" as const,
					itemClassName: "flex justify-center items-center mt-4",
					className: "text-white hover:bg-white/15 border-white/20 bg-white/10",
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
					label: "Check-out Date",
					placeholder: "Select check-out date",
					value: checkOutVal,
				},
				{
					name: "days",
					type: "display" as const,
					label: "Number of Day(s)",
					value: daysStored,
					itemClassName: "sm:col-span-3",
				},
			];
		}

		if (kind === "both") {
			return [
				{
					name: "check_in",
					type: "calendar" as const,
					calendarVariant: "stay" as const,
					minCheckOutOffsetDays: minOff,
					label: "Check-in (room & venue)",
					placeholder: "Select check-in date",
					value: checkInVal,
				},
				{
					name: "date_reset",
					type: "reset" as const,
					itemClassName: "flex justify-center items-center",
					className: "text-white hover:bg-white/15 border-white/20 bg-white/10",
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
					label: "Check-out (room & venue)",
					placeholder: "Select check-out date",
					value: checkOutVal,
				},
				{
					name: "days",
					type: "display" as const,
					label: "Number of Night(s)",
					value: daysStored,
					itemClassName: "sm:col-span-3",
				},
			];
		}

		return [
			{
				name: "check_in",
				type: "calendar" as const,
				calendarVariant: "stay" as const,
				minCheckOutOffsetDays: minOff,
				label: "Check-in Date",
				placeholder: "Select check-in date",
				value: checkInVal,
			},
			{
				name: "date_reset", 
				type: "reset" as const,
				itemClassName: "flex justify-center items-center",
				className: "text-white hover:bg-white/15 border-white/20 bg-white/10",
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
				label: "Check-out Date",
				placeholder: "Select check-out date",
				value: checkOutVal,
			},
			{
				name: "days",
				type: "display" as const,
				label: "Number of Night(s)",
				value: daysStored,
				itemClassName: "sm:col-span-3",
			},
		];
	}, [kind, reservationDate]);

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
		"grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-start",
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
				blockedDateStayMode="nights"
				isSubmitDisabled={(values) => {
					if (!values.check_in || !values.check_out) return true;
					return false;
				}}
				className={cn(formGridClass, "pb-2")}
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

			<div className="px-4 md:px-10 pb-1 max-w-5xl mx-auto">
				<p className="text-xs text-white/65 text-center sm:text-left">
					Blocked maintenance dates (when shown) cannot be selected in the
					calendar.
				</p>
			</div>
		</div>
	);
}
