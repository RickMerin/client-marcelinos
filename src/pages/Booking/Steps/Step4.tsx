"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/modals/Modal";
import PaymentConfirmContent from "@/components/modals/PolicyDisclaimer";

import cashless from "@/assets/img/cashless-payment-svgrepo-com.svg";
import cash from "@/assets/img/cash.webp";
import { PAYMENT_METHODS } from "@/enum/constants";
import { toast } from "@/lib/logger/toast";
import { API } from "@/lib/api/apiClient";
import { endpoints } from "@/lib/api/endpoints";

interface Step4Props {
  paymentMethod?: string;
  setPaymentMethod: (method: string) => void;
  onlinePaymentPlan: "" | "full" | `partial_${number}`;
  setOnlinePaymentPlan: (plan: "" | "full" | `partial_${number}`) => void;
  onBack: () => void;
  onProceed: () => void;
  isSubmitting?: boolean;
}

export function Step4({
  paymentMethod,
  setPaymentMethod,
  onlinePaymentPlan,
  setOnlinePaymentPlan,
  onBack,
  onProceed,
  isSubmitting = false,
}: Step4Props) {
  const [isProceedModalOpen, setIsProceedModalOpen] = useState(false);
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const [isOnlinePaymentEnabled, setIsOnlinePaymentEnabled] = useState(false);
  const [partialPaymentOptions, setPartialPaymentOptions] = useState<number[]>([30]);
  const [allowCustomPartialPayment, setAllowCustomPartialPayment] = useState(false);
  const [customPartialPercent, setCustomPartialPercent] = useState("");

  const handleSelect = (method: string) => {
    const newValue = paymentMethod === method ? "" : method;
    setPaymentMethod(newValue);

    if (newValue !== PAYMENT_METHODS.ONLINE) {
      setOnlinePaymentPlan("");
    }
  };

  const handleProceed = () => {
    if (!paymentMethod) {
      toast.error({ content: "Please select a payment method before proceeding." });
      return;
    }

    if (paymentMethod === PAYMENT_METHODS.ONLINE) {
      setIsPaymentPlanModalOpen(true);
      return;
    }

    setIsProceedModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchPaymentSettings = async () => {
      try {
        const response = await API.get<{
          success: boolean;
          data?: {
            online_payment_enabled?: boolean;
            partial_payment_options?: number[];
            allow_custom_partial_payment?: boolean;
          };
        }>(endpoints.paymentSettings);

        if (!isMounted) {
          return;
        }

        const enabled = Boolean(response?.data?.online_payment_enabled);
        const options = Array.isArray(response?.data?.partial_payment_options)
          ? response.data.partial_payment_options
              .map((value) => Number(value))
              .filter((value) => Number.isFinite(value) && value > 0 && value < 100)
          : [30];
        const uniqueOptions = [...new Set(options)].sort((a, b) => a - b);

        setIsOnlinePaymentEnabled(enabled);
        setPartialPaymentOptions(uniqueOptions.length > 0 ? uniqueOptions : [30]);
        setAllowCustomPartialPayment(Boolean(response?.data?.allow_custom_partial_payment));
      } catch {
        if (isMounted) {
          setIsOnlinePaymentEnabled(false);
          setPartialPaymentOptions([30]);
          setAllowCustomPartialPayment(false);
        }
      }
    };

    fetchPaymentSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isOnlinePaymentEnabled && paymentMethod === PAYMENT_METHODS.ONLINE) {
      setPaymentMethod("");
      setOnlinePaymentPlan("");
    }
  }, [isOnlinePaymentEnabled, paymentMethod, setOnlinePaymentPlan, setPaymentMethod]);

  const parsePartialPercent = (plan: string): number | null => {
    const match = /^partial_(\d{1,2})$/.exec(plan);
    if (!match) return null;
    const parsed = Number(match[1]);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 100) return null;
    return parsed;
  };

  const buildPartialPlan = (percentage: number): `partial_${number}` =>
    `partial_${Math.trunc(percentage)}` as `partial_${number}`;

  const selectedPartialPercent =
    typeof onlinePaymentPlan === "string"
      ? parsePartialPercent(onlinePaymentPlan)
      : null;

  const handleSelectOnlinePaymentPlan = (plan: "full" | `partial_${number}`) => {
    setOnlinePaymentPlan(plan);
    setIsPaymentPlanModalOpen(false);
    setIsProceedModalOpen(true);
  };

  const applyCustomPartialPlan = () => {
    const parsed = Number(customPartialPercent);
    if (!Number.isFinite(parsed)) {
      toast.error({ content: "Enter a valid custom percentage." });
      return;
    }

    const rounded = Math.trunc(parsed);
    if (rounded <= 0 || rounded >= 100) {
      toast.error({ content: "Partial payment must be between 1% and 99%." });
      return;
    }

    handleSelectOnlinePaymentPlan(buildPartialPlan(rounded));
  };

  const handleConfirmProceed = () => {
    // Keep modal open so the button loader is visible during submit
    toast.success({
      content: "Payment method locked in! Finalizing your booking now.",
    });
    onProceed(); // FINAL proceed – on success we navigate away; on error modal stays, user can Cancel
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <p className="booking-funnel-eyebrow">Checkout</p>
        <h2 className="landing-section-title">Payment</h2>
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-display text-lg font-semibold text-sea">
          Online Payment Awareness
        </h3>
        <p className="max-w-2xl mx-auto text-sm leading-relaxed opacity-85 text-ink-soft">
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
          className={`cursor-pointer border rounded-lg p-4 flex items-start gap-3 shadow-sm transition relative
            ${
              paymentMethod === PAYMENT_METHODS.CASH
                ? "ring-2 ring-gold/60 bg-sage-muted border-gold"
                : "bg-cream border-sage-muted hover:bg-sand hover:border-sea/35"
            }`}>
          <input
            type="checkbox"
            checked={paymentMethod === PAYMENT_METHODS.CASH}
            onChange={() => handleSelect(PAYMENT_METHODS.CASH)}
            className="absolute top-3 right-3 w-5 h-5 cursor-pointer"
            style={{ accentColor: "var(--color-gold)" }}
          />
          <img src={cash} alt="Cash" loading="lazy" className="w-13 h-13" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sea">Pay in Cash</h4>
            <p className="text-sm leading-relaxed opacity-85 text-ink-soft">
              You can also pay directly at the resort upon check-in. Please
              present your booking confirmation at the front desk.
            </p>
          </div>
        </label>

        {/* Pay Online (Xendit) */}
        <label
          className={`border rounded-lg p-4 flex items-start gap-3 shadow-sm relative
            ${
              paymentMethod === PAYMENT_METHODS.ONLINE
                ? "ring-2 ring-gold/50 bg-sage-muted border-sea"
                : "bg-cream border-sage-muted"
            }
            ${
              isOnlinePaymentEnabled
                ? "cursor-pointer hover:bg-sand"
                : "cursor-not-allowed opacity-55"
            }`}>
          <input
            type="checkbox"
            checked={paymentMethod === PAYMENT_METHODS.ONLINE}
            onChange={() => handleSelect(PAYMENT_METHODS.ONLINE)}
            disabled={!isOnlinePaymentEnabled}
            className={`absolute top-3 right-3 w-5 h-5 ${
              isOnlinePaymentEnabled ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            style={{ accentColor: "var(--color-gold)" }}
          />
          <img
            src={cashless}
            alt="Pay Online"
            loading="lazy"
            className="w-15 h-15"
          />
          <div className="space-y-1">
            <h4 className="font-semibold text-sea">Pay Online</h4>
            <p className="text-sm leading-relaxed opacity-85 text-ink-soft">
              Pay securely via GCash, PayMaya, debit/credit card, or bank
              transfer. You will be redirected to our payment partner Xendit.
            </p>
            {!isOnlinePaymentEnabled && (
              <p className="text-xs font-medium text-amber-700">
                Online payment is currently unavailable.
              </p>
            )}
          </div>
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-ink hover:bg-sage-muted rounded-md transition-colors">
          ← Back
        </button>

        <button
          type="button"
          onClick={handleProceed}
          disabled={!paymentMethod}
          className="btn-primary-mockup">
          Proceed to Payment
        </button>
      </div>

      <Modal
        open={isPaymentPlanModalOpen}
        onClose={isSubmitting ? () => {} : () => setIsPaymentPlanModalOpen(false)}
        showCloseButton={!isSubmitting}
        contentClassName="relative w-full max-w-xl mx-4 overflow-hidden rounded-xl border border-[#d7c089]/25 bg-[#0c2c27]/95 px-5 py-6 text-center shadow-2xl backdrop-blur-sm md:px-8 md:py-8"
        backgroundImage={undefined}>
        <div className="space-y-5 text-white">
          <h3 className="text-xl font-semibold">Choose Online Payment Option</h3>
          <p className="text-sm text-white/85">
            Select how your client will settle payment before continuing to booking policy confirmation.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSelectOnlinePaymentPlan("full")}
              className={`rounded-lg border px-4 py-3 text-left transition ${
                onlinePaymentPlan === "full"
                  ? "border-gold bg-white/15"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}>
              <p className="font-semibold">Pay Full</p>
              <p className="text-xs text-white/80">Collect the total booking amount now.</p>
            </button>
            {partialPaymentOptions.map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => handleSelectOnlinePaymentPlan(buildPartialPlan(percent))}
                className={`rounded-lg border px-4 py-3 text-left transition ${
                  selectedPartialPercent === percent
                    ? "border-gold bg-white/15"
                    : "border-white/20 bg-white/5 hover:bg-white/10"
                }`}>
                <p className="font-semibold">{`Pay Partial (${percent}%)`}</p>
                <p className="text-xs text-white/80">{`Collect ${percent}% now and settle the balance later.`}</p>
              </button>
            ))}
          </div>
          {allowCustomPartialPayment && (
            <div className="space-y-2 rounded-lg border border-white/20 bg-white/5 p-3 text-left">
              <p className="text-sm font-semibold">Custom partial percentage</p>
              <p className="text-xs text-white/80">
                Enter any value from 1 to 99. 100% is not allowed for partial payment.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={99}
                  step={1}
                  value={customPartialPercent}
                  onChange={(e) => setCustomPartialPercent(e.target.value)}
                  placeholder="e.g. 35"
                  className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={applyCustomPartialPlan}
                  className="rounded-md border border-gold/60 bg-gold/20 px-3 py-2 text-xs font-semibold text-white hover:bg-gold/30">
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Proceed Confirmation Modal – stay open during submit so loader is visible */}
      <Modal
        open={isProceedModalOpen}
        onClose={isSubmitting ? () => {} : () => setIsProceedModalOpen(false)}
        showCloseButton={!isSubmitting}
        contentClassName="relative w-full max-w-3xl mx-4 overflow-hidden rounded-xl border border-[#d7c089]/25 bg-[#0c2c27]/95 px-5 py-6 text-center shadow-2xl backdrop-blur-sm md:px-8 md:py-8"
        backgroundImage={undefined}>
        <PaymentConfirmContent
          onCancel={() => !isSubmitting && setIsProceedModalOpen(false)}
          onConfirm={handleConfirmProceed}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
