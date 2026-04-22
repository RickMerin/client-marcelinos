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
    onError: (
      err: Error & {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          };
        };
      },
    ) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.otp?.[0] ||
        err?.response?.data?.errors?.email?.[0] ||
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

    const timer = setTimeout(() => {
      setResendIn((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
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
      toast.success({ content: "Verification code sent to your email." });
    } catch {
      // handled by onError
    }
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    await onConfirm(otpDigits);
  };

  return (
    <div className="flex flex-col max-h-[70vh] text-white">
      {/* HEADER */}
      <div className="mt-2 mb-4 md:mb-5 text-center">
        <p className="text-[11px] tracking-[0.22em] uppercase text-[#e6d3a3] mb-2">
          Confirmation
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold font-serif">
          Cancel Booking
        </h2>
        <p className="text-xs text-white/80 mt-2 max-w-xl mx-auto">
          Review the cancellation terms and verify your request before
          proceeding.
        </p>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto text-xs space-y-5 pb-2 px-1 [scrollbar-width:thin] [scrollbar-color:#6e6a5d_#113731] hover:[scrollbar-color:#c6a15b_#113731] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#113731]/55 hover:[&::-webkit-scrollbar-track]:bg-[#113731]/80 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#c6a15b]/35 hover:[&::-webkit-scrollbar-thumb]:bg-[#c6a15b]/85 [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-[#0b2621]/60 hover:[&::-webkit-scrollbar-thumb]:border-[#0b2621] [&::-webkit-scrollbar-thumb:hover]:bg-[#e6d3a3]">
        <div className="text-center rounded-lg border border-[#e6d3a3]/20 bg-white/5 p-3">
          <h3 className="text-lg font-bold mb-1 text-[#e6d3a3]">
            Cancellation Request
          </h3>
          <p className="text-[11px] text-white/90">
            Are you sure you want to cancel this booking? Cancellation may incur
            charges based on our booking policy.
          </p>
        </div>

        <div className="rounded-lg border border-[#e6d3a3]/20 bg-white/5 p-3">
          <h4 className="font-semibold text-center mb-3 text-[#e6d3a3]">
            Cancellation Policy
          </h4>

          <ul className="space-y-2 text-[11px] list-disc list-inside text-white/90 text-center sm:text-left sm:max-w-fit sm:mx-auto">
            <li>Unpaid bookings: No charges, full cancellation allowed.</li>
            <li>Fully paid bookings: 30% deduction applies for cancellations.</li>
            <li>Some bookings may be non-refundable if a down payment was made.</li>
          </ul>
        </div>

        <div className="rounded-lg border border-[#e6d3a3]/20 bg-white/5 p-3">
          <h4 className="font-semibold text-center mb-3 text-[#e6d3a3]">
            Email Verification
          </h4>

          <p className="text-center text-[11px] text-white/90 mb-3">
            We will send a one-time verification code to the email address on
            this booking.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={
                !referenceNumber ||
                resendIn > 0 ||
                sendOtp.isPending ||
                isSubmitting
              }
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[4px] text-[13px] font-semibold uppercase tracking-[0.1em] bg-[#c6a15b] text-[#0f1f1a] transition ${
                !referenceNumber ||
                resendIn > 0 ||
                sendOtp.isPending ||
                isSubmitting
                  ? "bg-[#c6a15b]/60 cursor-not-allowed hover:bg-[#c6a15b]/60"
                  : "hover:bg-[#e6d3a3]"
              }`}
            >
              {sendOtp.isPending ? (
                <>
                  <ButtonLoader className="border-amber-800/40 border-t-amber-900" />
                  Sending...
                </>
              ) : resendIn > 0 ? (
                `Resend in ${resendIn}s`
              ) : (
                "Send Verification Code"
              )}
            </button>

            {otpSent && (
              <span className="text-[#e6d3a3] text-[10px]">Code sent.</span>
            )}
          </div>

          <label className="block max-w-sm mx-auto">
            <span className="sr-only">Enter 6-digit code</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={isSubmitting}
              className="w-full rounded border border-white/20 bg-white/95 px-3 py-2 text-gray-900 placeholder:text-gray-400"
            />
          </label>
        </div>

        {countdownBlocking && (
          <p className="text-[#e6d3a3] text-xs text-center">
            Please wait {secondsLeft} second{secondsLeft !== 1 ? "s" : ""} before
            confirming.
          </p>
        )}
      </div>

      {/* FOOTER */}
      <div className="pt-4 pb-1 flex justify-center gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[4px] text-[13px] font-semibold uppercase tracking-[0.1em] transition ${
            !canConfirm
              ? "bg-[#c6a15b]/60 text-[#0f1f1a] cursor-not-allowed hover:bg-[#c6a15b]/60"
              : "bg-[#c6a15b] text-[#0f1f1a] hover:bg-[#e6d3a3]"
          }`}
        >
          {isSubmitting ? (
            <ButtonLoader className="border-amber-800/40 border-t-amber-900" />
          ) : countdownBlocking ? (
            `Confirm (${secondsLeft})`
          ) : (
            "Confirm Cancellation"
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-[4px] border border-white/30 bg-white/10 text-white transition hover:bg-white/20 ${
            isSubmitting
              ? "cursor-not-allowed opacity-70 hover:bg-white/10"
              : ""
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}