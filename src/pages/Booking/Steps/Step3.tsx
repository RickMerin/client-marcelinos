import { Button } from "@/components/ui/button";
import { pricingFormat } from "@/lib/pricingFormat";
import { pluralize } from "@/lib/plural";

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

export function Step3({ formData, onEdit, onProceed, selectedRoom }: Props) {
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
    rooms,
  } = formData;

  console.log(rooms);
  const price = selectedRoom?.price || 0;
  const total = days * price;

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

          {/* Selected Room */}
          <div className="border rounded-md shadow-sm">
            <div className="bg-green-600 text-white px-4 py-2 font-semibold rounded-t-md">
              Selected Room
            </div>
            {formData.rooms.map(
              (
                room: {
                  type: string;
                  floor: string;
                  bed_type: string;
                  price: number;
                },
                index: number
              ) => (
                <div
                  key={index}
                  className="p-4 text-sm text-gray-800 grid grid-cols-4 gap-2">
                  <p>
                    <strong>Name</strong>
                    <br />
                    {room.type || "—"}
                  </p>
                  <p>
                    <strong>Price</strong>
                    <br />
                    {pricingFormat(room.price) || "—"}
                  </p>
                  <p>
                    <strong>Floor</strong>
                    <br />
                    {room.floor || "—"}
                  </p>
                  <p>
                    <strong>Bed Type</strong>
                    <br />
                    {room.bed_type || "—"}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Total Billing */}
          <div className="border rounded-md shadow-sm">
            <div className="bg-green-600 text-white px-4 py-2 font-semibold rounded-t-md">
              Total Billing
            </div>
            <div className="p-4 text-sm text-gray-800 grid grid-cols-4 gap-2">
              <p className="col-span-1">
                <strong>Price</strong>
                <br />₱{price.toLocaleString()}
              </p>
              <p className="col-span-1">
                <strong>Days</strong>
                <br />
                {days}
              </p>
              <p className="col-span-1">
                <strong>Total</strong>
                <br />₱{total.toLocaleString()}
              </p>
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

      {/* Buttons */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={onEdit}
          className="text-sm underline text-gray-600 hover:text-gray-800">
          ← Edit Details
        </button>

        <Button
          onClick={onProceed}
          className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-md">
          Continue
        </Button>
      </div>
    </div>
  );
}
