import { useParams } from "react-router-dom";
import { useApiQuery } from "../../lib/api/queries/useApiQuery";
import QRCode from "react-qr-code";
import { ReceiptText } from "lucide-react";
// import domtoimage from 'dom-to-image';

interface ReceiptData {
  reference_id: string;
  check_in: string;
  check_out: string;
  issued_on: string;
  nights: number;
  guest_name: string;
  room: {
    number: string;
    type: string;
    capacity: number;
    price: number;
  };
  subtotal: number;
  grand_total: number;
  payment_method: string;
}

export function BookingReceipt() {
  const { reference_id } = useParams<{ reference_id: string }>();

  const { data, isLoading, isError } = useApiQuery<ReceiptData>(
    ["booking-receipt", reference_id || ""],
    `/booking-receipt/${reference_id}`,
    {
      queryKey: ["booking-receipt", reference_id || ""],
      enabled: !!reference_id,
    },
  );

  if (!reference_id)
    return <p className="text-center mt-10">No reference provided</p>;
  if (isLoading) return <p className="text-center mt-10">Loading receipt...</p>;
  if (isError || !data)
    return <p className="text-center mt-10">Receipt not found</p>;

  return (
    <div className="flex justify-center p-4 mt-10">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-md p-6 font-sans">
        {/* Header */}
        <div className="text-center mb-6">
          <ReceiptText className="w-10 h-10 mx-auto text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900 mt-2 uppercase tracking-wider">
            Booking Receipt
          </h2>
          <p className="text-sm text-gray-600">
            Thank you for booking with us!
          </p>
        </div>

        <hr className="border-dashed border-gray-300 my-4" />

        {/* Booking Info */}
        <div className="text-sm text-gray-800 space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Reference No:</span>
            <span className="font-semibold">{data.reference_id}</span>
          </div>
          <div className="flex justify-between">
            <span>Guest Name:</span>
            <span className="font-semibold">{data.guest_name}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-in:</span>
            <span className="font-semibold">{data.check_in}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-out:</span>
            <span className="font-semibold">{data.check_out}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Nights:</span>
            <span className="font-semibold">{data.nights}</span>
          </div>
        </div>

        <hr className="border-dashed border-gray-300 my-4" />

        <div className="text-sm mb-4">
          <h3 className="font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Room Details
          </h3>

          {data.room ? (
            <div className="flex justify-between items-center border-b border-gray-200 pb-1 text-gray-700">
              <div>
                Room {data.room.number} ({data.room.type})
                <div className="text-xs text-gray-500">
                  Capacity: {data.room.capacity} pax
                </div>
              </div>

              <div className="font-semibold">
                ₱
                {data.room.price.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No room booked</p>
          )}
        </div>

        <hr className="border-dashed border-gray-300 my-4" />

        {/* Totals */}
        <div className="text-sm mb-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>
              ₱
              {data.subtotal.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base mt-2">
            <span>Grand Total:</span>
            <span>
              ₱
              {data.grand_total.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <hr className="border-dashed border-gray-300 my-4" />

        {/* Footer / QR Code */}
        <div className="flex flex-col items-center mb-2">
          <img
            src="/brand-logo-png.png"
            alt="Marcelino’s Logo"
            className="w-15 h-15 object-contain"
          />

          <div className="flex flex-col items-center gap-0 leading-tight">
            <div className="text-[20px] text-green-900 tracking-widest font-extrabold font-serif">
              MARCELINO'S
            </div>
            <div className="text-sm tracking-widest font-medium">
              RESORT AND HOTEL
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <QRCode
            value={`${window.location.origin}/booking-receipt/${data.reference_id}`}
            size={100}
            style={{ height: "auto", maxWidth: "50%", width: "50%" }}
          />
          <p className="text-xs text-gray-500 mt-1">Scan for digital receipt</p>
          <p className="text-xs text-gray-500">
            Payment Method: {data.payment_method}
          </p>
          <p className="text-xs text-gray-500">Issued on {data.issued_on}</p>
        </div>
      </div>
    </div>
  );
}

export default BookingReceipt;
