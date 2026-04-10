"use client";

import { useEffect, useState } from "react";
import { ButtonLoader } from "@/components/ui/loader";

interface PaymentPolicyConfirmContentProps {
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export default function PaymentPolicyConfirmContent({
  onCancel,
  onConfirm,
  isSubmitting = false,
}: PaymentPolicyConfirmContentProps) {
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (secondsLeft === 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const isDisabled = secondsLeft > 0 || isSubmitting;

  return (
    <div className="flex flex-col max-h-[70vh] text-white">
      {/* HEADER */}
      <div className="mt-2 mb-4 md:mb-5 text-center">
        <p className="text-[11px] tracking-[0.22em] uppercase text-[#e6d3a3] mb-2">
          Confirmation
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold font-serif">
          Booking Policy
        </h2>
        <p className="text-xs text-white/80 mt-2 max-w-xl mx-auto">
          Review the terms and conditions to understand the booking guidelines
          and policies.
        </p>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto text-xs space-y-5 pb-2 px-1">
        {/* CHECK IN / OUT */}
        <div className="grid md:grid-cols-2 gap-4 text-center">
          <div className="rounded-lg border border-[#e6d3a3]/20 bg-white/5 p-3">
            <h3 className="font-bold text-[#e6d3a3]">Check In:</h3>
            <p className="text-[11px] text-white/90">
              Check-in is at 12:00 PM. <br />A valid ID must be presented upon
              check-in.
            </p>
          </div>

          <div className="rounded-lg border border-[#e6d3a3]/20 bg-white/5 p-3">
            <h3 className="font-bold text-[#e6d3a3]">Check Out:</h3>
            <p className="text-[11px] text-white/90">
              Check-out is at 10:00 AM. After check-out, guests must ensure all
              personal belongings are secured. The resort will not be held
              liable for any lost items.
            </p>
          </div>
        </div>

        {/* PAYMENT POLICY */}
        <div className="text-center rounded-lg border border-[#e6d3a3]/20 bg-white/5 p-3">
          <h3 className="text-lg font-bold mb-1 text-[#e6d3a3]">
            Payment Policy
          </h3>
          <p className="text-[11px] text-white/90">
            A 50% cash down payment is required and is non-refundable. <br />
            For fully paid bookings, a 30% deduction will be applied in case of
            cancellation.
          </p>
        </div>

        {/* NO SMOKING */}
        <div className="text-center rounded-lg border border-[#e6d3a3]/20 bg-white/5 p-3">
          <h3 className="text-lg font-extrabold uppercase text-[#e6d3a3]">
            STRICTLY <span className="text-red-300">NO SMOKING!</span> INSIDE
            THE ROOM
          </h3>
          <p className="text-xs text-white/90">PENALTY - Php 5,000.00</p>
        </div>

        {/* DAMAGE CHARGES */}
        <div className="rounded-lg border border-[#e6d3a3]/20 bg-white/5 p-3">
          <p className="text-center text-[11px] mb-3 text-white/90">
            If lost or broken, the following items will be charged accordingly:
          </p>

          <h4 className="font-semibold text-center mb-3 text-[#e6d3a3]">
            Damage & Loss Charges
          </h4>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-[11px] list-disc list-inside text-white/90">
            <li>Television – Php 25,000.00</li>
            <li>Emergency Lights – Php 2,000.00</li>
            <li>Cups and Glass – Php 100.00 each</li>
            <li>Lost / Loss of Room Key – Php 1,000.00</li>
            <li>Bed Sheet / Blanket / Towel Stain – Php 500.00 each</li>
            <li>Slippers – Php 100.00 each</li>
            <li>Remote – Php 500.00</li>
            <li>Towel – Php 500.00 each</li>
          </ul>
        </div>

        {isDisabled && (
          <p className="text-[#e6d3a3] text-xs text-center">
            Please review the policy. You can confirm in {secondsLeft} second
            {secondsLeft !== 1 ? "s" : ""}.
          </p>
        )}
      </div>

      {/* FOOTER */}
      <div className="pt-4 pb-1 flex justify-center gap-3">
        <button
          onClick={onConfirm}
          disabled={isDisabled}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[4px] text-[13px] font-semibold uppercase tracking-[0.1em] bg-[#c6a15b] text-[#0f1f1a] transition ${
            isDisabled
              ? "bg-[#c6a15b]/60 cursor-not-allowed hover:bg-[#c6a15b]/60"
              : "hover:bg-[#e6d3a3]"
          }`}>
          {isSubmitting ? (
            <ButtonLoader className="border-amber-800/40 border-t-amber-900" />
          ) : isDisabled ? (
            `I Agree (${secondsLeft})`
          ) : (
            "I Agree & Proceed"
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-[4px] border border-white/30 bg-white/10 text-white transition hover:bg-white/20 ${
            isSubmitting
              ? "cursor-not-allowed opacity-70 hover:bg-white/10"
              : ""
          }`}>
          Cancel
        </button>
      </div>
    </div>
  );
}
