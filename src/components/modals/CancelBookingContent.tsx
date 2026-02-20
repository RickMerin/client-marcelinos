"use client";

import { useEffect, useState } from "react";
import { ButtonLoader } from "@/components/ui/loader";

interface CancelBookingContentProps {
  onCancel: () => void; // closes the modal
  onConfirm: () => void; // triggers the backend cancel request
  isSubmitting?: boolean; // disables buttons while request is running
}

export default function CancelBookingContent({
  onCancel,
  onConfirm,
  isSubmitting = false,
}: CancelBookingContentProps) {
  const [secondsLeft, setSecondsLeft] = useState(5); // countdown before confirm

  useEffect(() => {
    if (secondsLeft === 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const isDisabled = secondsLeft > 0 || isSubmitting;

  return (
    <div className="text-white h-full">
      {/* HEADER */}
      <div className="text-lg font-bold mb-2 md:mb-4">Cancel Booking</div>

      {/* DESCRIPTION */}
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

      {/* Countdown */}
      {isDisabled && (
        <p className="text-xs text-amber-300 mb-2">
          Please wait {secondsLeft} second{secondsLeft !== 1 ? "s" : ""} before
          confirming.
        </p>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex justify-end text-xs gap-2 pt-4">
        <button
          onClick={onConfirm}
          disabled={isDisabled}
          className={`inline-flex items-center justify-center gap-2 min-w-[140px] px-2 py-1 rounded-md transition ${
            isDisabled
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {isSubmitting ? (
            <ButtonLoader className="border-red-800/40 border-t-red-900" />
          ) : isDisabled ? (
            `Confirm (${secondsLeft})`
          ) : (
            "Confirm Cancellation"
          )}
        </button>

        <button
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
