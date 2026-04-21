import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarClock, CircleX, Download, House } from "lucide-react";
import domtoimage from "dom-to-image";
import { BookingReceipt } from "@/types/booking.types";
import {
  calculateVenuesLineTotal,
  venueEffectiveUnitPrice,
} from "@/lib/math/calculate";
import {
  MESSENGER_CHAT_URL,
  VENUE_EVENT_OPTIONS,
} from "@/lib/constants/booking.constants";
import { clearBookingStorage } from "@/lib/storage/localStorage";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import {
  assignedRoomBillingTitle,
  formatRoomLineTitle,
} from "@/lib/formatters/roomDisplayName";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import CancelBookingContent from "@/components/modals/CancelBookingContent";
import RescheduleBookingContent from "@/components/modals/RescheduleBookingContent";
import Modal from "@/components/modals/Modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLoader } from "@/components/ui/loader";
import { getEcho } from "@/lib/realtime/echo";
import { RealtimeChannels } from "@/lib/realtime/channels";
import BubbleChat from "@/components/BubbleChat";
import { toast } from "@/lib/logger/toast";

interface Step5FormDataProps {
  formData: any;
  /** Admin payment policy deposit % (from GET /payment-settings); defaults if omitted. */
  depositPercent?: number;
  receiptData?: never;
  onlinePaymentAction?: {
    visible: boolean;
    label: string;
    isLoading: boolean;
    onClick: () => void;
  };
}

interface Step5ReceiptDataProps {
  receiptData: BookingReceipt;
  qrCodeUrl?: string | null;
  formData?: never;
  onlinePaymentAction?: {
    visible: boolean;
    label: string;
    isLoading: boolean;
    onClick: () => void;
  };
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
    //    channel.listen(".booking.cancelled", (e: any) => {
    //   setBooking((prev) =>
    //     prev ? { ...prev, status: e.status } : prev
    //   );
    // });

    // ✅ RESCHEDULE EVENT (ADD THIS HERE)
    channel.listen(".booking.rescheduled", (e: any) => {
      setBooking((prev) =>
        prev
          ? {
              ...prev,
              status: e.booking.status,
            }
          : prev,
      );
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
        className="w-full max-w-3xl shadow-lg border border-gold-light/50 rounded-lg overflow-hidden bg-white"
      >
        {/* Header skeleton */}
        <div className="bg-sea text-white px-4 py-3 sm:px-8 sm:py-5 flex flex-col gap-4 md:flex-row items-stretch md:items-center justify-between w-full">
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

          <div className="border-t border-dashed my-4 border-sand-dark/35" />

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

          <div className="border-t border-dashed my-4 border-sand-dark/35" />

          {/* Line items table skeleton */}
          <div className="overflow-hidden border border-sand-dark/35 rounded-md">
            <div className="bg-sage-muted px-4 py-2.5 flex gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex gap-4 px-4 py-2.5 ${i % 2 === 0 ? "bg-white" : "bg-sage-muted/30"}`}
              >
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 flex-1 max-w-[200px]" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>

          {/* Totals section */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-8 items-start mt-1">
            <div className="text-xs text-ink-soft max-w-xs space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex justify-between pt-2 border-t border-sand-dark/35">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>

          <div className="border-t border-dashed my-4 border-sand-dark/35" />

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

/** Facebook Messenger mark (single-color for use on branded button). */
function MessengerGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M12 2C6.477 2 2 5.973 2 10.889c0 2.096.698 4.04 1.876 5.644L2 22l6.131-1.59A8.93 8.93 0 0 0 12 20.778c5.523 0 10-3.973 10-8.889S17.523 2 12 2zm1.193 12.462-2.95-3.14-4.6 2.47 5.48-5.81 2.95 3.14 4.57-2.47-5.45 5.81z" />
    </svg>
  );
}

function parseDateInput(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatReceiptDate(value?: string, includeTime = true): string {
  const parsed = parseDateInput(value);
  if (!parsed) return value ?? "—";

  if (!includeTime) {
    return parsed.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  }

  return parsed.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Formats `unpaid_expires_at` ISO (source of truth: Booking::unpaidExpiresAt, 9:00 PM Manila on check-in day). */
function formatDownPaymentDeadline(value?: string): string {
  const parsed = parseDateInput(value);
  if (!parsed) return value ?? "—";
  return parsed.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });
}

/** Fallback when receipt API or wizard omits admin deposit percent. */
const DEFAULT_DEPOSIT_PERCENT = 30;

/** Bold emphasis for key peso amounts. */
const AMOUNT_PRIMARY = "font-bold tabular-nums text-ink";
const AMOUNT_SECONDARY = "font-bold tabular-nums text-sea";

/** Align with Booking::DOWN_PAYMENT_NOTICE_MIN_LEAD_DAYS when API omits it. */
const DEFAULT_DOWN_PAYMENT_NOTICE_MIN_LEAD_DAYS = 4;

/** Calendar days from booking date to check-in date (start-of-day). */
function leadDaysBetweenBookingAndCheckIn(
  createdAtStr: string | undefined,
  checkInStr: string | undefined,
): number | null {
  const c = parseDateInput(createdAtStr);
  const ci = parseDateInput(checkInStr);
  if (!c || !ci) return null;
  const cDay = Date.UTC(c.getFullYear(), c.getMonth(), c.getDate());
  const ciDay = Date.UTC(ci.getFullYear(), ci.getMonth(), ci.getDate());
  const diffMs = ciDay - cDay;
  if (diffMs < 0) return null;
  return Math.round(diffMs / (86400 * 1000));
}

/** Fallback when API omits `unpaid_expires_at`: check-in calendar day at 21:00 local (align with Booking::unpaidExpiresAt). */
function checkInDayNinePmLocal(checkInStr: string | undefined): Date | null {
  const parsed = parseDateInput(checkInStr);
  if (!parsed) return null;
  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
    21,
    0,
    0,
    0,
  );
}

function computeUnpaidExpiresIso(
  explicit: string | null | undefined,
  checkInStr: string | undefined,
): string | null {
  if (explicit) return explicit;
  const d = checkInDayNinePmLocal(checkInStr);
  return d ? d.toISOString() : null;
}

function getNightsFromDates(
  checkInValue?: string,
  checkOutValue?: string,
  fallback = 0,
): number {
  // Receipt rule: nights are displayed as booked days minus one.
  const fallbackNights = Math.max(0, Math.round(fallback) - 1);
  const checkInDate = parseDateInput(checkInValue);
  const checkOutDate = parseDateInput(checkOutValue);

  if (!checkInDate || !checkOutDate) return fallbackNights;

  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  if (diffMs <= 0) return fallbackNights;

  const bookedDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, bookedDays - 1);
}

function buildMessengerChatUrl(baseUrl: string, message: string): string {
  const safeBaseUrl = (baseUrl ?? "").trim();
  if (!safeBaseUrl) return "";
  const encodedMessage = encodeURIComponent(message);

  try {
    const parsed = new URL(safeBaseUrl);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const pageTarget = parsed.pathname.replace(/^\/+/, "");

    // Some environments report certificate issues on m.me; use facebook web inbox route.
    const normalizedUrl =
      host === "m.me" && pageTarget
        ? new URL(`https://www.facebook.com/messages/t/${pageTarget}`)
        : parsed;

    normalizedUrl.searchParams.set("text", message);
    return normalizedUrl.toString();
  } catch {
    const separator = safeBaseUrl.includes("?") ? "&" : "?";
    return `${safeBaseUrl}${separator}text=${encodedMessage}`;
  }
}

export function Step5(props: Props) {
  const navigate = useNavigate();

  const isFromApi = isReceiptData(props);
  const receipt: BookingReceipt | undefined = props.receiptData;
  const form = props.formData;
  const qrCodeUrl = isFromApi ? (props.qrCodeUrl ?? null) : null;
  const onlinePaymentAction = props.onlinePaymentAction;

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
  const bookingStatusResolved = bookingStatus ?? "reserved";
  const paymentStatus =
    (isFromApi ? receipt?.payment_status : form?.payment_status) ?? "unpaid";

  const checkIn = isFromApi ? receipt?.check_in : form?.check_in;
  const checkOut = isFromApi ? receipt?.check_out : form?.check_out;
  const nights =
    isFromApi &&
    receipt?.nights != null &&
    !Number.isNaN(Number(receipt.nights))
      ? Math.max(0, Number(receipt.nights))
      : getNightsFromDates(checkIn, checkOut, receipt?.nights ?? 0);

  const bookingType = isFromApi
    ? (() => {
        const hasRooms =
          (receipt?.rooms?.length ?? 0) > 0 ||
          (receipt?.room_lines?.length ?? 0) > 0;
        const hasVenues = (receipt?.venues?.length ?? 0) > 0;
        if (hasRooms && hasVenues) return "both";
        if (hasVenues) return "venue";
        return "room";
      })()
    : (form?.booking_type ?? "room");

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
  const includeRoomTimes = isFromApi
    ? (receipt?.has_room_stay ?? false)
    : (() => {
        const bt = form?.booking_type ?? "room";
        if (bt === "venue") return false;
        if (bt === "both" && (!form?.rooms || form.rooms.length === 0))
          return false;
        return true;
      })();

  const formattedCreatedAt = formatReceiptDate(createdAt);
  const formattedCheckIn = formatReceiptDate(checkIn, includeRoomTimes);
  const formattedCheckOut = formatReceiptDate(checkOut, includeRoomTimes);
  const formattedIssuedOn = formatReceiptDate(issuedOn);
  const paymentMethod = isFromApi
    ? receipt?.payment_method
    : form?.paymentMethod;
  const onlinePaymentPlan = isFromApi
    ? receipt?.online_payment_plan
    : form?.onlinePaymentPlan;
  const partialPlanMatch = /^partial_(\d{1,2})$/.exec(
    String(onlinePaymentPlan ?? ""),
  );
  const partialPlanPercent = partialPlanMatch
    ? Number(partialPlanMatch[1])
    : null;
  const hasValidPartialPlan =
    partialPlanPercent != null &&
    Number.isFinite(partialPlanPercent) &&
    partialPlanPercent > 0 &&
    partialPlanPercent < 100;
  const paymentMethodLabel =
    paymentMethod === "online"
      ? hasValidPartialPlan
        ? `Online (Partial ${partialPlanPercent}%)`
        : "Online (Full)"
      : paymentMethod || undefined;

  const isCancelled =
    bookingStatusResolved === "cancelled" ||
    bookingStatusResolved === "completed"; //for display purposes, treat completed same as cancelled since booking is no longer active
  const isCancel = bookingStatusResolved === "completed"; //for downloading receipt only, hide cancel button if already completed
  const isRescheduled = bookingStatusResolved === "rescheduled";

  const cancelBooking = useApiMutation<void>("patch", {
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message || "Failed to cancel booking.";
      toast.error({ content: msg });
    },
  });

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [isProcessingReschedule, setIsProcessingReschedule] = useState(false);

  useEffect(() => {
    if (bookingStatusResolved === "rescheduled") {
      setIsProcessingReschedule(false);
    }
  }, [bookingStatusResolved]);

  const roomsFromApi =
    receipt != null
      ? Array.isArray(receipt.rooms) && receipt.rooms.length > 0
        ? receipt.rooms.map((r: any) => ({
            room_number: r.number ?? null,
            type: r.type ?? "",
            name: r.name ?? "",
            bed_specifications: r.bed_specifications ?? [],
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
                bed_specifications:
                  (receipt.room as any).bed_specifications ?? [],
                capacity: receipt.room.capacity,
                price: parseFloat(receipt.room.price),
                status: "",
              },
            ]
          : []
      : [];

  const roomLinesFromApi =
    isFromApi && receipt?.room_lines?.length
      ? receipt.room_lines.map((l) => ({
          kind: "line" as const,
          room_type: l.room_type,
          inventory_group_key: l.inventory_group_key,
          quantity: l.quantity,
          price:
            typeof l.unit_price_per_night === "number"
              ? l.unit_price_per_night
              : parseFloat(String(l.unit_price_per_night || 0)),
        }))
      : [];
  const roomsFromForm = Array.isArray(form?.rooms) ? form.rooms : [];
  const rooms =
    isFromApi && roomsFromApi.length === 0 && roomLinesFromApi.length > 0
      ? roomLinesFromApi
      : isFromApi
        ? roomsFromApi
        : roomsFromForm;

  const venuesFromApi = receipt?.venues ?? [];
  const venuesFromForm = Array.isArray(form?.venues) ? form.venues : [];
  const venues = isFromApi ? venuesFromApi : venuesFromForm;

  const venueEventTypeRaw = (() => {
    const raw =
      (isFromApi ? receipt?.venue_event_type : form?.venue_event_type) ||
      "wedding";
    return raw === "seminar" ? "meeting_staff" : raw;
  })();
  const venueEventLabel =
    VENUE_EVENT_OPTIONS.find((o) => o.value === venueEventTypeRaw)?.label ??
    venueEventTypeRaw;
  const venueEventDescription =
    venueEventTypeRaw === "wedding"
      ? " For wedding bookings, you are given one (1) day ahead—before check-in—for decorating and preparing the venue."
      : "";

  const grandTotal =
    isFromApi && receipt
      ? parseFloat(receipt.grand_total)
      : (form?.grandTotalPrice ?? 0);

  const nightsForPricing = isFromApi
    ? Math.max(1, receipt?.nights ?? 1)
    : Math.max(1, form?.days ?? 1);

  const roomsTotal = rooms.reduce((sum: number, r: any) => {
    const p =
      typeof r.price === "number" ? r.price : parseFloat(String(r.price || 0));
    if (r.kind === "line") {
      return sum + p * (r.quantity || 1);
    }
    return sum + p;
  }, 0);
  const venuesLinePerNight = calculateVenuesLineTotal(
    venues as Parameters<typeof calculateVenuesLineTotal>[0],
    venueEventTypeRaw as "wedding" | "birthday" | "meeting_staff" | "",
  );
  const roomsGrandTotal = roomsTotal * nightsForPricing;
  const venuesGrandTotal = venuesLinePerNight * nightsForPricing;
  const calculatedGrandTotal = roomsGrandTotal + venuesGrandTotal;
  const displayGrandTotal =
    isFromApi && receipt ? grandTotal : calculatedGrandTotal;
  const amountPaid = Math.max(0, Number(receipt?.amount_paid ?? 0));
  const remainingBalance = Math.max(
    0,
    Number(receipt?.balance ?? displayGrandTotal - amountPaid),
  );

  const unpaidExpiresIso = computeUnpaidExpiresIso(
    isFromApi ? receipt?.unpaid_expires_at : undefined,
    checkIn,
  );
  const minLeadDays =
    receipt?.down_payment_notice_min_lead_days ??
    DEFAULT_DOWN_PAYMENT_NOTICE_MIN_LEAD_DAYS;
  const leadDaysBookingToCheckIn = leadDaysBetweenBookingAndCheckIn(
    createdAt,
    checkIn,
  );
  const downPaymentNoticeAppliesFromSchedule =
    leadDaysBookingToCheckIn !== null &&
    leadDaysBookingToCheckIn >= minLeadDays;
  const downPaymentNoticeApplies =
    receipt?.down_payment_notice_applies !== undefined
      ? receipt.down_payment_notice_applies
      : downPaymentNoticeAppliesFromSchedule;

  const bookingStatusLower = String(bookingStatusResolved ?? "").toLowerCase();
  const paymentStatusLower = String(paymentStatus ?? "").toLowerCase();
  const hideBookingActionButtons =
    bookingStatusLower === "occupied" || bookingStatusLower === "completed";
  const useMessengerFromApi =
    isFromApi && receipt?.use_messenger_deposit_instructions === true;

  const showMessengerDepositBlock =
    isFromApi &&
    !isCancelled &&
    paymentStatusLower === "unpaid" &&
    useMessengerFromApi;

  const showLegacyThreeDayDepositBlock =
    isFromApi &&
    !isCancelled &&
    paymentStatusLower === "unpaid" &&
    unpaidExpiresIso != null &&
    downPaymentNoticeApplies &&
    !useMessengerFromApi;

  const showDepositSplit =
    showMessengerDepositBlock || showLegacyThreeDayDepositBlock;
  const depositPercent = isFromApi
    ? (receipt?.down_payment_percent ?? DEFAULT_DEPOSIT_PERCENT)
    : ((props as Step5FormDataProps).depositPercent ?? DEFAULT_DEPOSIT_PERCENT);
  const downPaymentRate = depositPercent / 100;
  const downPaymentPercentLabel = `${depositPercent}%`;
  const remainingAfterDownPercentLabel = `${100 - depositPercent}%`;
  const downPaymentAmount = displayGrandTotal * downPaymentRate;
  const balanceAfterDownPayment = Math.max(
    0,
    displayGrandTotal - downPaymentAmount,
  );
  const formattedDownPaymentDue = unpaidExpiresIso
    ? formatDownPaymentDeadline(unpaidExpiresIso)
    : "—";

  const [isDownloading, setIsDownloading] = useState(false);
  const messengerMessageLines = [
    "Hello Marcelino's Resort Hotel!",
    "",
    `I would like to settle my ${downPaymentPercentLabel} deposit for this booking.`,
    `Reference No.: ${referenceNumber || "—"}`,
    `Guest Name: ${guestName || "—"}`,
    `Check-in: ${formattedCheckIn || "—"}`,
    `Check-out: ${formattedCheckOut || "—"}`,
    `Reservation Total: ${pricingFormat(displayGrandTotal)}`,
    `Deposit Amount (${downPaymentPercentLabel}): ${pricingFormat(downPaymentAmount)}`,
    "",
    "Thank you!",
  ];
  const messengerPrefilledMessage = messengerMessageLines.join("\n");
  const messengerChatUrlWithMessage = buildMessengerChatUrl(
    MESSENGER_CHAT_URL,
    messengerPrefilledMessage,
  );

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

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
    switch (String(status).toLowerCase()) {
      case "complete":
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
      case "reserved":
        return "bg-sage-muted text-sea";
      case "occupied":
        return "bg-green-100 text-green-800";
      case "rescheduled":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-sand text-ink";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (String(status).toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-amber-100 text-amber-800";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-sand text-ink";
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
      variants={fadeInUp}
    >
      <div
        id="receipt"
        role="document"
        aria-label="Billing Statement"
        className="w-full max-w-3xl shadow-lg border border-gold-light/50 rounded-lg overflow-hidden bg-white print:shadow-none relative"
        style={{
          borderColor: receiptBorder || "var(--color-sage-muted, #d1e7dd)",
        }}
      >
        <div className="relative z-10">
          {/* Responsive Top Header Bar */}
          <div className="bg-sea text-white px-4 py-3 sm:px-8 sm:py-5 flex flex-col gap-4 md:gap-0 md:flex-row items-stretch md:items-center justify-between w-full">
            {/* Logo and Title */}
            <div className="flex flex-row items-center gap-3 min-w-0">
              <img
                src="/brand-logo.webp"
                alt="Marcelino's logo"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] opacity-80 truncate">
                  Marcelino&apos;s Resort Hotel
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
                    Statement No.:
                  </span>
                  <span className="tabular-nums break-all">
                    {referenceNumber || "—"}
                  </span>
                </p>
                <p className="flex w-full flex-wrap justify-end gap-x-1 text-right">
                  <span className="font-semibold whitespace-nowrap">
                    Issued:
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
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sea mb-1">
                  Accountable to
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
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sea mb-1">
                  Remittance to
                </p>
                <p className="font-semibold text-base">
                  Marcelino&apos;s Resort Hotel
                </p>
                <div className="mt-1 text-xs space-y-0.5 opacity-80">
                  <address>
                    Mabini ST. Eastern Barangay Poblacion, Hilongos,
                    Philippines, 6524
                  </address>
                  <p>Phone: 09063034150</p>
                  <p>Phone: 09541865049</p>
                  <p>Email: marcelinosresorthotel@gmail.com</p>
                </div>
              </div>
            </div>

            <ReceiptDivider />

            {/* Booking summary */}
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <ReceiptRow label="Check-in" value={formattedCheckIn} />
                <ReceiptRow label="Check-out" value={formattedCheckOut} />
                <ReceiptRow
                  label={bookingType === "venue" ? "Days" : "Nights"}
                  value={String(nights)}
                />
                {venues.length > 0 && (
                  <>
                    <ReceiptRow label="Event type" value={venueEventLabel} />
                    {venueEventDescription ? (
                      <p className="mt-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs italic text-amber-900">
                        {venueEventDescription}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
              <div className="space-y-1.5 sm:text-right">
                <ReceiptRow
                  label="Stay status"
                  value={bookingStatusResolved}
                  valueClassName={
                    bookingStatusResolved
                      ? `font-semibold ${getBookingStatusColor(
                          bookingStatusResolved,
                        )} px-2 py-0.5 rounded inline-block capitalize`
                      : "font-semibold"
                  }
                />
                {isFromApi && (
                  <ReceiptRow
                    label="Payment status"
                    value={paymentStatus}
                    valueClassName={
                      paymentStatus
                        ? `font-semibold ${getPaymentStatusColor(
                            paymentStatus,
                          )} px-2 py-0.5 rounded inline-block capitalize`
                        : "font-semibold"
                    }
                  />
                )}
                {showLegacyThreeDayDepositBlock && (
                  <>
                    <ReceiptRow
                      label="Deposit due by"
                      value={formattedDownPaymentDue}
                      valueClassName="font-semibold text-amber-800"
                    />
                    <ReceiptRow
                      label={`Deposit (${downPaymentPercentLabel} of total)`}
                      value={pricingFormat(downPaymentAmount)}
                      valueClassName={AMOUNT_PRIMARY}
                    />
                  </>
                )}
                {showMessengerDepositBlock && (
                  <ReceiptRow
                    label={`Deposit (${downPaymentPercentLabel} of total)`}
                    value={pricingFormat(downPaymentAmount)}
                    valueClassName={AMOUNT_PRIMARY}
                  />
                )}
                {paymentMethodLabel && (
                  <ReceiptRow
                    label="Payment method"
                    value={paymentMethodLabel}
                  />
                )}
                {isFromApi && (
                  <>
                    <ReceiptRow
                      label="Amount paid"
                      value={pricingFormat(amountPaid)}
                      valueClassName={AMOUNT_PRIMARY}
                    />
                    <ReceiptRow
                      label="Remaining balance"
                      value={pricingFormat(remainingBalance)}
                      valueClassName={AMOUNT_SECONDARY}
                    />
                  </>
                )}
              </div>
            </div>

            {bookingType === "venue" && venues.length > 0 && (
              <div className="flex justify-center mt-3 mb-1">
                <span className="text-[11px] sm:text-xs font-medium text-amber-800 bg-amber-50 px-3 py-1 rounded-md italic text-center shadow-sm border border-amber-200">
                  *Check-in time: 8:00 AM - Check-out time: 12:00 AM
                </span>
              </div>
            )}

            <ReceiptDivider />

            {/* Rooms items table */}
            {rooms.length > 0 && (
              <div className="overflow-hidden border border-sand-dark/35 rounded-md">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-sage-muted">
                    <tr className="text-left bg-sea text-white">
                      <th className="px-3 py-2 sm:px-4 sm:py-2.5 w-10">No.</th>
                      <th className="px-3 py-2 sm:px-4 sm:py-2.5">Room</th>
                      <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-right whitespace-nowrap">
                        Rate
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-center">
                        Night(s)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-4 text-center text-xs italic text-ink-soft"
                        >
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
                          const title =
                            room.kind === "line"
                              ? formatRoomLineTitle({
                                  room_type: room.room_type,
                                  inventory_group_key: room.inventory_group_key,
                                  quantity: room.quantity,
                                })
                              : assignedRoomBillingTitle(room);
                          return (
                            <tr
                              key={`room-${idx}`}
                              className={
                                idx % 2 === 0 ? "bg-white" : "bg-sage-muted/30"
                              }
                            >
                              <td className="px-3 py-2 sm:px-4 sm:py-2.5 align-top">
                                #{String(idx + 1)}
                              </td>
                              <td className="px-3 py-2 sm:px-4 sm:py-2.5 align-top">
                                <div className="font-medium">{title} </div>
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
            )}

            {/* Venues items table */}
            {venues.length > 0 && (
              <div className="overflow-hidden border border-sand-dark/35 rounded-md">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-sage-muted">
                    <tr className="text-left bg-sea text-white">
                      <th className="px-3 py-2 sm:px-4 sm:py-2.5 w-10">No.</th>
                      <th className="px-3 py-2 sm:px-4 sm:py-2.5">Venue</th>
                      <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-right whitespace-nowrap">
                        Rate
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-center">
                        Day(s)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {venues.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-4 text-center text-xs italic text-ink-soft"
                        >
                          No venues selected
                        </td>
                      </tr>
                    ) : (
                      <>
                        {venues.map((venue: any, idx: number) => {
                          const unitPrice = venueEffectiveUnitPrice(
                            venue,
                            venueEventTypeRaw as
                              | "wedding"
                              | "birthday"
                              | "meeting_staff"
                              | "",
                          );
                          const qty = nightsForPricing;

                          return (
                            <tr
                              key={`venue-${idx}`}
                              className={
                                (rooms.length + idx) % 2 === 0
                                  ? "bg-white"
                                  : "bg-sage-muted/30"
                              }
                            >
                              <td className="px-3 py-2 sm:px-4 sm:py-2.5 align-top">
                                #
                                {String(rooms.length + idx + 1).padStart(
                                  2,
                                  "0",
                                )}
                              </td>
                              <td className="px-3 py-2 sm:px-4 sm:py-2.5 align-top flex gap-2">
                                <div className="font-medium">
                                  {venue.name ?? "Venue"}
                                </div>
                                <div className="sm:text-xs text-ink-soft mt-0.5">
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
            )}

            {/* Totals section */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-8 items-start mt-1">
              <div className="text-xs text-ink-soft max-w-xs space-y-2">
                <p>
                  Thank you for choosing Marcelino&apos;s Resort Hotel. Please
                  bring a valid ID at check-in.
                </p>
                {showLegacyThreeDayDepositBlock && (
                  <p className="text-amber-900/90 border-l-2 border-amber-500 pl-2 leading-relaxed">
                    <strong>Next step:</strong> Pay your deposit by{" "}
                    <strong>{formattedDownPaymentDue}</strong> so this
                    reservation stays confirmed. The amounts and schedule are in
                    the payment summary. Unpaid bookings may be cancelled after
                    9:00 PM (Philippine time) on your check-in date if not
                    settled.
                  </p>
                )}
                {showMessengerDepositBlock && (
                  <div className="text-ink border-l-2 border-gold pl-2 space-y-3 leading-relaxed">
                    <p>
                      <strong>Next step:</strong> To settle your{" "}
                      {downPaymentPercentLabel} down payment, please message us
                      on Facebook Messenger. Click the button below to open the
                      chat. Please attach your proof of payment in the message
                      so we can verify your deposit. Unpaid bookings may be
                      cancelled after 9:00 PM (Philippine time) on your check-in
                      date if not settled.
                    </p>
                    <a
                      href={messengerChatUrlWithMessage || MESSENGER_CHAT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0084FF] px-3 py-2 text-white text-xs font-semibold shadow-sm hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0084FF]"
                    >
                      <MessengerGlyph className="size-5 shrink-0" aria-hidden />
                      <span>Open Messenger</span>
                    </a>
                  </div>
                )}
              </div>
              <div className="w-full sm:w-72 shrink-0">
                <div className="space-y-1 text-sm">
                  {showDepositSplit ? (
                    <>
                      <div className="flex justify-between items-baseline gap-2 border-b border-gold-light/40 pb-2 mb-1">
                        <span className="font-semibold text-ink">
                          Reservation total
                        </span>
                        <span className="tabular-nums font-semibold text-sea text-base">
                          {pricingFormat(displayGrandTotal)}
                        </span>
                      </div>
                      <p className="text-ink-soft mb-1">
                        How this total is split:
                      </p>
                      <div className="flex justify-between items-center gap-2 text-ink">
                        <span className="opacity-90">
                          Due now — deposit ({downPaymentPercentLabel})
                        </span>
                        <span className={AMOUNT_PRIMARY}>
                          {pricingFormat(downPaymentAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2 text-ink-soft">
                        <span className="opacity-90">
                          Due later — balance ({remainingAfterDownPercentLabel})
                        </span>
                        <span className={AMOUNT_SECONDARY}>
                          {pricingFormat(balanceAfterDownPayment)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 text-xs text-ink-soft">
                        <span>Deposit + balance</span>
                        <span className="tabular-nums">
                          = {pricingFormat(displayGrandTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-sand-dark/35">
                        <span className="opacity-80">Tax (0%)</span>
                        <span className="tabular-nums">{pricingFormat(0)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="opacity-80">Tax (0%)</span>
                        <span className="tabular-nums">{pricingFormat(0)}</span>
                      </div>
                      <div className="flex justify-between border-t border-sand-dark/35 pt-2 mt-1 font-semibold text-base">
                        <span>Total</span>
                        <span className="tabular-nums text-sea">
                          {pricingFormat(displayGrandTotal)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <ReceiptDivider />

            {/* Footer with logo + QR / payment info */}
            <div className="grid sm:grid-cols-[1.5fr,1fr] gap-4 items-center">
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <p className="font-display text-base tracking-[0.3em] font-bold text-sea">
                    MARCELINO&apos;S
                  </p>
                  <p className="tracking-[0.25em] font-medium text-ink-soft">
                    RESORT AND HOTEL
                  </p>
                  <p className="text-ink-soft mt-1">
                    This document is system-generated and does not require a
                    physical signature.
                  </p>
                </div>
              </div>

              <div className="text-center">
                {qrCodeUrl ? (
                  <div className="inline-block p-2 bg-white rounded-lg border mb-2 border-gold-light/50">
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
                <p className="text-ink-soft mb-1">
                  {qrCodeUrl ? "Scan to view your digital receipt" : null}
                </p>
                <div className="text-ink-soft space-y-0.5">
                  {paymentMethodLabel && <p>Payment: {paymentMethodLabel}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt actions: primary / secondary / destructive hierarchy */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {!isCancel && (
            <button
              type="button"
              onClick={downloadReceipt}
              disabled={isDownloading}
              className={`min-h-11 px-5 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 w-full sm:w-auto text-ink bg-gold hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/80 focus-visible:ring-offset-2 ${
                isDownloading
                  ? "opacity-80 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {isDownloading ? (
                <>
                  <ButtonLoader size="sm" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 shrink-0" />
                  Download Receipt
                </>
              )}
            </button>
          )}
          {onlinePaymentAction?.visible && (
            <button
              type="button"
              onClick={onlinePaymentAction.onClick}
              disabled={onlinePaymentAction.isLoading}
              className="min-h-11 px-5 py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 w-full sm:w-auto bg-sea text-white hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea/70 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {onlinePaymentAction.isLoading
                ? "Preparing payment link..."
                : onlinePaymentAction.label}
            </button>
          )}
          <button
            type="button"
            onClick={handleBookAnother}
            className="cursor-pointer min-h-11 px-5 py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 w-full sm:w-auto border-2 border-sea text-sea bg-white hover:bg-sage-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea/50 focus-visible:ring-offset-2"
          >
            <House className="w-4 h-4 shrink-0" />
            Book Another Room
          </button>
        </div>
        {!isCancelled && !hideBookingActionButtons && (
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {!isRescheduled && (
              <button
                type="button"
                onClick={() => setIsRescheduleModalOpen(true)}
                disabled={isProcessingReschedule}
                className={`min-h-11 px-5 py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 w-full sm:w-auto border-2 border-sea text-sea bg-white hover:bg-sage-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea/50 focus-visible:ring-offset-2 ${
                  isProcessingReschedule
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {isProcessingReschedule ? (
                  <>
                    <span
                      className="inline-block w-4 h-4 border-2 border-sea border-t-transparent rounded-full animate-spin shrink-0"
                      role="status"
                      aria-label="Processing"
                    />
                    Rescheduling...
                  </>
                ) : (
                  <>
                    <CalendarClock className="w-4 h-4 shrink-0" />
                    Reschedule Booking
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              disabled={isProcessingCancel || cancelBooking.isPending}
              className={`min-h-11 px-5 py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 w-full sm:w-auto border-2 border-red-600 text-red-700 bg-white hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
                isProcessingCancel || cancelBooking.isPending
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {isProcessingCancel || cancelBooking.isPending ? (
                <>
                  <span
                    className="inline-block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin shrink-0"
                    role="status"
                    aria-label="Cancelling"
                  />
                  Cancelling...
                </>
              ) : (
                <>
                  <CircleX className="w-4 h-4 shrink-0" />
                  Cancel Booking
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <Modal
        open={isCancelModalOpen}
        onClose={() => !isSubmitting && setIsCancelModalOpen(false)}
        showCloseButton={!isSubmitting}
      >
        <CancelBookingContent
          referenceNumber={referenceNumber || ""}
          onCancel={() => !isSubmitting && setIsCancelModalOpen(false)}
          onConfirm={async (otp) => {
            setIsSubmitting(true);
            setIsProcessingCancel(true); // immediately lock button

            try {
              await cancelBooking.mutateAsync({
                url: `/bookings/${referenceNumber}/cancel`,
                body: { otp },
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
      <Modal
        open={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        contentClassName="relative bg-green-800 text-left p-0 rounded-2xl shadow-xl w-full max-w-4xl mx-4 overflow-hidden"
      >
        <RescheduleBookingContent
          referenceNumber={referenceNumber || ""}
          onClose={() => setIsRescheduleModalOpen(false)}
          onSuccess={() => setIsProcessingReschedule(true)}
          currentCheckIn={checkIn}
          currentDays={nights || 1}
          bookingType={bookingType}
        />
      </Modal>
      {/* 🔵 Floating Chat Bubble */}
      <BubbleChat />
    </motion.div>
  );
}
