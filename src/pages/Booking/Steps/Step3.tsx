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

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center mb-6">
        Review Booking Details
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Selected Date */}
          <div className="border rounded-md shadow-sm">
            <div className="bg-green-600 text-white px-4 py-2 font-semibold rounded-t-md">
              Selected Date
            </div>
            <div className="p-4 text-sm text-gray-800 grid grid-cols-3 gap-2">
              <p>
                <strong>Days</strong>
                <br />
                {days || "—"} {pluralize(days, "Day")}
              </p>
              <p>
                <strong>Check-In</strong>
                <br />
                {check_in || "—"} - 12PM
              </p>
              <p>
                <strong>Check-Out</strong>
                <br />
                {check_out || "—"} - 2PM
              </p>
            </div>
          </div>

          {/* Selected Rooms */}
          <div className="border rounded-md shadow-sm">
            <div className="bg-green-600 text-white px-4 py-2 font-semibold rounded-t-md">
              Selected Rooms
            </div>
            {(formData.rooms ?? []).length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No rooms selected</div>
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
                    className="p-4 text-sm text-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t first:border-t-0">
                    <p>
                      <strong>Name / Type</strong>
                      <br />
                      {room.name || room.type || "—"}
                    </p>
                    <p>
                      <strong>Price</strong>
                      <br />
                      {pricingFormat(room.price ?? 0) || "—"}
                    </p>
                    {room.capacity != null && (
                      <p>
                        <strong>Capacity</strong>
                        <br />
                        {room.capacity}
                      </p>
                    )}
                  </div>
                ),
              )
            )}
          </div>

          {/* Selected Venues */}
          {(formData.venues ?? []).length > 0 && (
            <div className="border rounded-md shadow-sm">
              <div className="bg-amber-600 text-white px-4 py-2 font-semibold rounded-t-md">
                Selected Venues
              </div>
              {(formData.venues ?? []).map(
                (
                  venue: { name?: string; capacity?: number; price?: number },
                  index: number,
                ) => (
                  <div
                    key={index}
                    className="p-4 text-sm text-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t first:border-t-0">
                    <p>
                      <strong>Name</strong>
                      <br />
                      {venue.name || "—"}
                    </p>
                    <p>
                      <strong>Price</strong>
                      <br />
                      {pricingFormat(venue.price ?? 0) || "—"}
                    </p>
                    {venue.capacity != null && (
                      <p>
                        <strong>Capacity</strong>
                        <br />
                        {venue.capacity}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          )}

          {/* Total Billing */}
          <div className="border rounded-md shadow-sm overflow-hidden">
            <div className="bg-green-600 text-white px-4 py-2 font-semibold">
              Total Billing
            </div>
            <div className="p-4 text-sm text-gray-800 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-semibold text-gray-600">Day(s)</p>
                <p className="text-lg font-medium">{days}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-600">Total Price</p>
                <p className="text-lg font-medium">
                  ₱{totalPrice.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-600">Grand Total</p>
                <p className="text-lg font-bold text-green-700">
                  ₱{grandTotalPrice.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Computation line */}
            <div className="border-t px-4 py-3 bg-gray-50 text-center text-sm text-gray-700">
              Computation:&nbsp;
              <span className="font-semibold">
                ₱{totalPrice.toLocaleString()} × {days} day(s)
              </span>
              &nbsp;=&nbsp;
              <span className="font-bold text-green-700">
                ₱{grandTotalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="border rounded-md shadow-sm h-fit">
          <div className="bg-green-600 text-white px-4 py-2 font-semibold rounded-t-md">
            Personal Information
          </div>
          <div className="p-4 text-sm text-gray-800 space-y-1">
            <p>
              <strong>Last Name:</strong> {lastName}
            </p>
            <p>
              <strong>First Name:</strong> {firstName}
            </p>
            <p>
              <strong>Middle Name:</strong> {middleName}
            </p>
            <p>
              <strong>Gender:</strong> {gender}
            </p>
            <p>
              <strong>Phone Number:</strong> {phone}
            </p>
            <p>
              <strong>Email Address:</strong> {email}
            </p>
            <p>
              <strong>Address:</strong> {address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
