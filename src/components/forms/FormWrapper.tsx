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
import { CalendarWithDisabledReasons as Calendar } from "@/components/calendar/CalendarWithDisabledReasons"

import { CalendarDays, Minus, Plus } from "lucide-react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";

/** Local calendar date as YYYY-MM-DD (avoid `toISOString()` shifting the day in non-UTC zones). */
function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
  const start = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
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

type Field = {
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
		| "radio";
	className?: string;
	disabled?: boolean;
	readOnly?: boolean;
	options?: any[];
	value?: any;
	/** For `calendar`: `stay` = multi-day stay rules; `single` = one calendar day (e.g. venue event). */
	calendarVariant?: "stay" | "single";
};

export type BlockedDateStayMode = "nights" | "single_calendar";

interface FormWrapperProps<T extends z.ZodType<any, any>> {
  schema: T;
  fields: Field[];
  onSubmit: SubmitHandler<z.infer<T>>;
  submitLabel?: string;
  className?: string;
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

	// ✅ derive default values from fields
	const defaultValues = Object.fromEntries(
		fields.map((f) => [f.name, f.value ?? (f.type === "counter" ? 1 : "")]),
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
	const venueEventDate = form.watch("venue_event_date" as Path<z.output<T>>);
	const allValues = form.watch();
	const submitDisabled = isSubmitDisabled?.(allValues as z.infer<T>) ?? false;

	// ✅ dynamically update computed fields like check_out
	React.useEffect(() => {
		if (!onChangeFields) return;
		const updated = onChangeFields({
			days,
			check_in: checkIn,
			venue_event_date: venueEventDate,
		} as unknown as Partial<z.infer<T>>);
		if (updated) {
			Object.entries(updated).forEach(([key, val]) => {
				if (val === undefined) return;
				const current = form.getValues(key as Path<z.output<T>>);
				if (current === val) return;
				form.setValue(key as Path<z.output<T>>, val as any, {
					shouldValidate: false,
				});
			});
		}
	}, [days, checkIn, venueEventDate, onChangeFields]);

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
		return Array.isArray(rows) ? rows : [];
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

	// Validate that stay range does not overlap any blocked date; set/clear error on check_in
	React.useEffect(() => {
		if (!checkIn || blockedDates.length === 0) {
			form.clearErrors("check_in" as Path<z.output<T>>);
			return;
		}
		if (blockedDateStayMode === "nights" && (days == null || days === "")) {
			form.clearErrors("check_in" as Path<z.output<T>>);
			return;
		}
		const checkInDate =
			checkIn && typeof checkIn === "object" && "getTime" in checkIn
				? (checkIn as Date)
				: new Date(checkIn as string | number);
		const nights =
			typeof days === "number" && days >= 1 ? days : 1;
		if (
			stayOverlapsBlocked(
				checkInDate,
				nights,
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
	}, [checkIn, days, blockedDates, blockedDateStayMode, form]);

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
															}>
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
															}>
															<Plus />
														</Button>
													</div>
												);

											case "calendar": {
												const variant = field.calendarVariant ?? "stay";
												const isDateDisabledForField = (date: Date) => {
													const d = new Date(
														date.getFullYear(),
														date.getMonth(),
														date.getDate(),
													);
													if (d < todayStart) return true;
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
													const numDays =
														typeof days === "number" && days >= 1 ? days : 1;
													return isInvalidCheckIn(
														d,
														numDays,
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
													if (d < todayStart) return false;
													if (
														blockedDates.some(
															(b) => toDayKey(b) === toDayKey(d),
														)
													)
														return false;
													if (variant === "single") return false;
													const numDays =
														typeof days === "number" && days >= 1 ? days : 1;
													return isInvalidCheckIn(
														d,
														numDays,
														blockedDates,
														blockedDateStayMode,
													);
												};
												return (
													<Popover
														open={openCalendarField === field.name}
														onOpenChange={(o) =>
															setOpenCalendarField(o ? field.name : null)
														}>
														<PopoverTrigger asChild>
															<Button
																variant="outline"
																className={cn(
																	" font-normal h-12",
																	!inputField.value && "text-muted-foreground",
																	field.className,
																)}>
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
															className="-mt-[30px] p-0">
															<Calendar
																mode="single"
																selected={inputField.value}
																onSelect={(date) => {
																	inputField.onChange(date);
																	setOpenCalendarField(null);
																}}
																disabled={isDateDisabledForField}
																blockedReasons={blockedReasons}
																overlapInvalidReason={
																	variant === "single"
																		? "This date is unavailable or outside your stay."
																		: "Your stay would include blocked dates. Pick another check-in or fewer days."
																}
																isOverlapInvalid={isOverlapInvalidForField}
															/>
														</PopoverContent>
													</Popover>
												);
											}

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
																	onClick={() =>
																		inputField.onChange(opt.value)
																	}>
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
																: "Select Check-in Date"
														}
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
				<div className="col-span-full w-full sm:col-span-2 pt-2">
					<Button
						type="submit"
						disabled={submitDisabled}
						className="w-full text-white text-lg py-6 yellow-bg cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed">
						{submitLabel}
					</Button>
				</div>
			</form>
		</Form>
	);
}
