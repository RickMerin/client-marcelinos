"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/modals/Modal";
import PaymentConfirmContent from "@/components/modals/PolicyDisclaimer";
import { useTurnstile } from "@/hooks/useTurnstile";

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
  paymentSettings?: {
    onlinePaymentEnabled: boolean;
    partialPaymentPercent: number;
  };
  onBack: () => void;
  onProceed: (captchaToken: string, websiteHoneypot: string) => void;
  isSubmitting?: boolean;
}

export function Step4({
  paymentMethod,
  setPaymentMethod,
  onlinePaymentPlan,
  setOnlinePaymentPlan,
  paymentSettings,
  onBack,
  onProceed,
  isSubmitting = false,
}: Step4Props) {
  const {
    containerRef: captchaRef,
    token: captchaToken,
    error: captchaError,
    setError: setCaptchaError,
    reset: resetCaptcha,
  } = useTurnstile({ size: "flexible" });
  const [honeypot, setHoneypot] = useState("");
  const [isProceedModalOpen, setIsProceedModalOpen] = useState(false);
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const [isOnlinePaymentEnabled, setIsOnlinePaymentEnabled] = useState(
    paymentSettings?.onlinePaymentEnabled ?? false,
  );
  const [partialPaymentPercent, setPartialPaymentPercent] = useState(
    paymentSettings?.partialPaymentPercent ?? 30,
  );

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
    if (!paymentSettings) {
      return;
    }
    setIsOnlinePaymentEnabled(paymentSettings.onlinePaymentEnabled);
    setPartialPaymentPercent(paymentSettings.partialPaymentPercent);
  }, [paymentSettings]);

  useEffect(() => {
    if (paymentSettings) {
      return;
    }

    let isMounted = true;

    const fetchPaymentSettings = async () => {
      try {
        const response = await API.get<{
          success: boolean;
          data?: {
            online_payment_enabled?: boolean;
            partial_payment_options?: number[];
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
        setPartialPaymentPercent(uniqueOptions[0] ?? 30);
      } catch {
        if (isMounted) {
          setIsOnlinePaymentEnabled(false);
          setPartialPaymentPercent(30);
        }
      }
    };

    fetchPaymentSettings();

    return () => {
      isMounted = false;
    };
  }, [paymentSettings]);

  useEffect(() => {
    if (!isOnlinePaymentEnabled && paymentMethod === PAYMENT_METHODS.ONLINE) {
      setPaymentMethod("");
      setOnlinePaymentPlan("");
    }
  }, [isOnlinePaymentEnabled, paymentMethod, setOnlinePaymentPlan, setPaymentMethod]);

  useEffect(() => {
    if (paymentMethod !== PAYMENT_METHODS.ONLINE) {
      return;
    }

    const selectedPercent = parsePartialPercent(String(onlinePaymentPlan));
    if (selectedPercent == null || selectedPercent === partialPaymentPercent) {
      return;
    }

    setOnlinePaymentPlan(buildPartialPlan(partialPaymentPercent));
  }, [
    onlinePaymentPlan,
    partialPaymentPercent,
    paymentMethod,
    setOnlinePaymentPlan,
  ]);

  const parsePartialPercent = (plan: string): number | null => {
    const match = /^partial_(\d{1,2})$/.exec(plan);
    if (!match) return null;
    const parsed = Number(match[1]);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 100) return null;
    return parsed;
  };

  function buildPartialPlan(percentage: number): `partial_${number}` {
    const normalized = Math.min(99, Math.max(1, Math.trunc(percentage)));
    return `partial_${normalized}` as `partial_${number}`;
  }

  const selectedPartialPercent = parsePartialPercent(String(onlinePaymentPlan));

  const handleSelectOnlinePaymentPlan = (plan: "full" | `partial_${number}`) => {
    setOnlinePaymentPlan(plan);
    setIsPaymentPlanModalOpen(false);
    setIsProceedModalOpen(true);
  };

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as
    | string
    | undefined;

  const handleConfirmProceed = () => {
    if (turnstileSiteKey && !captchaToken) {
      setCaptchaError("Please verify you're not a robot.");
      return;
    }
    setCaptchaError("");
    // Keep modal open so the button loader is visible during submit
    toast.success({
      content: "Payment method locked in! Finalizing your booking now.",
    });
    onProceed(captchaToken ?? "", honeypot);
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
        <p className="max-w-2xl mx-auto text-sm leading-relaxed opacity-85 text-black">
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
            <p className="text-sm leading-relaxed opacity-85 text-black">
             You may pay directly at the resort upon check-in for same-day bookings. 
             For advance bookings, a down payment is required immediately after booking to secure your reservation. 
             It must be settled before 9:00 PM on the same day, otherwise the booking may be cancelled. 
             The remaining balance can be paid in cash upon arrival.
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
            <button
              type="button"
              onClick={() =>
                handleSelectOnlinePaymentPlan(buildPartialPlan(partialPaymentPercent))
              }
              className={`rounded-lg border px-4 py-3 text-left transition ${
                selectedPartialPercent === partialPaymentPercent
                  ? "border-gold bg-white/15"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}>
              <p className="font-semibold">{`Pay Partial (${partialPaymentPercent}%)`}</p>
              <p className="text-xs text-white/80">{`Collect ${partialPaymentPercent}% now and settle the balance later.`}</p>
            </button>
          </div>
        </div>
      </Modal>

      {/* Proceed Confirmation Modal – stay open during submit so loader is visible */}
      <Modal
        open={isProceedModalOpen}
        onClose={
          isSubmitting
            ? () => {}
            : () => {
                setIsProceedModalOpen(false);
                resetCaptcha();
              }
        }
        showCloseButton={!isSubmitting}
        contentClassName="relative w-full max-w-3xl mx-4 overflow-hidden rounded-xl border border-[#d7c089]/25 bg-[#0c2c27]/95 px-5 py-6 text-center shadow-2xl backdrop-blur-sm md:px-8 md:py-8"
        backgroundImage={undefined}>
        <input
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="pointer-events-none absolute left-[-9999px] h-px w-px opacity-0"
          aria-hidden
        />
        {turnstileSiteKey ? (
          <div className="mb-4 flex min-h-16 justify-center">
            <div ref={captchaRef} className="min-w-0" />
          </div>
        ) : null}
        {captchaError ? (
          <p className="mb-3 text-sm text-red-300">{captchaError}</p>
        ) : null}
        <PaymentConfirmContent
          onCancel={() => {
            if (!isSubmitting) {
              setIsProceedModalOpen(false);
              resetCaptcha();
            }
          }}
          onConfirm={handleConfirmProceed}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
