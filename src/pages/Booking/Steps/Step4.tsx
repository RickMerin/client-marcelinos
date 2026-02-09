"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/modals/Modal";
import PaymentConfirmContent from "@/components/modals/PolicyDisclaimer";

import cashless from "@/assets/img/cashless-payment-svgrepo-com.svg";
import cash from "@/assets/img/cash.webp";
import { PAYMENT_METHODS } from "@/enum/constants";

interface Step4Props {
  paymentMethod?: string;
  setPaymentMethod: (method: string) => void;
  onBack: () => void;
  onProceed: () => void;
  isSubmitting?: boolean;
}

export function Step4({
  paymentMethod,
  setPaymentMethod,
  onBack,
  onProceed,
  isSubmitting = false,
}: Step4Props) {
  const [isProceedModalOpen, setIsProceedModalOpen] = useState(false);

  const handleSelect = (method: string) => {
    const newValue = paymentMethod === method ? "" : method;
    setPaymentMethod(newValue);
  };

  const handleProceed = () => {
    if (!paymentMethod) {
      alert("Please select a payment method before proceeding.");
      return;
    }

    // Open confirmation modal instead of proceeding immediately
    setIsProceedModalOpen(true);
  };

  const handleConfirmProceed = () => {
    // Keep modal open so the button loader is visible during submit
    onProceed(); // FINAL proceed – on success we navigate away; on error modal stays, user can Cancel
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Payment</h2>

      {/* Awareness */}
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

      {/* Payment Methods */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pay in Cash */}
        <label
          className={`cursor-pointer border rounded-md p-4 flex items-start gap-3 shadow-sm transition relative
            ${
              paymentMethod === PAYMENT_METHODS.CASH
                ? "bg-green-100 border-green-400 ring-2 ring-green-400"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
        >
          <input
            type="checkbox"
            checked={paymentMethod === PAYMENT_METHODS.CASH}
            onChange={() => handleSelect(PAYMENT_METHODS.CASH)}
            className="absolute top-3 right-3 w-5 h-5 accent-amber-500 cursor-pointer"
          />
          <img src={cash} alt="Cash" loading="lazy" className="w-13 h-13" />
          <div>
            <h4 className="font-semibold text-gray-800">Pay in Cash</h4>
            <p className="text-sm text-gray-600">
              You can also pay directly at the resort upon check-in. Please
              present your booking confirmation at the front desk.
            </p>
          </div>
        </label>

        {/* Pay Online (Soon) */}
        <label
          className="cursor-not-allowed border rounded-md p-4 bg-gray-100 flex items-start gap-3 shadow-sm opacity-60 relative"
          aria-disabled="true"
        >
          <input
            type="checkbox"
            disabled
            className="absolute top-3 right-3 w-5 h-5 accent-gray-400"
          />
          <img
            src={cashless}
            alt="Cashless"
            loading="lazy"
            className="w-15 h-15 grayscale"
          />
          <div>
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              Pay Online
              <span className="ml-2 text-xs bg-yellow-300/80 text-gray-800 px-2 py-0.5 rounded">
                Soon
              </span>
            </h4>
            <p className="text-sm text-gray-600">
              Guests are encouraged to pay online through secure methods such as
              GCash, PayMaya, PayPal, or bank transfer for a fast and convenient
              transaction.
            </p>
          </div>
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="text-sm underline text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>

        <Button
          onClick={handleProceed}
          disabled={!paymentMethod}
          className={`px-6 py-3 rounded-md ${
            paymentMethod
              ? "bg-amber-400 hover:bg-amber-500 text-black"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Proceed to Payment
        </Button>
      </div>

      {/* Proceed Confirmation Modal – stay open during submit so loader is visible */}
      <Modal
        open={isProceedModalOpen}
        onClose={isSubmitting ? () => {} : () => setIsProceedModalOpen(false)}
        showCloseButton={!isSubmitting}
      >
        <PaymentConfirmContent
          paymentMethod={paymentMethod}
          onCancel={() => !isSubmitting && setIsProceedModalOpen(false)}
          onConfirm={handleConfirmProceed}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
