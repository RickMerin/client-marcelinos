import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import {
  BookingReceipt,
  BookingReferenceResponse,
} from "@/types/booking.types";
import { Step5, Step5Skeleton } from "./Steps/Step5";
import { ProgressIndicator } from "./ProgressIndicator";
import { clearBookingStorage } from "@/lib/storage/localStorage";
import { useRealtimeEvent } from "@/hooks/useRealtimeEvent";
import { RealtimeChannels } from "@/lib/realtime/channels";
import { queryKeys } from "@/lib/api/endpoints";

interface BookingReceiptPageProps {
  referenceNumber: string;
}

const RECEIPT_STEP = 5;

/** Transform GET /bookings/reference/:ref response into BookingReceipt format for Step5 */
function toBookingReceipt(
  res: BookingReferenceResponse,
): BookingReceipt | null {
  const b = res.booking;
  if (!b) return null;
  const guest = b.guest;
  const guestName = guest
    ? [guest.first_name, guest.middle_name, guest.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || "—"
    : "—";
  const addressParts = guest
    ? [
        guest.street,
        guest.barangay,
        guest.municipality,
        guest.province,
        guest.region,
        guest.country,
      ].filter(Boolean)
    : [];
  const guestAddress = addressParts.length > 0 ? addressParts.join(", ") : "—";
  const total = b.total_price != null ? String(b.total_price) : "0";
  return {
    reference_number: b.reference_number ?? "",
    created_at: b.created_at ?? "",
    booking_status: b.status ?? "unpaid",
    check_in: b.check_in ?? "",
    check_out: b.check_out ?? "",
    issued_on: b.created_at ?? new Date().toISOString(),
    nights: b.no_of_days ?? 0,
    guest_name: guestName,
    guest_email: guest?.email ?? "—",
    guest_contact: guest?.contact_num ?? "—",
    guest_address: guestAddress,
    rooms: (b.rooms ?? []).map((r) => ({
      name: r.name ?? "",
      type: r.type ?? "",
      capacity: r.capacity ?? 0,
      price: r.price ?? 0,
      bed_specifications: r.bed_specifications ?? [],
    })),
    venues: (b.venues ?? []).map((v) => ({
      name: v.name ?? "",
      capacity: v.capacity ?? 0,
      price: v.price ?? 0,
    })),
    subtotal: total,
    grand_total: total,
    qr_code_url: res.qr_code_url ?? null,
  };
}

export function BookingReceiptPage({
  referenceNumber,
}: BookingReceiptPageProps) {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  useEffect(() => {
    clearBookingStorage();
  }, []);

  const { data, isLoading, isError } = useApiQuery<BookingReferenceResponse>(
    [...queryKeys.bookings.byReference(referenceNumber)],
    `/bookings/reference/${referenceNumber}`,
    { retry: 1, staleTime: 10_000 },
  );

  const receipt = useMemo(() => (data ? toBookingReceipt(data) : null), [data]);
  const qrCodeUrl = receipt?.qr_code_url ?? data?.qr_code_url ?? null;

  const refetchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleRealtimeEvent = useCallback(() => {
    if (refetchDebounceRef.current) clearTimeout(refetchDebounceRef.current);
    refetchDebounceRef.current = setTimeout(() => {
      refetchDebounceRef.current = null;
      queryClient.refetchQueries({
        queryKey: queryKeys.bookings.byReference(referenceNumber),
      });
    }, 400);
  }, [queryClient, referenceNumber]);

  useEffect(
    () => () => {
      if (refetchDebounceRef.current) clearTimeout(refetchDebounceRef.current);
    },
    [],
  );

  useRealtimeEvent({
    channel: RealtimeChannels.booking(referenceNumber),
    event: "BookingStatusUpdated",
    isPrivate: false,
    enabled: !!referenceNumber,
    onEvent: handleRealtimeEvent,
  });

  if (isLoading) {
    return (
      <main
        className="min-h-screen flex flex-col items-center p-4 pb-10 landing-section-alt"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        <div className="w-full max-w-6xl mx-auto">
          <ProgressIndicator currentStep={RECEIPT_STEP} />
          <div className="mt-6 mb-8">
            <Step5Skeleton />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !receipt) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Receipt not found or failed to load.</p>
          <p className="text-sm mt-2">Reference: {referenceNumber}</p>
        </div>
      </main>
    );
  }

  const PaymentStatusBanner = paymentStatus ? (
    <div
      className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
        paymentStatus === "success"
          ? "bg-green-100 text-green-800"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      <span>
        {paymentStatus === "success"
          ? "Payment successful! Your booking is confirmed."
          : "Payment was not completed. You can pay at the resort upon check-in."}
      </span>
      <button
        type="button"
        onClick={() => setSearchParams({})}
        className="text-sm underline opacity-80 hover:opacity-100"
      >
        Dismiss
      </button>
    </div>
  ) : null;

  return (
    <main
      className="min-h-screen flex flex-col items-center p-4 pb-10 landing-section-alt"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <div className="w-full max-w-6xl mx-auto">
        <ProgressIndicator currentStep={RECEIPT_STEP} />
        {PaymentStatusBanner}
        <div className="mt-6 mb-8">
          <Step5 receiptData={receipt} qrCodeUrl={qrCodeUrl} />
        </div>
      </div>
    </main>
  );
}
