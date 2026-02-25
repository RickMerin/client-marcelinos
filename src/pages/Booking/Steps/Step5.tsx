import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, House, ReceiptText } from "lucide-react";
import domtoimage from "dom-to-image";
import { BookingReceipt } from "@/types/booking.types";
import { clearBookingStorage } from "@/lib/storage/localStorage";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import CancelBookingContent from "@/components/modals/CancelBookingContent";
import Modal from "@/components/modals/Modal";
// your existing Modal component

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

const receiptBorder = "#000000";

function ReceiptDivider() {
  return (
    <div
      className="border-t border-dashed my-4"
      style={{ borderColor: receiptBorder }}
    />
  );
}

function ReceiptRow({
  label,
  value,
  valueClassName = "font-semibold",
}: {
  label: string;
  value: string | undefined;
  valueClassName?: string;
}) {
  const display = value != null && value !== "" ? value : "—";
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="opacity-80 shrink-0">{label}</span>
      <span className={valueClassName}>{display}</span>
    </div>
  );
}

export function Step5(props: Props) {
  const navigate = useNavigate();

  const isFromApi = isReceiptData(props);
  const receipt: BookingReceipt | undefined = props.receiptData;
  const form = props.formData;
  const qrCodeUrl = isFromApi ? (props.qrCodeUrl ?? null) : null;
  const [qrBase64, setQrBase64] = useState<string | undefined>();

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
      ? [form.lastName, form.firstName, form.middleName]
          .filter(Boolean)
          .join(", ")
          .trim() || "—"
      : "—";
  const issuedOn = isFromApi
    ? (receipt?.issued_on ?? new Date().toLocaleDateString())
    : new Date().toLocaleDateString();
  const paymentMethod = isFromApi ? undefined : form?.paymentMethod;

  const isCancelled = bookingStatus === "cancelled";
  const cancelBooking = useApiMutation<void>("patch", {
    onError: () => {
      alert("Failed to cancel booking.");
    },
  });

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCancel = () => {
    if (!referenceNumber) return;
    setIsCancelModalOpen(true); // open the modal instead of alert
  };
  useEffect(() => {
  if (!qrCodeUrl) return;

  fetch(qrCodeUrl)
    .then(res => res.text())
    .then(svgText => {
      const base64 = `data:image/svg+xml;base64,${btoa(svgText)}`;
      setQrBase64(base64);
    })
    .catch(err => console.error(err));
}, [qrCodeUrl]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen pb-10"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <div
        id="receipt"
        role="document"
        aria-label="Billing Statement"
        className="rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-2xl border border-b-emerald-100/50 print:shadow-none"
        style={{
          backgroundColor: "var(--color-cream)",
          borderColor: receiptBorder,
        }}
      >
        {/* Receipt header */}
        <div className="text-center mb-5">
          <ReceiptText
            className="w-9 h-9 sm:w-10 sm:h-10 mx-auto opacity-90"
            style={{ color: "var(--color-charcoal)" }}
            aria-hidden
          />
          <h2
            className="font-display text-lg sm:text-xl font-bold mt-2 uppercase tracking-widest"
            style={{ color: "var(--color-charcoal)" }}
          >
            Billing Statement
          </h2>
          <p
            className="text-sm mt-1 opacity-80"
            style={{ color: "var(--color-charcoal)" }}
          >
            Thank you for booking with us!
          </p>
        </div>

        <ReceiptDivider />

        {/* Reference & issued — receipt-style top block */}
        <div
          className="text-sm flex flex-wrap justify-between gap-x-4 gap-y-1 mb-4"
          style={{ color: "var(--color-charcoal)" }}
        >
          <div>
            <span className="opacity-80">Reference No.</span>
            <span className="ml-2 font-semibold">{referenceNumber || "—"}</span>
          </div>
          <div>
            <span className="opacity-80">Issued</span>
            <span className="ml-2 font-semibold">{issuedOn || "—"}</span>
          </div>
        </div>

        {/* Booking details */}
        <div
          className="text-sm space-y-2 mb-4"
          style={{ color: "var(--color-charcoal)" }}
        >
          <ReceiptRow label="Created" value={createdAt} />
          <ReceiptRow
            label="Status"
            value={bookingStatus}
            valueClassName={
              bookingStatus
                ? `font-semibold ${getBookingStatusColor(bookingStatus)} px-2 py-0.5 rounded inline-block capitalize`
                : undefined
            }
          />
          <ReceiptRow label="Check-in" value={checkIn} />
          <ReceiptRow label="Check-out" value={checkOut} />
          <ReceiptRow label="Nights" value={String(nights)} />
          <ReceiptRow label="Guest" value={guestName} />
        </div>

        <ReceiptDivider />

        {/* Line items — rooms */}
        <div className="mb-4">
          <h3
            className="text-xs font-bold uppercase tracking-wider opacity-90 mb-3"
            style={{ color: "var(--color-charcoal)" }}
          >
            Room details
          </h3>
          {rooms.length > 0 ? (
            <ul
              className="space-y-2.5 text-sm"
              style={{ color: "var(--color-charcoal)" }}
            >
              {rooms.map((room: any, idx: number) => {
                const price =
                  typeof room.price === "number"
                    ? room.price
                    : parseFloat(String(room.price || 0));
                const name =
                  room.room_number != null
                    ? `Room ${room.room_number} (${room.type || "—"})`
                    : (room.name ?? room.type ?? "Room");
                return (
                  <li key={idx} className="flex justify-between gap-4">
                    <div>
                      <span className="font-medium">{name}</span>
                      <span className="block text-xs opacity-75">
                        Capacity: {room.capacity ?? "—"}
                        {room.status ? ` · ${room.status}` : ""}
                      </span>
                    </div>
                    <span className="font-semibold tabular-nums shrink-0">
                      {pricingFormat(price)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p
              className="text-sm italic opacity-70"
              style={{ color: "var(--color-charcoal)" }}
            >
              No rooms selected
            </p>
          )}
        </div>

        {/* Line items — venues */}
        {venues.length > 0 && (
          <>
            <div className="mb-4">
              <h3
                className="text-xs font-bold uppercase tracking-wider opacity-90 mb-3"
                style={{ color: "var(--color-charcoal)" }}
              >
                Venue details
              </h3>
              <ul
                className="space-y-2.5 text-sm"
                style={{ color: "var(--color-charcoal)" }}
              >
                {venues.map((venue: any, idx: number) => {
                  const price =
                    typeof venue.price === "number"
                      ? venue.price
                      : parseFloat(String(venue.price || 0));
                  return (
                    <li key={idx} className="flex justify-between gap-4">
                      <div>
                        <span className="font-medium">
                          {venue.name ?? "Venue"}
                        </span>
                        <span className="block text-xs opacity-75">
                          Capacity: {venue.capacity ?? "—"}
                        </span>
                      </div>
                      <span className="font-semibold tabular-nums shrink-0">
                        {pricingFormat(price)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        <ReceiptDivider />

        {/* Calculation — like a real receipt */}
        <div className="text-sm" style={{ color: "var(--color-charcoal)" }}>
          <h3
            className="text-xs font-bold uppercase tracking-wider opacity-90 mb-3"
            style={{ color: "var(--color-charcoal)" }}
          >
            Calculation
          </h3>
          <div
            className="rounded-lg p-3 space-y-2"
            style={{
              backgroundColor: "var(--color-sage-muted, #e8efe4)",
              borderColor: receiptBorder,
            }}
          >
            <div className="flex justify-between">
              <span className="opacity-90">Rooms (per night)</span>
              <span className="tabular-nums">{pricingFormat(roomsTotal)}</span>
            </div>
            {venues.length > 0 && (
              <div className="flex justify-between">
                <span className="opacity-90">Venues (per night)</span>
                <span className="tabular-nums">
                  {pricingFormat(venuesTotal)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-2 border-t border-black/10">
              <span>Per night total</span>
              <span className="tabular-nums">
                {pricingFormat(perNightTotal)}
              </span>
            </div>
            <div className="flex justify-between opacity-90">
              <span>
                × {nights} night{nights !== 1 ? "s" : ""}
              </span>
              <span className="tabular-nums">
                = {pricingFormat(displayGrandTotal)}
              </span>
            </div>
          </div>
          <div
            className="flex justify-between font-bold text-base mt-3 pt-2"
            style={{ color: "var(--color-charcoal)" }}
          >
            <span>Grand total</span>
            <span
              className="tabular-nums"
              style={{ color: "var(--color-sage)" }}
            >
              {pricingFormat(displayGrandTotal)}
            </span>
          </div>
        </div>

        <ReceiptDivider />

        {/* Merchant / logo */}
        <div className="flex flex-col items-center py-2">
          <img
            src="/brand-logo.webp"
            alt=""
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
          />
          <div className="text-center mt-2">
            <div
              className="font-display green text-lg tracking-widest font-bold"
            >
              MARCELINO&apos;S
            </div>
            <div
              className="text-xs tracking-widest font-medium opacity-80"
            >
              RESORT AND HOTEL
            </div>
          </div>
        </div>

        {/* QR + footer — only show QR when URL exists */}
        <div className="text-center pt-2">
          {qrCodeUrl ? (
            <div
              className="inline-block p-2 bg-white rounded-lg border mb-2"
              style={{ borderColor: "var(--color-sage-muted)" }}
            >
              <img
                src={qrBase64}
                alt="QR Code Image"
                className="max-h-52 max-w-52 object-contain"
                loading="lazy"
              />
            </div>
          ) : null}
          <p
            className="text-xs opacity-75 mb-1"
            style={{ color: "var(--color-charcoal)" }}
          >
            {qrCodeUrl ? "Scan for digital receipt" : null}
          </p>
          <div
            className="text-xs opacity-75 space-y-0.5"
            style={{ color: "var(--color-charcoal)" }}
          >
            {paymentMethod ? <p>Payment: {paymentMethod}</p> : null}
            <p>Issued on {issuedOn}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-center gap-3 mt-6">
          <button
            onClick={downloadReceipt}
            className="cursor-pointer text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 w-full md:w-auto hover:opacity-95"
            style={{ backgroundColor: "var(--color-sage)" }}
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          <button
            onClick={handleBookAnother}
            className="cursor-pointer text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 w-full md:w-auto border-2 hover:opacity-95"
            style={{
              backgroundColor: "var(--color-sage)",
              borderColor: "var(--color-sage)",
            }}
          >
            <House className="w-4 h-4" />
            Book Another Room
          </button>
          <button
            onClick={handleCancel}
            disabled={isCancelled || cancelBooking.isPending}
            className={`text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 w-full md:w-auto
    ${
      isCancelled || cancelBooking.isPending
        ? "opacity-50 cursor-not-allowed"
        : "hover:opacity-95"
    }
  `}
            style={{ backgroundColor: "var(--color-sage)" }}
          >
            {cancelBooking.isPending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                ></span>
                Cancelling...
              </>
            ) : isCancelled ? (
              "Booking Cancelled"
            ) : (
              "Cancel Booking"
            )}
          </button>
        </div>
      </div>
      <Modal
        open={isCancelModalOpen}
        onClose={() => !isSubmitting && setIsCancelModalOpen(false)}
        showCloseButton={!isSubmitting}
      >
        <CancelBookingContent
          onCancel={() => !isSubmitting && setIsCancelModalOpen(false)}
          onConfirm={async () => {
            setIsSubmitting(true); // optional: show loader

            try {
              // Call your API to cancel the booking
              await cancelBooking.mutateAsync({
                url: `/bookings/${referenceNumber}/cancel`,
              });

              // Close the modal
              setIsCancelModalOpen(false);

              // Reload the page to update booking status
              window.location.reload();
            } catch (error) {
              console.error(error);
              setIsSubmitting(false);
            }
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </motion.div>
  );
}
