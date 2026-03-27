"use client";

import { useEffect, useState } from "react";
import { ButtonLoader } from "@/components/ui/loader";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import { toast } from "@/lib/logger/toast";

const OTP_RESEND_SECONDS = 60;

interface CancelBookingContentProps {
  onCancel: () => void;
  onConfirm: (otp: string) => void | Promise<void>;
  isSubmitting?: boolean;
  referenceNumber: string;
}

export default function CancelBookingContent({
  onCancel,
  onConfirm,
  isSubmitting = false,
  referenceNumber,
}: CancelBookingContentProps) {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const sendOtp = useApiMutation<{ message?: string }>("post", {
    onError: (err: Error & { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.otp?.[0] ||
        err?.response?.data?.errors?.phone?.[0] ||
        "Could not send verification code.";
      toast.error({ content: msg });
    },
  });

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const countdownBlocking = secondsLeft > 0 || isSubmitting;
  const otpDigits = otp.replace(/\D/g, "").slice(0, 6);
  const canConfirm =
    !countdownBlocking &&
    otpSent &&
    otpDigits.length === 6 &&
    !sendOtp.isPending;

  const handleSendOtp = async () => {
    if (!referenceNumber || resendIn > 0 || sendOtp.isPending) return;
    try {
      await sendOtp.mutateAsync({
        url: `/bookings/${referenceNumber}/otp/send`,
        body: { purpose: "cancel" },
      });
      setOtpSent(true);
      setResendIn(OTP_RESEND_SECONDS);
      toast.success({ content: "Verification code sent to your mobile number." });
    } catch {
      /* toast in onError */
    }
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    await onConfirm(otpDigits);
  };

  return (
    <div className="text-white h-full">
      <div className="text-lg font-bold mb-2 md:mb-4">Cancel Booking</div>

      <p className="text-[11px] mb-4">
        Are you sure you want to cancel this booking? <br />
        Cancelling a booking may incur charges based on our policy.
      </p>

      <div className="text-[11px] text-white/80 mb-4">
        <h4 className="font-semibold mb-2">Cancellation Policy:</h4>
        <ul className="list-disc list-inside">
          <li>Unpaid bookings: No charges, full cancellation allowed.</li>
          <li>Fully paid bookings: 30% deduction applies for cancellations.</li>
          <li>
            Some bookings may be non-refundable if a down payment was made.
          </li>
        </ul>
      </div>

      <div className="mb-4 space-y-2 rounded-md bg-white/10 p-3 text-[11px]">
        <p className="font-semibold text-amber-200">SMS verification</p>
        <p className="text-white/85">
          We will send a one-time code to the mobile number on this booking.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={!referenceNumber || resendIn > 0 || sendOtp.isPending || isSubmitting}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sendOtp.isPending ? (
              <span className="inline-flex items-center gap-1">
                <ButtonLoader className="border-white/40 border-t-white" size="sm" />
                Sending…
              </span>
            ) : resendIn > 0 ? (
              `Resend in ${resendIn}s`
            ) : (
              "Send verification code"
            )}
          </button>
          {otpSent && (
            <span className="text-emerald-200/90 text-[10px]">Code sent.</span>
          )}
        </div>
        <label className="block pt-1">
          <span className="sr-only">Enter 6-digit code</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={isSubmitting}
            className="w-full rounded border border-white/20 bg-white/95 px-2 py-2 text-gray-900 placeholder:text-gray-400"
          />
        </label>
      </div>

      {countdownBlocking && (
        <p className="text-xs text-amber-300 mb-2">
          Please wait {secondsLeft} second{secondsLeft !== 1 ? "s" : ""} before
          confirming.
        </p>
      )}

      <div className="flex justify-end text-xs gap-2 pt-4">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`inline-flex items-center justify-center gap-2 min-w-[140px] px-2 py-1 rounded-md transition ${
            !canConfirm
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {isSubmitting ? (
            <ButtonLoader className="border-red-800/40 border-t-red-900" />
          ) : countdownBlocking ? (
            `Confirm (${secondsLeft})`
          ) : (
            "Confirm Cancellation"
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
