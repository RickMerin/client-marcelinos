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
    <div className="flex flex-col h-[80vh] text-white">

      {/* HEADER */}
      <div className="border-b border-white/20 pb-3 px-6 pt-6 text-center">
        <h2 className="text-xl font-bold">Booking Policy</h2>
        <p className="text-xs text-white/80 mt-1">
          Review the terms and conditions to understand the booking guidelines and policies.
        </p>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto px-6 py-4 text-xs space-y-5">

        {/* CHECK IN / OUT */}
        <div className="grid md:grid-cols-2 gap-4 text-center md:text-left">
          <div>
            <h3 className="font-bold">Check In:</h3>
            <p className="text-[11px]">
              Check-in is at 12:00 PM. <br />
              A valid ID must be presented upon check-in.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Check Out:</h3>
            <p className="text-[11px]">
              Check-out is at 9:00 PM. After check-out, guests must ensure all
              personal belongings are secured. The resort will not be held
              liable for any lost items.
            </p>
          </div>
        </div>

        {/* PAYMENT POLICY */}
        <div className="text-center">
          <h3 className="text-lg font-bold mb-1">Payment Policy</h3>
          <p className="text-[11px]">
            A 50% cash down payment is required and is non-refundable. <br />
            For fully paid bookings, a 30% deduction will be applied in case of cancellation.
          </p>
        </div>

        {/* NO SMOKING */}
        <div className="text-center">
          <h3 className="text-lg font-extrabold uppercase">
            STRICTLY <span className="text-red-500">NO SMOKING!</span> INSIDE THE ROOM
          </h3>
          <p className="text-xs">PENALTY — Php 5,000.00</p>
        </div>

        {/* DAMAGE CHARGES */}
        <div>
          <p className="text-center text-[11px] mb-3">
            If lost or broken, the following items will be charged accordingly:
          </p>

          <h4 className="font-semibold text-center mb-3">
            Damage & Loss Charges
          </h4>

          <ul className="grid grid-cols-2 gap-y-2 text-[11px] list-disc list-inside">
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
          <p className="text-amber-300 text-xs text-center">
            Please review the policy. You can confirm in {secondsLeft} second
            {secondsLeft !== 1 ? "s" : ""}.
          </p>
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t border-white/20 px-6 pt-3 pb-1 flex justify-end gap-3">
        <button
          onClick={onConfirm}
          disabled={isDisabled}
          className={`inline-flex items-center justify-center gap-2 min-w-37.5 px-4 py-2 rounded-md transition ${
            isDisabled
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-amber-400 text-black hover:bg-amber-500"
          }`}
        >
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
          className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}