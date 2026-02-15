import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Stepper } from "./Stepper";
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

/**
 * Multi-step booking form component
 * Orchestrates the booking flow across multiple steps
 */
export function MultiStepForm() {
  const navigate = useNavigate();
  const {
    formData,
    setSelectedRooms,
    setSelectedVenues,
    setPaymentMethod,
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

  const handleSubmit = async () => {
    if (!isStepComplete(2) || !isStepComplete(4)) {
      alert("Please complete required fields.");
      return;
    }

    await submitBooking(formData, (response) => {
      const referenceNumber =
        response?.booking?.reference_number ??
        response?.bookings?.[0]?.reference_number ??
        formData.reference_number;
      if (referenceNumber) {
        navigate(`/booking-receipt/${referenceNumber}`);
      } else {
        goToStep(5);
      }
    });
  };

  return (
    <section className="container max-w-6xl mx-auto px-4 py-8">
      <Stepper steps={STEPS} currentStep={formData.current_step} />

      <div className="mt-8 mb-8 min-h-87.5">
        <AnimatePresence mode="wait" initial={false}>
          {formData.current_step === 1 && (
            <motion.div key="step1" {...stepMotion}>
              <Step1
                formData={formData}
                setSelectedRooms={setSelectedRooms}
                setSelectedVenues={setSelectedVenues}
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
                onBack={() => goToStep(3)}
                onProceed={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
          {formData.current_step === 5 && (
            <motion.div key="step5" {...stepMotion}>
              <Step5 formData={formData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NavigationButtons
        currentStep={formData.current_step}
        onPrevious={handlePrevious}
        onNext={handleNext}
        isNextDisabled={!isStepComplete(formData.current_step)}
      />
    </section>
  );
}
