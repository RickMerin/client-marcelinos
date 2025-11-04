import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { House, ReceiptText } from "lucide-react";

interface Props {
  formData: any;
}

export function Step5({ formData }: Props) {
  const navigate = useNavigate();

  const days =
    formData.check_in && formData.check_out
      ? Math.ceil(
          (new Date(formData.check_out).getTime() -
            new Date(formData.check_in).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="flex justify-center py-10"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}>
      <div className="bg-neutral-50 border border-gray-300 rounded-lg shadow-md p-8 w-full max-w-2xl font-mono">
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

        <div className="border-t border-dashed border-gray-400 my-4" />

        {/* Booking Info */}
        <div className="text-sm text-gray-800 space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Check-in:</span>
            <span className="font-semibold">{formData.check_in || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-out:</span>
            <span className="font-semibold">{formData.check_out || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Nights:</span>
            <span className="font-semibold">{days}</span>
          </div>
          <div className="flex justify-between">
            <span>Guest Name:</span>
            <span className="font-semibold">
              {`${formData.lastName} ${formData.firstName}`}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-4" />

        {/* Rooms Section */}
        <div className="text-sm">
          <h3 className="font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Room Details
          </h3>
          {Array.isArray(formData.rooms) && formData.rooms.length > 0 ? (
            <div className="space-y-3">
              {formData.rooms.map((room: any, idx: number) => (
                <div
                  key={idx}
                  className="border-b border-gray-200 pb-2 text-gray-700">
                  <div className="flex justify-between font-semibold">
                    <span>
                      Room {room.room_number} ({room.type})
                    </span>
                    <span>
                      ₱
                      {room.price.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Capacity: {room.capacity} | {room.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No rooms selected</p>
          )}
        </div>

        <div className="border-t border-dashed border-gray-400 my-4" />

        {/* Totals */}
        <div className="text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>
              ₱
              {formData.totalPrice?.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base mt-2">
            <span>Grand Total:</span>
            <span>
              ₱
              {formData.grandTotalPrice?.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-4" />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>Payment Method: {formData.paymentMethod || "—"}</p>
          <p>Issued on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Action */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2 rounded-md font-semibold text-sm shadow-sm transition flex items-center gap-2">
            <House className="w-4 h-4" />
            Book Another Room
          </button>
        </div>
      </div>
    </motion.div>
  );
}
