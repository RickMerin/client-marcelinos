"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import cashless from "@/assets/img/cashless-payment-svgrepo-com.svg";
import cash from "@/assets/img/cash.webp";
import { PAYMENT_METHODS } from "@/enum/constants";

interface Step4Props {
  setPaymentMethod: (method: string) => void;
  onBack: () => void;
  onProceed: () => void;
}

export function Step4({ setPaymentMethod, onBack, onProceed }: Step4Props) {
  const [selected, setSelected] = useState<string>("");

  const handleSelect = (method: string) => {
    setSelected(method);
    setPaymentMethod(method);
  };

  const handleProceed = () => {
    if (!selected) {
      alert("Please select a payment method before proceeding.");
      return;
    }
    onProceed();
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Payment</h2>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Online Payment Awareness</h3>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm">
          Guests are encouraged to pay online through secure methods such as
          GCash, PayMaya, PayPal, or bank transfer for a fast and convenient
          transaction. Please double-check all payment details before sending,
          as the resort will not be held responsible for incorrect or misplaced
          payments.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pay in Cash Box */}
        <div
          onClick={() => handleSelect(PAYMENT_METHODS.CASH)}
          className={`cursor-pointer border rounded-md p-4 flex items-start gap-3 shadow-sm transition
            ${
              selected === PAYMENT_METHODS.CASH
                ? "bg-amber-100 border-amber-400"
                : "bg-gray-50 hover:bg-gray-100"
            }`}>
          <img src={cash} alt="Cash" className="w-13 h-13" />
          <div>
            <h4 className="font-semibold text-gray-800">Pay in Cash</h4>
            <p className="text-sm text-gray-600">
              You can also pay directly at the resort upon check-in. Please
              present your booking confirmation at the front desk.
            </p>
          </div>
        </div>

        {/* Pay Online (Disabled) */}
        <div
          className="cursor-not-allowed border rounded-md p-4 bg-gray-100 flex items-start gap-3 shadow-sm opacity-60 relative"
          aria-disabled="true"
          tabIndex={-1}>
          <img src={cashless} alt="Cashless" className="w-15 h-15 grayscale" />
          <div>
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              Pay Online
              <span className="ml-2 text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded">
                Coming Soon
              </span>
            </h4>
            <p className="text-sm text-gray-600">
              Guests are encouraged to pay online through secure methods such as
              GCash, PayMaya, PayPal, or bank transfer for a fast and convenient
              transaction.
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="text-sm underline text-gray-600 hover:text-gray-800">
          ← Back
        </button>
        <Button
          onClick={handleProceed}
          disabled={!selected}
          className={`px-6 py-3 rounded-md ${
            selected
              ? "bg-amber-400 hover:bg-amber-500 text-black"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}>
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
