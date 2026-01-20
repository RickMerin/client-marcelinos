import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, House, ReceiptText } from "lucide-react";
import domtoimage from 'dom-to-image';
import QRCode from 'react-qr-code';
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

        const downloadReceipt = async () => {
    try {
      const element = document.getElementById('receipt');
      console.log('Element found:', element);
      if (element) {
        const dataUrl = await domtoimage.toPng(element);
        console.log('Image data URL created');
        const link = document.createElement('a');
        link.download = `marcelinos-hotel-resort-receipt-${formData.reference_id || '-'}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Receipt element not found');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-10"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
      <div id='receipt' className="bg-neutral-50 border border-gray-300 rounded-lg shadow-md p-8 w-full max-w-2xl font-mono">
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
            <span>Reference No:</span>
            <span className="font-semibold">{formData.reference_id || "—"}</span>
          </div>
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

    {/* Footer / Logo */}
    <div className="flex flex-col items-center">
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



                {/* QR Code */}
        <div className="text-center">
          <div className="p-2 flex justify-center">
            <QRCode
            value={`${window.location.origin}/booking-receipt/${formData.reference_id || ""}`}
            size={80}
            style={{ height: "auto", maxWidth: "60%", width: "100%" }}
          />
          
            </div>
          <p className="text-xs text-gray-500 mb-2">Scan for digital receipt</p>
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Payment Method: {formData.paymentMethod || "—"}</p>
            <p>Issued on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        </div>
        <div>
        {/* Action */}
        <div className="flex flex-col md:flex-row justify-center gap-3 mt-6">
          <button
            onClick={downloadReceipt}
            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-5 py-2 rounded-md font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 w-full md:w-auto">
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          <button
             onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
            className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-white px-5 py-2 rounded-md font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 w-full md:w-auto">
            <House className="w-4 h-4" />
            Book Another Room
          </button>
        </div>
      </div>
    </motion.div>
  );
}
