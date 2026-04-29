"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import Modal from "@/components/modals/Modal";
import PaymentConfirmContent from "@/components/modals/PolicyDisclaimer";

import cashless from "@/assets/img/cashless-payment-svgrepo-com.svg";
import cash from "@/assets/img/cash.webp";
import { PAYMENT_METHODS } from "@/enum/constants";
import { toast } from "@/lib/logger/toast";
import { API } from "@/lib/api/apiClient";
import { endpoints } from "@/lib/api/endpoints";
import { getEcho } from "@/lib/realtime/echo";
import { RealtimeChannels } from "@/lib/realtime/channels";
import type { BookingReferenceResponse } from "@/types/booking.types";

interface Step4Props {
  paymentMethod?: string;
  setPaymentMethod: (method: string) => void;
  onlinePaymentPlan: "" | "full" | `partial_${number}`;
  setOnlinePaymentPlan: (plan: "" | "full" | `partial_${number}`) => void;
  paymentSettings?: {
    onlinePaymentEnabled: boolean;
    partialPaymentPercent: number;
  };
  submitConflictNotice?: string;
  onBack: () => void;
  onProceed: (websiteHoneypot: string) => void;
  isSubmitting?: boolean;
  emailVerificationPending?: {
    active: boolean;
    email: string;
    referenceNumber: string;
  } | null;
  onEmailVerified?: () => void;
  onBookAnother?: () => void;
}

export function Step4({
  paymentMethod,
  setPaymentMethod,
  onlinePaymentPlan,
  setOnlinePaymentPlan,
  paymentSettings,
  submitConflictNotice,
  onBack,
  onProceed,
  isSubmitting = false,
  emailVerificationPending = null,
  onEmailVerified,
  onBookAnother,
}: Step4Props) {
  const navigate = useNavigate();
  const [honeypot, setHoneypot] = useState("");
  const [isProceedModalOpen, setIsProceedModalOpen] = useState(false);
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const [isOnlinePaymentEnabled, setIsOnlinePaymentEnabled] = useState(
    paymentSettings?.onlinePaymentEnabled ?? false,
  );
  const [partialPaymentPercent, setPartialPaymentPercent] = useState(
    paymentSettings?.partialPaymentPercent ?? 30,
  );
  const [emailVerified, setEmailVerified] = useState(false);
  const [billingStatementUrl, setBillingStatementUrl] = useState("");
  const [receiptToken, setReceiptToken] = useState("");

  useEffect(() => {
    setEmailVerified(false);
    setBillingStatementUrl("");
    setReceiptToken("");
  }, [emailVerificationPending?.referenceNumber, emailVerificationPending?.active]);

  const handleSelect = (method: string) => {
    const newValue = paymentMethod === method ? "" : method;
    setPaymentMethod(newValue);

    if (newValue !== PAYMENT_METHODS.ONLINE) {
      setOnlinePaymentPlan("");
    }
  };

  const handleProceed = () => {
    if (!paymentMethod) {
      toast.error({
        content: "Please select a payment method before proceeding.",
      });
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
              .filter(
                (value) => Number.isFinite(value) && value > 0 && value < 100,
              )
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
  }, [
    isOnlinePaymentEnabled,
    paymentMethod,
    setOnlinePaymentPlan,
    setPaymentMethod,
  ]);

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

  // Listen for email verification via realtime
  useEffect(() => {
    if (
      !emailVerificationPending?.active ||
      !emailVerificationPending?.referenceNumber
    ) {
      return;
    }

    let isMounted = true;
    const echo = getEcho();

    if (!echo) {
      return;
    }

    const channel = echo.private(
      RealtimeChannels.booking(emailVerificationPending.referenceNumber),
    );

    // Listen for email verification event
    channel.listen(".email.verified", () => {
      if (isMounted) {
        setEmailVerified(true);
        setBillingStatementUrl("");
        setReceiptToken("");
        toast.success({
          content: "Email confirmed! You can now proceed to your booking details.",
        });
      }
    });

    return () => {
      isMounted = false;
      echo.leave(
        RealtimeChannels.booking(emailVerificationPending.referenceNumber),
      );
    };
  }, [emailVerificationPending?.active, emailVerificationPending?.referenceNumber]);

  // Polling fallback to check email verification status
  useEffect(() => {
    if (
      !emailVerificationPending?.active ||
      !emailVerificationPending?.referenceNumber ||
      emailVerified
    ) {
      return;
    }

    let isMounted = true;

    const checkVerificationStatus = async () => {
      try {
        const response = await API.get<BookingReferenceResponse>(
          `/bookings/reference/${emailVerificationPending.referenceNumber}`,
        );

        if (!isMounted) return;

        // Check if email has been verified
        const verifiedAt = response?.booking?.email_verified_at;
        if (verifiedAt) {
          setEmailVerified(true);
          setBillingStatementUrl(response?.billing_statement_pdf_url?.trim() ?? "");
          setReceiptToken(response?.booking?.receipt_token?.trim() ?? "");
          toast.success({
            content: "Email confirmed! You can now proceed to your booking details.",
          });
        }
      } catch {
        // Silently fail for polling errors
        if (!isMounted) return;
      }
    };

    void checkVerificationStatus();
    const pollInterval = setInterval(() => {
      void checkVerificationStatus();
    }, 3000); // Poll every 3 seconds

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [emailVerificationPending?.active, emailVerificationPending?.referenceNumber, emailVerified]);

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

  const handleSelectOnlinePaymentPlan = (
    plan: "full" | `partial_${number}`,
  ) => {
    setOnlinePaymentPlan(plan);
    setIsPaymentPlanModalOpen(false);
    setIsProceedModalOpen(true);
  };

  const handleConfirmProceed = () => {
    // Keep modal open so the button loader is visible during submit
    toast.success({
      content: "Payment method locked in! Finalizing your booking now.",
    });
    onProceed(honeypot);
  };

  const handleViewBillingStatement = () => {
    const trimmedUrl = billingStatementUrl.trim();

    if (trimmedUrl) {
      window.open(trimmedUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (emailVerificationPending?.referenceNumber && receiptToken) {
      navigate(
        `/billing/${encodeURIComponent(emailVerificationPending.referenceNumber)}?token=${encodeURIComponent(receiptToken)}`,
      );
      return;
    }

    toast.error({
      content: "Billing statement is not available yet.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Email Verification Pending State */}
      {emailVerificationPending?.active ? (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="booking-funnel-eyebrow">Email Confirmation</p>
            <h2 className="landing-section-title">Verify Your Email</h2>
          </div>

          <div className="max-w-2xl mx-auto">
            {emailVerified ? (
              <div className="space-y-6 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
                <div className="bg-green-50 border border-green-300 rounded-lg px-6 py-4">
                  <p className="text-green-900 font-semibold mb-2">
                    Thank you for booking!
                  </p>
                  <p className="text-green-800 text-sm">
                    Your email has been successfully confirmed. Your booking is now verified.
                    You can view your billing statement or create another reservation.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleViewBillingStatement}
                    className="btn-primary-mockup"
                  >
                    View Billing Statement
                  </button>
                  <button
                    type="button"
                    onClick={onBookAnother}
                    className="px-5 py-2.5 text-sm font-medium text-ink hover:bg-sage-muted rounded-md transition-colors"
                  >
                    Book Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center mb-4">
                  <Mail className="w-16 h-16 text-gold" />
                </div>
                <div className="bg-amber-50 border border-amber-300 rounded-lg px-6 py-6 text-center">
                  <p className="text-amber-900 font-semibold mb-3 text-lg">
                    Thank you for your booking!
                  </p>
                  <p className="text-amber-900 mb-4">
                    We&apos;ve sent a confirmation email to:
                  </p>
                  <p className="text-amber-900 font-semibold mb-4 break-all">
                    {emailVerificationPending.email}
                  </p>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Please check your inbox and click the confirmation link to verify
                    your email address. Once confirmed, you&apos;ll be able to access
                    your billing statement and booking details.
                  </p>
                </div>

                <div className="bg-cream border border-sage-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-ink-soft mb-3">
                    Not seeing the email?
                  </p>
                  <ul className="text-sm text-ink-soft space-y-2">
                    <li>• Check your spam or junk folder</li>
                    <li>• Double-check that you entered the email correctly</li>
                    <li>• Wait a few moments and refresh this page</li>
                  </ul>
                </div>

                <p className="text-center text-xs text-ink-soft">
                  This page will automatically update once you confirm your email.
                </p>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={onBookAnother}
                    className="px-5 py-2.5 text-sm font-medium text-ink hover:bg-sage-muted rounded-md transition-colors"
                  >
                    Book Another
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
            <button
              type="button"
              onClick={onBack}
              disabled={emailVerified}
              className="px-5 py-2.5 text-sm font-medium text-ink hover:bg-sage-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
          </div>
        </div>
      ) : (
        /* Normal Payment Selection UI – disabled when verification is pending */
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <p className="booking-funnel-eyebrow">Checkout</p>
            <h2 className="landing-section-title">Payment</h2>
          </div>

          {submitConflictNotice ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
              <p className="font-semibold">Availability changed</p>
              <p className="mt-1 whitespace-pre-line">{submitConflictNotice}</p>
            </div>
          ) : null}

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
                }`}
            >
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
                  All bookings require at least partial or full payment, which must
                  be completed anytime until 9:00 PM on the same day, otherwise the
                  reservation will be automatically cancelled.
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
                }`}
            >
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
              className="px-5 py-2.5 text-sm font-medium text-ink hover:bg-sage-muted rounded-md transition-colors"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleProceed}
              disabled={!paymentMethod}
              className="btn-primary-mockup"
            >
              Proceed to Payment
            </button>
          </div>

          <Modal
            open={isPaymentPlanModalOpen}
            onClose={
              isSubmitting ? () => {} : () => setIsPaymentPlanModalOpen(false)
            }
            showCloseButton={!isSubmitting}
            contentClassName="relative w-full max-w-xl mx-4 overflow-hidden rounded-xl border border-[#d7c089]/25 bg-[#0c2c27]/95 px-5 py-6 text-center shadow-2xl backdrop-blur-sm md:px-8 md:py-8"
            backgroundImage={undefined}
          >
            <div className="space-y-5 text-white">
              <h3 className="text-xl font-semibold">
                Choose Online Payment Option
              </h3>
              <p className="text-sm text-white/85">
                Select how your client will settle payment before continuing to
                booking policy confirmation.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleSelectOnlinePaymentPlan("full")}
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    onlinePaymentPlan === "full"
                      ? "border-gold bg-white/15"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <p className="font-semibold">Pay Full</p>
                  <p className="text-xs text-white/80">
                    Collect the total booking amount now.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSelectOnlinePaymentPlan(
                      buildPartialPlan(partialPaymentPercent),
                    )
                  }
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    selectedPartialPercent === partialPaymentPercent
                      ? "border-gold bg-white/15"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <p className="font-semibold">{`Pay Partial (${partialPaymentPercent}%)`}</p>
                  <p className="text-xs text-white/80">{`Collect ${partialPaymentPercent}% now and settle the balance later.`}</p>
                </button>
              </div>
            </div>
          </Modal>

          {/* Proceed Confirmation Modal – stay open during submit so loader is visible */}
          <Modal
            open={isProceedModalOpen}
            onClose={isSubmitting ? () => {} : () => setIsProceedModalOpen(false)}
            showCloseButton={!isSubmitting}
            contentClassName="relative w-full max-w-3xl mx-4 overflow-hidden rounded-xl border border-[#d7c089]/25 bg-[#0c2c27]/95 px-5 py-6 text-center shadow-2xl backdrop-blur-sm md:px-8 md:py-8"
            backgroundImage={undefined}
          >
            <input
              type="text"
              name="website"
              autoComplete="off"
              tabIndex={-1}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="sr-only"
              aria-hidden
            />
            <PaymentConfirmContent
              onCancel={() => {
                if (!isSubmitting) {
                  setIsProceedModalOpen(false);
                }
              }}
              onConfirm={handleConfirmProceed}
              isSubmitting={isSubmitting}
            />
          </Modal>
        </div>
      )}
    </div>
  );
}
