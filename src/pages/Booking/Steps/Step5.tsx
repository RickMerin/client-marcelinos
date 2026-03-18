import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, House, CircleX } from "lucide-react";
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
import BubbleChat from "@/components/BubbleChat";

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

/** Skeleton loader that mirrors the receipt layout while data loads */
export function Step5Skeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen pb-10">
      <div
        role="status"
        aria-label="Loading receipt"
        className="w-full max-w-3xl shadow-lg border border-emerald-100/70 rounded-lg overflow-hidden bg-white">
        {/* Header skeleton */}
        <div className="bg-emerald-800 text-white px-4 py-3 sm:px-8 sm:py-5 flex flex-col gap-4 md:flex-row items-stretch md:items-center justify-between w-full">
          <div className="flex flex-row items-center gap-3 min-w-0">
            <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-full shrink-0 bg-white/20" />
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-3 w-32 bg-white/20" />
              <Skeleton className="h-3 w-24 bg-white/20" />
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Skeleton className="h-6 w-24 bg-white/20" />
            <Skeleton className="h-4 w-48 bg-white/20" />
            <Skeleton className="h-4 w-48 bg-white/20" />
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="px-6 py-6 sm:px-8 sm:py-7 space-y-6 text-sm">
          {/* Invoice to / from */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="sm:text-right space-y-2">
              <Skeleton className="h-3 w-24 ml-auto" />
              <Skeleton className="h-4 w-40 ml-auto" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-32 ml-auto" />
              <Skeleton className="h-3 w-28 ml-auto" />
            </div>
          </div>

          <div className="border-t border-dashed my-4 border-gray-200" />

          {/* Booking summary */}
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            <div className="space-y-3 sm:text-right">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-end gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed my-4 border-gray-200" />

          {/* Line items table skeleton */}
          <div className="overflow-hidden border border-gray-200 rounded-md">
            <div className="bg-emerald-50 px-4 py-2.5 flex gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex gap-4 px-4 py-2.5 ${i % 2 === 0 ? "bg-white" : "bg-emerald-50/30"}`}>
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 flex-1 max-w-[200px]" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>

          {/* Totals section */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-8 items-start mt-1">
            <div className="text-xs text-gray-600 max-w-xs space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>

          <div className="border-t border-dashed my-4 border-gray-200" />

          {/* Footer skeleton */}
          <div className="grid sm:grid-cols-[1.5fr,1fr] gap-4 items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="flex flex-col items-center">
              <Skeleton className="h-40 w-40 rounded-lg" />
              <Skeleton className="h-3 w-44 mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex flex-col md:flex-row justify-center gap-3 mt-6 w-full max-w-3xl">
        <Skeleton className="h-10 w-full md:w-44 rounded-lg" />
        <Skeleton className="h-10 w-full md:w-44 rounded-lg" />
        <Skeleton className="h-10 w-full md:w-40 rounded-lg" />
      </div>

      <span className="sr-only">Loading receipt…</span>
    </div>
  );
}

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

function parseDateInput(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatReceiptDate(value?: string): string {
  const parsed = parseDateInput(value);
  if (!parsed) return value ?? "—";

  return parsed.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getNightsFromDates(
  checkInValue?: string,
  checkOutValue?: string,
  fallback = 0,
): number {
  const checkInDate = parseDateInput(checkInValue);
  const checkOutDate = parseDateInput(checkOutValue);

  if (!checkInDate || !checkOutDate) return Math.max(0, Math.round(fallback));

  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  if (diffMs <= 0) return Math.max(0, Math.round(fallback));

  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
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
  const nights = getNightsFromDates(checkIn, checkOut, receipt?.nights ?? 0);
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
  const formattedCreatedAt = formatReceiptDate(createdAt);
  const formattedCheckIn = formatReceiptDate(checkIn);
  const formattedCheckOut = formatReceiptDate(checkOut);
  const formattedIssuedOn = formatReceiptDate(issuedOn);
  const paymentMethod = isFromApi ? undefined : form?.paymentMethod;

  const isCancelled =
    bookingStatus === "cancelled" || bookingStatus === "completed"; //for display purposes, treat completed same as cancelled since booking is no longer active
  const isCancel = bookingStatus === "completed"; //for downloading receipt only, hide cancel button if already completed

  const cancelBooking = useApiMutation<void>("patch", {
    onError: () => {
      alert("Failed to cancel booking.");
    },
  });

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);

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
        link.download = `marcelinos-hotel-resort-billing-statement-${referenceNumber || "-"}.png`;
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
        className="w-full max-w-3xl shadow-lg border border-emerald-100/70 rounded-lg overflow-hidden bg-white print:shadow-none relative"
        style={{
          borderColor: receiptBorder || "var(--color-sage-muted, #d1e7dd)",
        }}>
        {/* Background watermark logo */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none">
          <img
            src="/brand-logo.webp"
            alt=""
            className="w-52 sm:w-72 lg:w-150 opacity-10 object-contain"
          />
        </div>

        <div className="relative z-10">
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
                <p className="flex w-full flex-wrap justify-end gap-x-1 text-right">
                  <span className="font-semibold whitespace-nowrap">
                    Invoice No:
                  </span>
                  <span className="tabular-nums break-all">
                    {referenceNumber || "—"}
                  </span>
                </p>
                <p className="flex w-full flex-wrap justify-end gap-x-1 text-right">
                  <span className="font-semibold whitespace-nowrap">
                    Invoice Date:
                  </span>
                  <span className="break-all">
                    {formattedIssuedOn || formattedCreatedAt || "—"}
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
                  {}
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
                <ReceiptRow
                  label="Booking Created"
                  value={formattedCreatedAt}
                />
                <ReceiptRow label="Check-in" value={formattedCheckIn} />
                <ReceiptRow label="Check-out" value={formattedCheckOut} />
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
                <ReceiptRow label="Issued" value={formattedIssuedOn} />
              </div>
            </div>

            <ReceiptDivider />

            {/* Line items table */}
            <div className="overflow-hidden border border-gray-200 rounded-md">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-emerald-50">
                  <tr className="text-left">
                    <th className="px-3 py-2 sm:px-4 sm:py-2.5 w-10">No.</th>
                    <th className="px-3 py-2 sm:px-4 sm:py-2.5">
                      Room / Venue
                    </th>
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
                        // const lineTotal = unitPrice * qty;

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
                  <p>Issued on {formattedIssuedOn}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing action buttons + modal stay the same */}
      <div>
        <div className="flex flex-col md:flex-row justify-center gap-3 mt-6">
          {!isCancel && (
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
          )}
          <button
            onClick={handleBookAnother}
            className="cursor-pointer text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 w-full md:w-auto hover:opacity-95"
            style={{
              backgroundColor: "var(--color-sage)",
              borderColor: "var(--color-sage)",
            }}>
            <House className="w-4 h-4" />
            Book Another Room
          </button>
          {!isCancelled && (
            <button
              onClick={handleCancel}
              disabled={isProcessingCancel || cancelBooking.isPending}
              className={`text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 w-full md:w-auto ${
                isProcessingCancel || cancelBooking.isPending
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-95"
              }`}
              style={{ backgroundColor: "var(--color-sage)" }}>
              {isProcessingCancel || cancelBooking.isPending ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"></span>
                  Cancelling...
                </>
              ) : (
                <>
                  <CircleX className="w-4 h-4" />
                  Cancel Booking
                </>
              )}
            </button>
          )}
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
            setIsProcessingCancel(true); // immediately lock button

            try {
              await cancelBooking.mutateAsync({
                url: `/bookings/${referenceNumber}/cancel`,
              });

              setIsCancelModalOpen(false);
              // DO NOT set isProcessingCancel(false) here
              // Let WebSocket update the status instead
            } catch (error) {
              console.error(error);
              setIsSubmitting(false);
              setIsProcessingCancel(false); // unlock only if error
            }
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* 🔵 Floating Chat Bubble */}
      <BubbleChat />
    </motion.div>
  );
}
