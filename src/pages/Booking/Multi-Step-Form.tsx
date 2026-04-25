import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProgressIndicator } from "./ProgressIndicator";
import { Step1 } from "./Steps/Step1";
import { Step2 } from "./Steps/Step2";
import { Step3 } from "./Steps/Step3";
import { Step4 } from "./Steps/Step4";
import { Step5 } from "./Steps/Step5";
import { stepMotion } from "@/lib/constants/booking.constants";
import { STEPS } from "./constants/steps.config";
import { useBookingForm } from "@/hooks/useBookingForm";
import { useBookingValidation } from "@/hooks/useBookingValidation";
import { useBookingSubmission } from "@/hooks/useBookingSubmission";
import { NavigationButtons } from "./components/NavigationButtons";
import { clearCartStorage } from "@/lib/storage/localStorage";
import toast from "@/lib/logger/toast";

type BookingSubmitError = Error & {
  response?: {
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
  };
};

/**
 * Multi-step booking form component
 * Orchestrates the booking flow across multiple steps
 */
export function MultiStepForm() {
  const navigate = useNavigate();
  const [dateConflictNotice, setDateConflictNotice] = useState("");
  const [dateConflictSnapshot, setDateConflictSnapshot] = useState<{
    checkIn: string;
    checkOut: string;
  } | null>(null);
  const {
		formData,
		setSelectedRooms,
		setSelectedVenues,
		setPaymentMethod,
		setOnlinePaymentPlan,
		paymentSettings,
		updateFormData,
		goToStep,
		nextStep,
		previousStep,
	} = useBookingForm();

  const { personalDetails, isStepComplete } = useBookingValidation(
    formData,
    updateFormData
  );

  const { submitBooking, isSubmitting } = useBookingSubmission();

  useEffect(() => {
    if (!dateConflictSnapshot) return;
    const checkInChanged = formData.check_in !== dateConflictSnapshot.checkIn;
    const checkOutChanged = formData.check_out !== dateConflictSnapshot.checkOut;

    if (checkInChanged || checkOutChanged) {
      setDateConflictNotice("");
      setDateConflictSnapshot(null);
    }
  }, [
    dateConflictSnapshot,
    formData.check_in,
    formData.check_out,
  ]);

  const extractSubmitErrorMessage = (error: unknown): string => {
    if (!(error instanceof Error)) return "Failed to complete booking.";
    const typedError = error as BookingSubmitError;
    const payload = typedError.response?.data;
    const fallback = (
      payload?.message ||
      typedError.message ||
      "Failed to complete booking."
    ).trim();

    const fieldErrors = payload?.errors;
    if (!fieldErrors || Object.keys(fieldErrors).length === 0) return fallback;

    const details = Object.values(fieldErrors)
      .flat()
      .map((entry) => String(entry).trim())
      .filter(Boolean);

    return details.length > 0 ? details.join("\n") : fallback;
  };

  const handleNext = () => {
    if (
      formData.current_step < STEPS.length &&
      isStepComplete(formData.current_step)
    ) {
      nextStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (formData.current_step === 1) {
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      previousStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (websiteHoneypot: string) => {
    if (!isStepComplete(2) || !isStepComplete(4)) {
      toast.error({ content: "Please complete required fields." });
      return;
    }

    await submitBooking(
      formData,
      (response) => {
        // Keep booking form storage until receipt flow completes, but clear cart immediately
        // after successful booking creation so guest selections don't linger.
        clearCartStorage();

        if (response?.email_verification_required) {
          const receiptToken =
            response?.booking?.receipt_token ??
            (response?.bookings?.[0] as { receipt_token?: string } | undefined)
              ?.receipt_token;
          const referenceNumber =
            response?.booking?.reference_number ??
            response?.bookings?.[0]?.reference_number ??
            formData.reference_number;
          if (receiptToken) {
            navigate(`/booking-receipt/${encodeURIComponent(receiptToken)}`);
          } else if (referenceNumber) {
            navigate(`/booking-receipt/${encodeURIComponent(referenceNumber)}`);
          } else {
            goToStep(5);
          }
          return;
        }

        // Online payment: redirect to Xendit payment page
        if (response?.payment_url) {
          window.location.href = response.payment_url;
          return;
        }
        const receiptToken =
          response?.booking?.receipt_token ??
          (response?.bookings?.[0] as { receipt_token?: string } | undefined)
            ?.receipt_token;
        const referenceNumber =
          response?.booking?.reference_number ??
          response?.bookings?.[0]?.reference_number ??
          formData.reference_number;
        if (receiptToken) {
          navigate(`/booking-receipt/${receiptToken}`);
        } else if (referenceNumber) {
          navigate(`/booking-receipt/${referenceNumber}`);
        } else {
          goToStep(5);
        }
      },
      (error) => {
        const message = extractSubmitErrorMessage(error);
        toast.error({ content: message });

        const normalized = message.toLowerCase();
        const hasDateOverlap =
          normalized.includes("overlap") ||
          normalized.includes("active booking");

        if (hasDateOverlap) {
          setDateConflictNotice(message);
          setDateConflictSnapshot({
            checkIn: formData.check_in,
            checkOut: formData.check_out,
          });
          if (window.location.pathname !== "/create-booking") {
            navigate("/create-booking");
          }
          goToStep(1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      { website: websiteHoneypot },
    );
  };

  return (
		<section className="w-full max-w-[1200px] mx-auto px-3 lg:px-12 pt-20 pb-8">
			<ProgressIndicator currentStep={formData.current_step} />

			<div className="mt-8 mb-8 min-h-87.5">
				<AnimatePresence mode="wait" initial={false}>
					{formData.current_step === 1 && (
						<motion.div key="step1" {...stepMotion}>
							<Step1
								formData={formData}
								updateFormData={updateFormData}
                dateConflictNotice={dateConflictNotice}
							/>
						</motion.div>
					)}
					{formData.current_step === 2 && (
						<motion.div key="step2" {...stepMotion}>
							<Step2
								formData={personalDetails}
								onUpdate={(data) => updateFormData(data)}
								onValuesChange={updateFormData}
							/>
						</motion.div>
					)}

					{formData.current_step === 3 && (
						<motion.div key="step3" {...stepMotion}>
							<Step3
								updateFormData={updateFormData}
								setSelectedRooms={setSelectedRooms}
								setSelectedVenues={setSelectedVenues}
								formData={formData}
								selectedRoom={{
									name: "Standard",
									floor: "Second Floor",
									bed_type: "Double Bed",
									price: 999,
								}}
								onEdit={() => goToStep(2)}
								onProceed={() => goToStep(4)}
							/>
						</motion.div>
					)}
					{formData.current_step === 4 && (
						<motion.div key="step4" {...stepMotion}>
							<Step4
								paymentMethod={formData.paymentMethod}
								setPaymentMethod={setPaymentMethod}
								onlinePaymentPlan={formData.onlinePaymentPlan}
								setOnlinePaymentPlan={setOnlinePaymentPlan}
								paymentSettings={paymentSettings}
								onBack={() => goToStep(3)}
								onProceed={handleSubmit}
								isSubmitting={isSubmitting}
							/>
						</motion.div>
					)}
					{formData.current_step === 5 && (
						<motion.div key="step5" {...stepMotion}>
							<Step5
								formData={formData}
								depositPercent={paymentSettings.partialPaymentPercent}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<NavigationButtons
				currentStep={formData.current_step}
				onPrevious={handlePrevious}
				onNext={handleNext}
				isNextDisabled={!isStepComplete(formData.current_step)}
				estimatedTotal={formData.grandTotalPrice ?? 0}
			/>
		</section>
	);
}
