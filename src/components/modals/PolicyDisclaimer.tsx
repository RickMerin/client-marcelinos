"use client";

import { useEffect, useState } from "react";
import { ButtonLoader } from "@/components/ui/loader";
// import { PAYMENT_METHODS } from "@/enum/constants";

interface PaymentPolicyConfirmContentProps {
  paymentMethod?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export default function PaymentPolicyConfirmContent({
  // paymentMethod,
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
    <div className="text-white space-y-2">
          {/* HEADER */}
      <div className="text-lg font-bold mb-4 md:mb-8 text-white">
        <h3>Booking Policy</h3>
      

      {/* DESCRIPTION */}
      <p className="text-[11px]">
        Review the terms and condition to understand the booking guidelines and policies
      </p>
</div>

       {/* INTRO */}
      <div className="text-xs mb-2 md:mb-4 text-white">
        <h2 className="font-bold">Check In:</h2>
        <p className="text-[11px]">Check-in is at 12:00 PM. A valid ID must be presented upon check-in.</p>
      </div>

      {/* INTRO */}
      <div className="text-xs mb-2 md:mb-4 text-white">
        <h2 className="font-bold">Check Out:</h2>
        <p className="text-[11px]">Check-out is at 9:00 PM. After check-out, guest must ensure that all personal belongings are secured. The resort shall not be held lieable for any last items.</p>
      </div>

          {/* HEADER */}
      <div className="text-lg font-bold mb-4 md:mb-4 text-white">
        <h3>Payment Policy</h3>
      </div>
      
       {/* INTRO */}
      <div className="text-xs mb-2 md:mb-4 text-white">
        <p className="text-[11px]">A 50% down payment and is non-refundable. For fully paid bookings, a 30% deduction will be applied in case of cancellation.</p>
      </div>

      <h2 className="font-extrabold text-white/90 uppercase text-lg md:text-xl">
        STRICLY <span className="text-red-600 font-extrabold">NO SMOKING!</span> Inside the ROOM.
      </h2>
        <p className="text-xs">PENALTY --- Php 5,000.00 </p>

      <div className="text-[11px] text-white/80 space-y-2">
        <p className="text-[11px]">
          If Lost or Broken the following items will be charged accordingly:
        </p>
        <div className="text-[11px] text-white">
  <h4 className="font-xs mb-2">Damage & Loss Charges:</h4>

  <ul className="text-[11px] grid grid-cols-2 gap-x-6 gap-y-1 list-disc pl-5 text-left">
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
      </div>

      {/* Countdown */}
      {isDisabled && (
        <p className="text-xs text-amber-300">
          Please review the policy. You can confirm in {secondsLeft} second
          {secondsLeft !== 1 ? "s" : ""}.
        </p>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onConfirm}
          disabled={isDisabled}
          className={`inline-flex items-center justify-center gap-2 min-w-[140px] px-4 py-2 rounded-md transition ${
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
