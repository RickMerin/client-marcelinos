import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { pluralize } from "@/lib/formatters/plural";

interface Props {
  formData: any;
  onEdit: () => void;
  onProceed: () => void;
  selectedRoom?: {
    name: string;
    floor: string;
    bed_type: string;
    price: number;
  };
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

  const cardBorder = { borderColor: "var(--color-sage-muted, #e5e7eb)" };
  const bodyText = "text-sm";
  const bodyStyle = { color: "var(--color-charcoal)" } as const;
  const labelClass = "font-semibold opacity-90";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2
          className="font-display text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-charcoal)" }}>
          Review Booking Details
        </h2>
        <p
          className="text-sm opacity-80 max-w-2xl"
          style={{ color: "var(--color-charcoal)" }}>
          Confirm your stay and guest details before proceeding to payment. You
          can go back to edit rooms or personal information.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Selected Date */}
          <div
            className="rounded-md border bg-white shadow-sm overflow-hidden"
            style={cardBorder}>
            <div
              className="text-white px-4 py-2.5 font-semibold rounded-t-md"
              style={{ backgroundColor: "var(--color-sage)" }}>
              Selected Date
            </div>
            <div
              className={`p-4 ${bodyText} grid grid-cols-2 sm:grid-cols-3 gap-4`}
              style={bodyStyle}>
              <div>
                <p className={labelClass}>Days</p>
                <p className="mt-0.5">
                  {days ?? "—"} {pluralize(days, "Day")}
                </p>
              </div>
              <div>
                <p className={labelClass}>Check-in</p>
                <p className="mt-0.5">
                  {check_in ? `${check_in} — 12PM` : "—"}
                </p>
              </div>
              <div>
                <p className={labelClass}>Check-out</p>
                <p className="mt-0.5">
                  {check_out ? `${check_out} — 2PM` : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Selected Rooms */}
          <div
            className="rounded-md border bg-white shadow-sm overflow-hidden"
            style={cardBorder}>
            <div
              className="text-white px-4 py-2.5 font-semibold rounded-t-md"
              style={{ backgroundColor: "var(--color-sage)" }}>
              Selected Rooms
            </div>
            {(formData.rooms ?? []).length === 0 ? (
              <div className="p-4 text-sm opacity-70" style={bodyStyle}>
                No rooms selected
              </div>
            ) : (
              (formData.rooms ?? []).map(
                (
                  room: {
                    name?: string;
                    type?: string;
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
                    }}>
                    <div>
                      <p className={labelClass}>Name / Type</p>
                      <p className="mt-0.5">
                        {room.name}{" "}
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
              )
            )}
          </div>

          {/* Selected Venues */}
          {(formData.venues ?? []).length > 0 && (
            <div
              className="rounded-md border bg-white shadow-sm overflow-hidden"
              style={cardBorder}>
              <div
                className="text-white px-4 py-2.5 font-semibold rounded-t-md"
                style={{ backgroundColor: "var(--color-sage)" }}>
                Selected Venues
              </div>
              {(formData.venues ?? []).map(
                (
                  venue: { name?: string; capacity?: number; price?: number },
                  index: number,
                ) => (
                  <div
                    key={index}
                    className={`p-4 ${bodyText} grid grid-cols-2 sm:grid-cols-4 gap-3 border-t first:border-t-0`}
                    style={{
                      ...bodyStyle,
                      borderColor: "var(--color-sage-muted, #e5e7eb)",
                    }}>
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

          {/* Total Billing */}
          <div
            className="rounded-md border bg-white shadow-sm overflow-hidden"
            style={cardBorder}>
            <div
              className="text-white px-4 py-2.5 font-semibold rounded-t-md"
              style={{ backgroundColor: "var(--color-sage)" }}>
              Total Billing
            </div>
            <div
              className={`p-4 ${bodyText} grid grid-cols-2 sm:grid-cols-3 gap-4 text-center sm:text-left`}
              style={bodyStyle}>
              <div>
                <p
                  className={`${labelClass} text-xs uppercase tracking-wide opacity-80`}>
                  Day(s)
                </p>
                <p className="mt-0.5 text-lg font-medium">{days ?? "—"}</p>
              </div>
              <div>
                <p
                  className={`${labelClass} text-xs uppercase tracking-wide opacity-80`}>
                  Total Price
                </p>
                <p className="mt-0.5 text-lg font-medium">
                  {pricingFormat(totalPrice ?? 0)}
                </p>
              </div>
              <div>
                <p
                  className={`${labelClass} text-xs uppercase tracking-wide opacity-80`}>
                  Grand Total
                </p>
                <p
                  className="mt-0.5 text-lg font-bold"
                  style={{ color: "var(--color-sage)" }}>
                  {pricingFormat(grandTotalPrice ?? 0)}
                </p>
              </div>
            </div>
            <div
              className="border-t px-4 py-3 text-center text-sm"
              style={{
                backgroundColor: "var(--color-cream, #faf8f5)",
                color: "var(--color-charcoal)",
                borderColor: "var(--color-sage-muted, #e5e7eb)",
              }}>
              <span className="opacity-90">Computation: </span>
              <span className="font-semibold">
                {pricingFormat(totalPrice ?? 0)} × {days ?? 0} day(s)
              </span>
              <span className="opacity-90"> = </span>
              <span
                className="font-bold"
                style={{ color: "var(--color-sage)" }}>
                {pricingFormat(grandTotalPrice ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Right column — Personal Information (order matches Step2) */}
        <div
          className="rounded-md border bg-white shadow-sm overflow-hidden h-fit"
          style={cardBorder}>
          <div
            className="text-white px-4 py-2.5 font-semibold rounded-t-md"
            style={{ backgroundColor: "var(--color-sage)" }}>
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
              {gender || "—"}
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
