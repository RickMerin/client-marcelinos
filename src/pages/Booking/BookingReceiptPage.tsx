import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { API } from "@/lib/api/apiClient";

interface BookingReceiptPageProps {
  receiptToken: string;
}

const RECEIPT_STEP = 5;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isReceiptTokenUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/** Map deprecated merged `status` when API has not yet sent split fields. */
function splitLegacyBookingStatus(merged: string | undefined): {
  booking_status: string;
  payment_status: string;
} {
  const s = String(merged ?? "").toLowerCase();
  const paymentFromStay = (stay: string): string => {
    if (stay === "occupied" || stay === "completed") return "paid";
    return "unpaid";
  };
  if (
    s === "unpaid" ||
    s === "partial" ||
    s === "paid" ||
    s === "refunded" ||
    s === "refund_pending" ||
    s === "occupied" ||
    s === "completed" ||
    s === "cancelled" ||
    s === "rescheduled"
  ) {
    const booking_status =
      s === "occupied"
        ? "occupied"
        : s === "completed"
          ? "completed"
          : s === "cancelled"
            ? "cancelled"
            : s === "rescheduled"
              ? "rescheduled"
              : "reserved";
    const payment_status =
      s === "unpaid" ||
      s === "partial" ||
      s === "paid" ||
      s === "refunded" ||
      s === "refund_pending"
        ? s
        : paymentFromStay(s);
    return { booking_status, payment_status };
  }
  return { booking_status: "reserved", payment_status: "unpaid" };
}

/** Transform GET /bookings/receipt/:token (or legacy reference) response into BookingReceipt format for Step5 */
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
  const specialDiscountValueNum = Number(b.special_discount_value ?? 0);
  const specialDiscountOriginalTotalNum = Number(
    b.special_discount_original_total_price ?? 0,
  );
  const specialDiscountAmountNum = Number(b.special_discount_amount_applied ?? 0);
  const paymentMethod = res.payment?.method ?? b.payment_method ?? "cash";
  const paymentPlan = res.payment?.plan ?? b.online_payment_plan ?? "";
  const invoiceId = res.payment?.invoice_id ?? b.xendit_invoice_id ?? "";
  const invoiceUrl = res.payment?.invoice_url ?? b.xendit_invoice_url ?? "";
  const canRetry = Boolean(res.payment?.can_retry);
  const amountPaid = Number(res.payment?.amount_paid ?? 0);
	const balance = Number(
		res.payment?.balance ?? Math.max(0, Number(total) || 0),
	);
  const amountDueNow = Number(
		res.payment?.amount_due_now ?? Math.max(0, Number(total) || 0),
	);
  const legacy = splitLegacyBookingStatus(b.status);
  const booking_status = b.booking_status ?? legacy.booking_status;
  const payment_status = b.payment_status ?? legacy.payment_status;
  return {
		reference_number: b.reference_number ?? "",
		unpaid_expires_at: res.unpaid_expires_at ?? null,
		unpaid_expiry_days: res.unpaid_expiry_days ?? 3,
		down_payment_notice_applies: res.down_payment_notice_applies,
		down_payment_notice_min_lead_days: res.down_payment_notice_min_lead_days,
		down_payment_percent: res.down_payment_percent,
		use_messenger_deposit_instructions: res.use_messenger_deposit_instructions,
		created_at: b.created_at ?? "",
		booking_status,
		payment_status,
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
			bed_specifications: Array.isArray(r.bed_specifications)
				? r.bed_specifications
				: [],
		})),
		room_lines: Array.isArray(b.room_lines)
			? b.room_lines.map((l: Record<string, unknown>) => ({
					room_type: String(l.room_type ?? ""),
					inventory_group_key: String(l.inventory_group_key ?? ""),
					quantity: Number(l.quantity) || 0,
					unit_price_per_night:
						typeof l.unit_price_per_night === "number" ||
						typeof l.unit_price_per_night === "string"
							? (l.unit_price_per_night as number | string)
							: 0,
				}))
			: [],
		has_room_stay:
			(Array.isArray(b.room_lines) ? b.room_lines.length : 0) > 0 ||
			(b.rooms?.length ?? 0) > 0,
		venues: (b.venues ?? []).map((v) => ({
			name: v.name ?? "",
			capacity: v.capacity ?? 0,
			wedding_price:
				(v as { wedding_price?: number | string }).wedding_price ?? 0,
			birthday_price:
				(v as { birthday_price?: number | string }).birthday_price ?? 0,
			meeting_staff_price:
				(v as { meeting_staff_price?: number | string }).meeting_staff_price ??
				0,
		})),
		venue_event_type: b.venue_event_type ?? null,
		subtotal: total,
		grand_total: total,
		special_discount_type: b.special_discount_type ?? null,
		special_discount_value: Number.isFinite(specialDiscountValueNum)
			? specialDiscountValueNum
			: 0,
		special_discount_original_total_price: Number.isFinite(
			specialDiscountOriginalTotalNum,
		)
			? specialDiscountOriginalTotalNum
			: 0,
		special_discount_amount_applied: Number.isFinite(specialDiscountAmountNum)
			? specialDiscountAmountNum
			: 0,
		qr_code_url: res.qr_code_url ?? null,
		email_verification_required: Boolean(res.email_verification_required),
		payment_method: paymentMethod,
		online_payment_plan: paymentPlan,
		invoice_id: invoiceId,
		invoice_url: invoiceUrl,
		can_retry_payment: canRetry,
		amount_paid: Number.isFinite(amountPaid) ? amountPaid : 0,
		balance: Number.isFinite(balance) ? balance : 0,
		amount_due_now: Number.isFinite(amountDueNow) ? amountDueNow : 0,
		cancellation_refund: res.cancellation_refund,
	};
}

export function BookingReceiptPage({
  receiptToken,
}: BookingReceiptPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const paymentMode = searchParams.get("payment_mode");
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);

  const useLegacyReferenceLookup = !isReceiptTokenUuid(receiptToken);
  const receiptApiPath = useLegacyReferenceLookup
    ? `/bookings/reference/${encodeURIComponent(receiptToken)}`
    : `/bookings/receipt/${receiptToken}`;
  const queryKey = useMemo(
		() =>
			useLegacyReferenceLookup
				? queryKeys.bookings.byReference(receiptToken)
				: queryKeys.bookings.byReceiptToken(receiptToken),
		[receiptToken, useLegacyReferenceLookup],
	);

  useEffect(() => {
    clearBookingStorage();
  }, []);

  const { data, isLoading, isError } = useApiQuery<BookingReferenceResponse>(
    [...queryKey],
    receiptApiPath,
    { retry: 1, staleTime: 10_000 },
  );

  const receiptRefetchInFlightRef = useRef(false);
	const refetchReceipt = useCallback(async () => {
		if (receiptRefetchInFlightRef.current) return;
		receiptRefetchInFlightRef.current = true;
		try {
			await queryClient.refetchQueries({ queryKey: [...queryKey] });
		} finally {
			receiptRefetchInFlightRef.current = false;
		}
	}, [queryClient, queryKey]);

  useEffect(() => {
    if (!data?.booking?.receipt_token || !useLegacyReferenceLookup) return;
    const t = data.booking.receipt_token;
    if (t && t !== receiptToken) {
      navigate(`/booking-receipt/${t}`, { replace: true });
    }
  }, [data, useLegacyReferenceLookup, receiptToken, navigate]);

  useEffect(() => {
		if (paymentStatus !== "success" || !isReceiptTokenUuid(receiptToken))
			return;

		const mode = /^partial_(\d{1,2})$/.test(String(paymentMode ?? ""))
			? String(paymentMode)
			: "full";
		void API.post<{ success: boolean }>(
			`/bookings/receipt/${encodeURIComponent(receiptToken)}/confirm-payment`,
			{ payment_mode: mode },
		)
			.then(() => refetchReceipt())
			.catch(() => {
				// Keep receipt usable even if payment sync fails; banner still informs user.
			});
	}, [paymentMode, paymentStatus, receiptToken, refetchReceipt]);

  useEffect(() => {
		if (!isReceiptTokenUuid(receiptToken)) return;

		const poll = async () => {
			if (document.visibilityState !== "visible") return;
			try {
				const statusRes = await API.get<{
					success: boolean;
					data?: { status?: string; invoice_url?: string };
				}>(
					`/bookings/receipt/${encodeURIComponent(receiptToken)}/payment-status`,
				);
				const nextStatus = String(statusRes?.data?.status ?? "").toLowerCase();
				if (
					nextStatus === "paid" ||
					nextStatus === "partial" ||
					nextStatus === "refunded"
				) {
					void refetchReceipt();
				}
			} catch {
				// Keep polling best-effort only.
			}
		};

		const id = window.setInterval(poll, 12000);
		return () => window.clearInterval(id);
	}, [receiptToken, refetchReceipt]);

  const receipt = useMemo(() => (data ? toBookingReceipt(data) : null), [data]);
  const qrCodeUrl = receipt?.qr_code_url ?? data?.qr_code_url ?? null;

  const realtimeChannelId =
    isReceiptTokenUuid(receiptToken) && receiptToken
      ? receiptToken
      : (data?.booking?.receipt_token ?? "");

  const refetchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleRealtimeEvent = useCallback(() => {
		if (refetchDebounceRef.current) clearTimeout(refetchDebounceRef.current);
		refetchDebounceRef.current = setTimeout(() => {
			refetchDebounceRef.current = null;
			void refetchReceipt();
		}, 400);
	}, [refetchReceipt]);

  useEffect(
    () => () => {
      if (refetchDebounceRef.current) clearTimeout(refetchDebounceRef.current);
    },
    [],
  );

  useRealtimeEvent({
    channel: RealtimeChannels.booking(realtimeChannelId),
    event: "BookingStatusUpdated",
    isPrivate: false,
    enabled: !!realtimeChannelId,
    onEvent: handleRealtimeEvent,
  });

  if (isLoading) {
    return (
			<main
				className="booking-funnel min-h-screen flex flex-col items-center pb-10 landing-section-alt"
				style={{ backgroundColor: "var(--color-cream)" }}>
				<div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12 pt-15">
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
          <p className="text-sm mt-2">
            {useLegacyReferenceLookup
              ? `Reference: ${receiptToken}`
              : `Receipt ID: ${receiptToken}`}
          </p>
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

  const paymentStatusLower = String(receipt.payment_status ?? "").toLowerCase();
  const hasSuccessParam = paymentStatus === "success";
  const payInFull =
		!hasSuccessParam &&
		receipt.payment_method === "online" &&
		receipt.can_retry_payment === true &&
		(paymentStatusLower === "unpaid" || paymentStatusLower === "partial");

  const dueNowAmount = Math.max(0, Number(receipt.amount_due_now ?? 0));
	const paymentActionLabel = (() => {
		if (paymentStatusLower === "partial") {
			return `Pay Remaining Balance Online (${dueNowAmount > 0 ? `₱${dueNowAmount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Amount Pending"})`;
		}
		if (String(receipt.online_payment_plan ?? "").startsWith("partial_")) {
			return `Pay Deposit Online (${dueNowAmount > 0 ? `₱${dueNowAmount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Amount Pending"})`;
		}
		return `Pay Online (${dueNowAmount > 0 ? `₱${dueNowAmount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Amount Pending"})`;
	})();

  const handleRetryPayment = async () => {
    if (!isReceiptTokenUuid(receiptToken) || isRetryingPayment) return;

    setIsRetryingPayment(true);
    try {
      const res = await API.post<{ success: boolean; payment_url?: string }>(
        `/bookings/receipt/${encodeURIComponent(receiptToken)}/retry-payment`,
      );
      const paymentUrl = res?.payment_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }
      await refetchReceipt();
    } finally {
      setIsRetryingPayment(false);
    }
  };

  return (
		<main
			className="booking-funnel min-h-screen flex flex-col items-center pb-10 landing-section-alt"
			style={{ backgroundColor: "var(--color-cream)" }}>
			<div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12 pt-15">
				<ProgressIndicator currentStep={RECEIPT_STEP} />
				{PaymentStatusBanner}
				<div className="mt-6 mb-8">
					<Step5
						receiptData={receipt}
						qrCodeUrl={qrCodeUrl}
						onlinePaymentAction={{
							visible: payInFull,
							label: paymentActionLabel,
							isLoading: isRetryingPayment,
							onClick: handleRetryPayment,
						}}
					/>
				</div>
			</div>
		</main>
	);
}
