import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, House, ReceiptText } from "lucide-react";
import domtoimage from "dom-to-image";
import { BookingReceipt } from "@/types/booking.types";
import { clearBookingStorage } from "@/lib/storage/localStorage";

interface Step5FormDataProps {
  formData: any;
  receiptData?: never;
}

interface Step5ReceiptDataProps {
  receiptData: BookingReceipt;
  qrCodeUrl?: string | null;
  formData?: never;
}

type Props = Step5FormDataProps | Step5ReceiptDataProps;

function isReceiptData(props: Props): props is Step5ReceiptDataProps {
  return "receiptData" in props && props.receiptData != null;
}

export function Step5(props: Props) {
  const navigate = useNavigate();

  const isFromApi = isReceiptData(props);
  const receipt: BookingReceipt | undefined = props.receiptData;
  const form = props.formData;
  const qrCodeUrl = isFromApi ? props.qrCodeUrl ?? null : null;

  const referenceNumber = isFromApi
    ? receipt?.reference_number
    : form?.reference_number;


  const createdAt = isFromApi
    ? receipt?.created_at
    : new Date().toLocaleDateString();
  const bookingStatus = isFromApi
    ? receipt?.booking_status
    : form?.booking_status;
  const checkIn = isFromApi ? receipt?.check_in : form?.check_in;
  const checkOut = isFromApi ? receipt?.check_out : form?.check_out;
  const nights = isFromApi
    ? receipt
      ? Math.round(receipt.nights)
      : 0
    : form?.check_in && form?.check_out
      ? Math.ceil(
          (new Date(form.check_out).getTime() -
            new Date(form.check_in).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;
  const guestName = isFromApi
    ? receipt?.guest_name
    : form
      ? `${form.lastName || ""} ${form.firstName || ""}`.trim()
      : "—";
  const issuedOn = isFromApi
    ? (receipt?.issued_on ?? new Date().toLocaleDateString())
    : new Date().toLocaleDateString();
  const paymentMethod = isFromApi ? undefined : form?.paymentMethod;

  const roomsFromApi =
    receipt != null
      ? Array.isArray(receipt.rooms) && receipt.rooms.length > 0
        ? receipt.rooms.map((r: any) => ({
            room_number: r.number ?? null,
            type: r.type ?? r.name ?? "",
            capacity: r.capacity ?? 0,
            price:
              typeof r.price === "number"
                ? r.price
                : parseFloat(String(r.price || 0)),
            status: "",
          }))
        : receipt.room
          ? [
              {
                room_number: receipt.room.number,
                type: receipt.room.type,
                capacity: receipt.room.capacity,
                price: parseFloat(receipt.room.price),
                status: "",
              },
            ]
          : []
      : [];
  const roomsFromForm = Array.isArray(form?.rooms) ? form.rooms : [];
  const rooms = isFromApi ? roomsFromApi : roomsFromForm;

  const venuesFromApi = receipt?.venues ?? [];
  const venuesFromForm = Array.isArray(form?.venues) ? form.venues : [];
  const venues = isFromApi ? venuesFromApi : venuesFromForm;

  const grandTotal =
    isFromApi && receipt
      ? parseFloat(receipt.grand_total)
      : (form?.grandTotalPrice ?? 0);

  const roomsTotal = rooms.reduce(
    (sum: number, r: { price?: number | string }) =>
      sum +
      (typeof r.price === "number"
        ? r.price
        : parseFloat(String(r.price || 0))),
    0,
  );
  const venuesTotal = venues.reduce(
    (sum: number, v: { price?: number | string }) =>
      sum +
      (typeof v.price === "number"
        ? v.price
        : parseFloat(String(v.price || 0))),
    0,
  );
  const perNightTotal = roomsTotal + venuesTotal;
  const calculatedGrandTotal = nights > 0 ? perNightTotal * nights : grandTotal;
  const displayGrandTotal =
    isFromApi && receipt ? grandTotal : calculatedGrandTotal;

  const downloadReceipt = async () => {
    try {
      const element = document.getElementById("receipt");
      if (element) {
        const dataUrl = await domtoimage.toPng(element);
        const link = document.createElement("a");
        link.download = `marcelinos-hotel-resort-receipt-${referenceNumber || "-"}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      // Error downloading receipt
    }
  };

  const handleBookAnother = () => {
    clearBookingStorage();
    navigate("/");
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "occupied":
        return "bg-green-100 text-green-800";
      case "rescheduled":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen pb-10"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}>
      <div
        id="receipt"
        className="bg-neutral-50 border border-gray-300 rounded-lg shadow-md p-8 w-full max-w-2xl font-mono">
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
            <span className="font-semibold">{referenceNumber || "—"}</span>
          </div>

          <div className="flex justify-between">
            <span> Created At:</span>
            <span className="font-semibold">{createdAt || "—"}</span>
          </div>

          <div className="flex justify-between">
            <span> Booking Status:</span>
            <span
              className={`font-semibold ${getBookingStatusColor(bookingStatus)} px-2 py-1 rounded-md`}>
              {bookingStatus || "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Check-in:</span>
            <span className="font-semibold">{checkIn || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-out:</span>
            <span className="font-semibold">{checkOut || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Nights:</span>
            <span className="font-semibold">{nights}</span>
          </div>
          <div className="flex justify-between">
            <span>Guest Name:</span>
            <span className="font-semibold">{guestName || "—"}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-4" />

        {/* Rooms Section */}
        <div className="text-sm">
          <h3 className="font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Room Details
          </h3>
          {rooms.length > 0 ? (
            <div className="space-y-3">
              {rooms.map((room: any, idx: number) => (
                <div key={idx} className="text-gray-700">
                  <div className="flex justify-between font-semibold">
                    <span>
                      {room.room_number != null
                        ? `Room ${room.room_number} (${room.type})`
                        : (room.name ?? room.type ?? "Room")}
                    </span>
                    <span>
                      ₱
                      {typeof room.price === "number"
                        ? room.price.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })
                        : Number(room.price).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Capacity: {room.capacity}
                    {room.status ? ` | ${room.status}` : ""}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No rooms selected</p>
          )}
        </div>

        {/* Venues Section */}
        {venues.length > 0 && (
          <>
            <div className="text-sm">
              <h3 className="font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Venue Details
              </h3>
              <div className="space-y-3">
                {venues.map((venue: any, idx: number) => (
                  <div key={idx} className="pb-2 text-gray-700">
                    <div className="flex justify-between font-semibold">
                      <span>{venue.name ?? "Venue"}</span>
                      <span>
                        ₱
                        {typeof venue.price === "number"
                          ? venue.price.toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                            })
                          : Number(venue.price || 0).toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                            })}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Capacity: {venue.capacity ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="border-t border-dashed border-gray-400 my-4" />

        {/* Calculation (full transparency) */}
        <div className="text-sm">
          <h3 className="font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Calculation
          </h3>
          <div className="space-y-1.5 text-gray-700 bg-gray-100/80 rounded-md p-3">
            <div className="flex justify-between">
              <span>Rooms (per night):</span>
              <span>
                ₱
                {roomsTotal.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {venues.length > 0 && (
              <div className="flex justify-between">
                <span>Venues (per night):</span>
                <span>
                  ₱
                  {venuesTotal.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-1 border-t border-gray-300">
              <span>Per night total:</span>
              <span>
                ₱
                {perNightTotal.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>
                × {nights} night{nights !== 1 ? "s" : ""}
              </span>
              <span>
                = ₱
                {displayGrandTotal.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base mt-3">
            <span>Grand Total:</span>
            <span>
              ₱
              {displayGrandTotal.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-4" />

        {/* Footer / Logo */}
        <div className="flex flex-col items-center">
          <img
            src="/brand-logo-png.png"
            alt="Marcelino's Logo"
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
            <img
              src={qrCodeUrl ?? undefined}
              alt="Booking QR Code"
              className="object-contain"
              loading="lazy"
            />
          </div>
          <p className="text-xs text-gray-500 mb-2">Scan for digital receipt</p>
          <div className="text-center text-xs text-gray-500 space-y-1">
            {paymentMethod != null && <p>Payment Method: {paymentMethod}</p>}
            <p>Issued on {issuedOn}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-center gap-3 mt-6">
          <button
            onClick={downloadReceipt}
            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-5 py-2 rounded-md font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 w-full md:w-auto">
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          <button
            onClick={handleBookAnother}
            className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-white px-5 py-2 rounded-md font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 w-full md:w-auto">
            <House className="w-4 h-4" />
            Book Another Room
          </button>
        </div>
      </div>
    </motion.div>
  );
}
