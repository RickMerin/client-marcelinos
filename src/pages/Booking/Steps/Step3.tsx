import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { pluralize } from "@/lib/formatters/plural";
import type { FormData } from "@/types/booking.types";
import type { BookingKind } from "@/types/booking.types";
import { calculateTotalPrice } from "@/lib/math/calculate";

interface Props {
  formData: FormData;
  onEdit: () => void;
  onProceed: () => void;
  selectedRoom?: {
    name: string;
    floor: string;
    bed_type: string;
    price: number;
  };
}

const ROOM_CHECK_IN = "12:00 PM";
const ROOM_CHECK_OUT = "10:00 AM";

function bookingKindLabel(t: BookingKind): string {
  if (t === "venue") return "Venue only";
  if (t === "both") return "Room + venue";
  return "Rooms only";
}

function buildBillingComputation(formData: FormData): string {
  const bt = formData.booking_type ?? "room";
  const days = Math.max(1, formData.days ?? 1);
  const rooms = formData.rooms ?? [];
  const venues = formData.venues ?? [];
  const rt = calculateTotalPrice(rooms);
  const vt = calculateTotalPrice(venues);
  const gt = Number(formData.grandTotalPrice ?? 0);

  if (bt === "venue") {
    return `${pricingFormat(vt)} × 1 event day = ${pricingFormat(gt)}`;
  }
  if (bt === "room") {
    return `${pricingFormat(rt)} × ${days} ${pluralize(days, "day")} = ${pricingFormat(gt)}`;
  }
  if (bt === "both") {
    const sum = rt + vt;
    if (sum <= 0) return pricingFormat(gt);
    return `${pricingFormat(sum)} × ${days} ${pluralize(days, "day")} (rooms + venues) = ${pricingFormat(gt)}`;
  }
  return pricingFormat(gt);
}

export function Step3({ formData }: Props) {
  const {
    check_in,
    check_out,
    firstName,
    lastName,
    middleName,
    gender,
    phone,
    email,
    address,
    days,
    totalPrice,
    grandTotalPrice,
  } = formData;

  const bookingType = formData.booking_type ?? "room";
  const rooms = formData.rooms ?? [];
  const venues = formData.venues ?? [];
  const hasRooms = rooms.length > 0;
  const hasVenues = venues.length > 0;

  const cardBorder = { borderColor: "var(--color-sage-muted, #e5e7eb)" };
  const bodyText = "text-sm";
  const bodyStyle = { color: "var(--color-charcoal)" } as const;
  const labelClass = "font-semibold opacity-90";

  const stepIntro =
    bookingType === "venue"
      ? "Confirm your event date, venue, and guest details before payment."
      : bookingType === "both"
        ? "Confirm your room stay, venue (if any), and guest details before payment."
        : "Confirm your stay dates, rooms, and guest details before payment.";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--color-sage, #4a6741)" }}
        >
          {bookingKindLabel(bookingType)}
        </p>
        <h2
          className="font-display text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-charcoal)" }}
        >
          Review Booking Details
        </h2>
        <p
          className="text-sm opacity-80 max-w-2xl"
          style={{ color: "var(--color-charcoal)" }}
        >
          {stepIntro} You can go back to edit selections or personal
          information.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="space-y-4">
          {/* Dates — copy depends on booking type */}
          <div
            className="rounded-md border bg-white shadow-sm overflow-hidden"
            style={cardBorder}
          >
            <div
              className="text-white px-4 py-2.5 font-semibold rounded-t-md"
              style={{ backgroundColor: "var(--color-sage)" }}
            >
              {bookingType === "venue"
                ? "Event date"
                : bookingType === "both"
                  ? "Room & venue stay"
                  : "Selected stay"}
            </div>
            <div className={`p-4 ${bodyText} space-y-4`} style={bodyStyle}>
              {bookingType === "venue" ? (
                <>
                  <div>
                    <p className={labelClass}>Event day</p>
                    <p className="mt-0.5">{check_in ? `${check_in}` : "—"}</p>
                    <p className="mt-2 text-xs opacity-80 leading-relaxed">
                      Venue bookings use one calendar day: arrival and departure
                      are scheduled the same day (times follow property policy).
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[var(--color-sage-muted)]">
                    <div>
                      <p className={labelClass}>Start</p>
                      <p className="mt-0.5">
                        {check_in ? `${check_in} — ${ROOM_CHECK_IN}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className={labelClass}>End</p>
                      <p className="mt-0.5">
                        {check_out ? `${check_out} — ${ROOM_CHECK_OUT}` : "—"}
                      </p>
                    </div>
                  </div>
                </>
              ) : bookingType === "both" ? (
                <>
                  <div
                    className={`grid grid-cols-2 sm:grid-cols-3 gap-4 pb-3 border-b border-[var(--color-sage-muted)]`}
                  >
                    <div>
                      <p className={labelClass}>Nights (room & venue)</p>
                      <p className="mt-0.5">
                        {days ?? "—"} {pluralize(days, "night")}
                      </p>
                    </div>
                    <div>
                      <p className={labelClass}>Check-in (room & venue)</p>
                      <p className="mt-0.5">
                        {check_in ? `${check_in} — ${ROOM_CHECK_IN}` : "—"}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className={labelClass}>Check-out (room & venue)</p>
                      <p className="mt-0.5">
                        {check_out ? `${check_out} — ${ROOM_CHECK_OUT}` : "—"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">
                    Venue pricing uses the same stay length as your room (e.g. 6
                    nights → room line items and venue line items each × 6).
                  </p>
                </>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className={labelClass}>Nights</p>
                    <p className="mt-0.5">
                      {days ?? "—"} {pluralize(days, "night")}
                    </p>
                  </div>
                  <div>
                    <p className={labelClass}>Check-in</p>
                    <p className="mt-0.5">
                      {check_in ? `${check_in} — ${ROOM_CHECK_IN}` : "—"}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className={labelClass}>Check-out</p>
                    <p className="mt-0.5">
                      {check_out ? `${check_out} — ${ROOM_CHECK_OUT}` : "—"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {hasRooms && (
            <div
              className="rounded-md border bg-white shadow-sm overflow-hidden"
              style={cardBorder}
            >
              <div
                className="text-white px-4 py-2.5 font-semibold rounded-t-md"
                style={{ backgroundColor: "var(--color-sage)" }}
              >
                Selected Rooms
              </div>
              {rooms.map(
                (
                  room: {
                    name?: string;
                    type?: string;
                    capacity?: number;
                    price?: number;
                    bed_specifications?: string[];
                  },
                  index: number,
                ) => (
                  <div
                    key={index}
                    className={`p-4 ${bodyText} grid grid-cols-2 sm:grid-cols-4 gap-3 border-t first:border-t-0`}
                    style={{
                      ...bodyStyle,
                      borderColor: "var(--color-sage-muted, #e5e7eb)",
                    }}
                  >
                    <div>
                      <p className={labelClass}>Name / Type</p>
                      <p className="mt-0.5">
                        {room.bed_specifications &&
                        room.bed_specifications.length > 0
                          ? room.bed_specifications.join(", ")
                          : room.type}{" "}
                        <small className="text-xs text-gray-500">
                          ({room.type})
                        </small>
                      </p>
                    </div>
                    <div>
                      <p className={labelClass}>Price</p>
                      <p className="mt-0.5">
                        {pricingFormat(room.price ?? 0) || "—"}
                      </p>
                    </div>
                    {room.capacity != null && (
                      <div>
                        <p className={labelClass}>Capacity</p>
                        <p className="mt-0.5">{room.capacity} guests</p>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          )}

          {hasVenues && (
            <div
              className="rounded-md border bg-white shadow-sm overflow-hidden"
              style={cardBorder}
            >
              <div
                className="text-white px-4 py-2.5 font-semibold rounded-t-md"
                style={{ backgroundColor: "var(--color-sage)" }}
              >
                Selected Venues
              </div>
              {venues.map(
                (
                  venue: {
                    name?: string;
                    capacity?: number;
                    price?: number;
                  },
                  index: number,
                ) => (
                  <div
                    key={index}
                    className={`p-4 ${bodyText} grid grid-cols-2 sm:grid-cols-4 gap-3 border-t first:border-t-0`}
                    style={{
                      ...bodyStyle,
                      borderColor: "var(--color-sage-muted, #e5e7eb)",
                    }}
                  >
                    <div>
                      <p className={labelClass}>Name</p>
                      <p className="mt-0.5">{venue.name || "—"}</p>
                    </div>
                    <div>
                      <p className={labelClass}>Price</p>
                      <p className="mt-0.5">
                        {pricingFormat(venue.price ?? 0) || "—"}
                      </p>
                    </div>
                    {venue.capacity != null && (
                      <div>
                        <p className={labelClass}>Capacity</p>
                        <p className="mt-0.5">{venue.capacity} guests</p>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          )}

          {!hasRooms && !hasVenues && (
            <div
              className="rounded-md border border-dashed p-4 text-sm opacity-80"
              style={{ ...bodyStyle, borderColor: "var(--color-sage-muted)" }}
            >
              No rooms or venues listed. Go back to step 1 to add at least one
              room or venue.
            </div>
          )}

          <div
            className="rounded-md border bg-white shadow-sm overflow-hidden"
            style={cardBorder}
          >
            <div
              className="text-white px-4 py-2.5 font-semibold rounded-t-md"
              style={{ backgroundColor: "var(--color-sage)" }}
            >
              Total Billing
            </div>
            <div
              className={`p-4 ${bodyText} grid grid-cols-2 sm:grid-cols-3 gap-4 text-center sm:text-left`}
              style={bodyStyle}
            >
              <div>
                <p
                  className={`${labelClass} text-xs uppercase tracking-wide opacity-80`}
                >
                  {bookingType === "venue" ? "Event day(s)" : "Stay length"}
                </p>
                <p className="mt-0.5 text-lg font-medium">
                  {bookingType === "venue"
                    ? "1 day"
                    : `${days ?? "—"} ${pluralize(days, "day")}`}
                </p>
              </div>
              <div>
                <p
                  className={`${labelClass} text-xs uppercase tracking-wide opacity-80`}
                >
                  Line total (rooms + venues)
                </p>
                <p className="mt-0.5 text-lg font-medium">
                  {pricingFormat(totalPrice ?? 0)}
                </p>
              </div>
              <div>
                <p
                  className={`${labelClass} text-xs uppercase tracking-wide opacity-80`}
                >
                  Grand Total
                </p>
                <p
                  className="mt-0.5 text-lg font-bold"
                  style={{ color: "var(--color-sage)" }}
                >
                  {pricingFormat(grandTotalPrice ?? 0)}
                </p>
              </div>
            </div>
            <div
              className="border-t px-4 py-3 text-center text-sm sm:text-left"
              style={{
                backgroundColor: "var(--color-cream, #faf8f5)",
                color: "var(--color-charcoal)",
                borderColor: "var(--color-sage-muted, #e5e7eb)",
              }}
            >
              <span className="opacity-90">Computation: </span>
              <span className="font-semibold break-words">
                {buildBillingComputation(formData)}
              </span>
            </div>
          </div>
        </div>

        <div
          className="rounded-md border bg-white shadow-sm overflow-hidden h-fit"
          style={cardBorder}
        >
          <div
            className="text-white px-4 py-2.5 font-semibold rounded-t-md"
            style={{ backgroundColor: "var(--color-sage)" }}
          >
            Personal Information
          </div>
          <div className={`p-4 ${bodyText} space-y-3`} style={bodyStyle}>
            <p>
              <span className={labelClass}>First Name: </span>
              {firstName || "—"}
            </p>
            <p>
              <span className={labelClass}>Middle Name: </span>
              {middleName || "—"}
            </p>
            <p>
              <span className={labelClass}>Last Name: </span>
              {lastName || "—"}
            </p>
            <p>
              <span className={labelClass}>Gender: </span>
              {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "—"}
            </p>
            <p>
              <span className={labelClass}>Phone: </span>
              {phone || "—"}
            </p>
            <p>
              <span className={labelClass}>Email: </span>
              {email || "—"}
            </p>
            <p className="pt-1">
              <span className={`${labelClass} block mb-1`}>Address</span>
              <span className="opacity-90">{address || "—"}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
