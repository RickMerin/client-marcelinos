import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, House } from "lucide-react";
import domtoimage from "dom-to-image";
import { BookingReceipt } from "@/types/booking.types";
import { clearBookingStorage } from "@/lib/storage/localStorage";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import CancelBookingContent from "@/components/modals/CancelBookingContent";
import Modal from "@/components/modals/Modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLoader } from "@/components/ui/loader";
import { getEcho } from "@/lib/realtime/echo";
import { RealtimeChannels } from "@/lib/realtime/channels";
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

interface Booking {
  reference: string;
  status: string;
  total_price: number;
}

export default function ReceiptPage({
  referenceNumber,
}: {
  referenceNumber: string;
}) {
  const [booking, setBooking] = useState<Booking | null>(null);
  useEffect(() => {
    const echo = getEcho();
    if (!echo || !referenceNumber) return;
    const channel = echo.private(RealtimeChannels.booking(referenceNumber));
    channel.listen(".booking.cancelled", (e: any) => {
      setBooking((prev) => (prev ? { ...prev, status: e.status } : prev));
    });
    return () => {
      echo.leave(RealtimeChannels.booking(referenceNumber));
    };
  }, [referenceNumber]);
  return (
    <div>
      {" "}
      <h1> Receipt </h1> <p> Status: {booking?.status} </p>{" "}
    </div>
  );
} 
 
 

type Props = Step5FormDataProps | Step5ReceiptDataProps;

function isReceiptData(props: Props): props is Step5ReceiptDataProps {
  return "receiptData" in props && props.receiptData != null;
}

const receiptBorder = "";

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
      <span className={`${valueClassName} text-right`}>{display}</span>
    </div>
  );
}

export function Step5(props: Props) {
  const navigate = useNavigate();

  const isFromApi = isReceiptData(props);
  const receipt: BookingReceipt | undefined = props.receiptData;
  const form = props.formData;
  const qrCodeUrl = isFromApi ? (props.qrCodeUrl ?? null) : null;

  const { data: qrBase64, isLoading: isQrLoading } = useQuery({
    queryKey: ["qr-code", qrCodeUrl ?? ""],
    queryFn: async () => {
      if (!qrCodeUrl) return undefined;
      const res = await fetch(qrCodeUrl);
      const svgText = await res.text();
      return `data:image/svg+xml;base64,${btoa(svgText)}`;
    },
    enabled: !!qrCodeUrl,
  });

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
      ? [form.firstName, form.middleName, form.lastName]
          .filter(Boolean)
          .join(" ")
          .trim() || "—"
      : "—";

  const guestEmail = isFromApi ? receipt?.guest_email : form?.email;
  const guestPhone = isFromApi ? receipt?.guest_contact : form?.phone;
  const guestAddress = isFromApi ? receipt?.guest_address : form?.address;
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
            type: r.type ?? "",
            name: r.name ?? "",
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
  const roomsGrandTotal = nights > 0 ? roomsTotal * nights : roomsTotal;
  const venuesGrandTotal = venuesTotal;
  const calculatedGrandTotal = roomsGrandTotal + venuesGrandTotal;
  const displayGrandTotal =
    isFromApi && receipt ? grandTotal : calculatedGrandTotal;

  const [isDownloading, setIsDownloading] = useState(false);

  const downloadReceipt = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
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
    } finally {
      setIsDownloading(false);
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
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen pb-10"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}>
      <div
        id="receipt"
        role="document"
        aria-label="Billing Statement"
        className="w-full max-w-3xl shadow-lg border border-emerald-100/70 rounded-lg overflow-hidden bg-white print:shadow-none"
        style={{
          borderColor: receiptBorder || "var(--color-sage-muted, #d1e7dd)",
        }}>
        {/* Responsive Top Header Bar */}
        <div className="bg-emerald-800 text-white px-4 py-3 sm:px-8 sm:py-5 flex flex-col gap-4 md:gap-0 md:flex-row items-stretch md:items-center justify-between w-full">
          {/* Logo and Title */}
          <div className="flex flex-row items-center gap-3 min-w-0">
            <img
              src="/brand-logo.webp"
              alt="Marcelino's logo"
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] opacity-80 truncate">
                Marcelino&apos;s Resort &amp; Hotel
              </p>
              <p className="text-sm opacity-80 truncate">Billing Statement</p>
            </div>
          </div>
          {/* Invoice Section */}
          <div className="flex flex-col items-end md:text-right w-full md:w-auto">
            <p className="text-lg sm:text-2xl font-semibold tracking-[0.22em] uppercase leading-snug">
              Invoice
            </p>
            <div className="mt-2 text-xs space-y-0.5 opacity-90">
              <p className="flex flex-wrap gap-x-1">
                <span className="font-semibold whitespace-nowrap">
                  Invoice No:
                </span>
                <span className="tabular-nums break-all">
                  {referenceNumber || "—"}
                </span>
              </p>
              <p className="flex flex-wrap gap-x-1">
                <span className="font-semibold whitespace-nowrap">
                  Invoice Date:
                </span>
                <span className="break-all">
                  {issuedOn || createdAt || "—"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="px-6 py-6 sm:px-8 sm:py-7 space-y-6 text-sm">
          {/* Invoice to / from */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700 mb-1">
                Invoice To
              </p>
              <p className="font-semibold text-base">{guestName}</p>
              <div className="mt-1 text-xs space-y-0.5 opacity-80">
                {guestAddress && <p>{guestAddress}</p>}
                {guestPhone && <p>Phone: {guestPhone}</p>}
                {guestEmail && <p>Email: {guestEmail}</p>}
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700 mb-1">
                Invoice From
              </p>
              <p className="font-semibold text-base">
                Marcelino&apos;s Resort &amp; Hotel
              </p>
              <div className="mt-1 text-xs space-y-0.5 opacity-80">
                <address>
                  Mabini ST. Easter Barangay Poblacion, Hilongos, Philippines,
                  6524
                </address>
                <p>Phone: ************</p>
                <p>Email: ************</p>
              </div>
            </div>
          </div>

          <ReceiptDivider />

          {/* Booking summary */}
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <ReceiptRow label="Booking Created" value={createdAt} />
              <ReceiptRow label="Check-in" value={checkIn} />
              <ReceiptRow label="Check-out" value={checkOut} />
              <ReceiptRow label="Nights" value={String(nights)} />
            </div>
            <div className="space-y-1.5 sm:text-right">
              <ReceiptRow
                label="Status"
                value={bookingStatus}
                valueClassName={
                  bookingStatus
                    ? `font-semibold ${getBookingStatusColor(
                        bookingStatus,
                      )} px-2 py-0.5 rounded inline-block capitalize`
                    : "font-semibold"
                }
              />
              {paymentMethod && (
                <ReceiptRow label="Payment Method" value={paymentMethod} />
              )}
              <ReceiptRow label="Reference No." value={referenceNumber} />
              <ReceiptRow label="Issued" value={issuedOn} />
            </div>
          </div>

          <ReceiptDivider />

          {/* Line items table */}
          <div className="overflow-hidden border border-gray-200 rounded-md">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-emerald-50">
                <tr className="text-left">
                  <th className="px-3 py-2 sm:px-4 sm:py-2.5 w-10">No.</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-2.5">Room / Venue</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-right whitespace-nowrap">
                    Rate
                  </th>
                  <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-center">
                    Nights / Day
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.length === 0 && venues.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-4 text-center text-xs italic text-gray-500">
                      No rooms or venues selected
                    </td>
                  </tr>
                ) : (
                  <>
                    {rooms.map((room: any, idx: number) => {
                      const unitPrice =
                        typeof room.price === "number"
                          ? room.price
                          : parseFloat(String(room.price || 0));
                      const qty = nights || 1;
                      // const lineTotal = unitPrice * qty;
                      const title = room.name ?? "Room";
                      const type = room.type ?? "Room";

                      return (
                        <tr
                          key={`room-${idx}`}
                          className={
                            idx % 2 === 0 ? "bg-white" : "bg-emerald-50/30"
                          }>
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5 align-top">
                            #{String(idx + 1)}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5 align-top">
                            <div className="font-medium">
                              {title}{" "}
                              {type && (
                                <span className="text-gray-500 text-xs">
                                  ({type})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5 text-right align-top tabular-nums">
                            {pricingFormat(unitPrice)}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5 text-center align-top">
                            {qty}
                          </td>
                        </tr>
                      );
                    })}
                    {venues.map((venue: any, idx: number) => {
                      const unitPrice =
                        typeof venue.price === "number"
                          ? venue.price
                          : parseFloat(String(venue.price || 0));
                      const qty = 1;
                      const lineTotal = unitPrice * qty;

                      return (
                        <tr
                          key={`venue-${idx}`}
                          className={
                            (rooms.length + idx) % 2 === 0
                              ? "bg-white"
                              : "bg-emerald-50/30"
                          }>
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5 align-top">
                            {String(rooms.length + idx + 1).padStart(2, "0")}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5 align-top">
                            <div className="font-medium">
                              {venue.name ?? "Venue"}
                            </div>
                            <div className="text-[11px] sm:text-xs text-gray-600 mt-0.5">
                              Capacity: {venue.capacity ?? "—"}
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5 text-right align-top tabular-nums">
                            {pricingFormat(unitPrice)}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5 text-center align-top">
                            {qty}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5 text-right align-top tabular-nums">
                            {pricingFormat(lineTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals section */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-8 items-start mt-1">
            <div className="text-xs text-gray-600 max-w-xs">
              <p>
                Thank you for choosing Marcelino&apos;s Resort &amp; Hotel.
                Please present this billing statement upon check-in.
              </p>
            </div>
            <div className="w-full sm:w-64">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">Subtotal</span>
                  <span className="tabular-nums">
                    {pricingFormat(displayGrandTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Tax (0%)</span>
                  <span className="tabular-nums">{pricingFormat(0)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-1 font-semibold text-base">
                  <span>Total</span>
                  <span className="tabular-nums text-emerald-700">
                    {pricingFormat(displayGrandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <ReceiptDivider />

          {/* Footer with logo + QR / payment info */}
          <div className="grid sm:grid-cols-[1.5fr,1fr] gap-4 items-center">
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <p className="font-display text-base tracking-[0.3em] font-bold text-emerald-800">
                  MARCELINO&apos;S
                </p>
                <p className="text-[11px] tracking-[0.25em] font-medium text-gray-600">
                  RESORT AND HOTEL
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  This document is system-generated and does not require a
                  physical signature.
                </p>
              </div>
            </div>

            <div className="text-center">
              {qrCodeUrl ? (
                <div className="inline-block p-2 bg-white rounded-lg border mb-2 border-emerald-100">
                  {isQrLoading || !qrBase64 ? (
                    <Skeleton className="h-40 w-40 rounded-md" />
                  ) : (
                    <img
                      src={qrBase64}
                      alt="QR Code Image"
                      className="max-h-40 max-w-40 object-contain mx-auto"
                      loading="lazy"
                    />
                  )}
                </div>
              ) : null}
              <p className="text-[11px] text-gray-600 mb-1">
                {qrCodeUrl ? "Scan to view your digital receipt" : null}
              </p>
              <div className="text-[11px] text-gray-600 space-y-0.5">
                {paymentMethod && <p>Payment: {paymentMethod}</p>}
                <p>Issued on {issuedOn}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing action buttons + modal stay the same */}
      <div>
        <div className="flex flex-col md:flex-row justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={downloadReceipt}
            disabled={isDownloading}
            className={`text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 w-full md:w-auto ${
              isDownloading
                ? "opacity-80 cursor-not-allowed"
                : "cursor-pointer hover:opacity-95"
            }`}
            style={{ backgroundColor: "var(--color-sage)" }}>
            {isDownloading ? (
              <>
                <ButtonLoader size="sm" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Receipt
              </>
            )}
          </button>
          <button
            onClick={handleBookAnother}
            className="cursor-pointer text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 w-full md:w-auto border-2 hover:opacity-95"
            style={{
              backgroundColor: "var(--color-sage)",
              borderColor: "var(--color-sage)",
            }}>
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
            style={{ backgroundColor: "var(--color-sage)" }}>
            {cancelBooking.isPending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"></span>
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
        showCloseButton={!isSubmitting}>
        <CancelBookingContent
          onCancel={() => !isSubmitting && setIsCancelModalOpen(false)}
          onConfirm={async () => {
            setIsSubmitting(true);
            try {
              await cancelBooking.mutateAsync({
                url: `/bookings/${referenceNumber}/cancel`,
              });
              setIsCancelModalOpen(false);
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
