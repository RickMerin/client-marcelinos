import React, { useEffect, useState } from "react";
import {
  HousePlus,
  BookUser,
  CreditCard,
  ReceiptText,
  PartyPopper,
} from "lucide-react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stepper } from "./Stepper";
import { Step1 } from "./Steps/Step1";
import { Step2 } from "./Steps/Step2";
import { Step3 } from "./Steps/Step3";
import { Step4 } from "./Steps/Step4";
import { Step5 } from "./Steps/Step5";
import { formatDate } from "@/lib/formatDate";
import { saveToLocalStorage, getFromLocalStorage } from "@/lib/localStorage";

const STEPS = [
  { id: 1, icon: <HousePlus /> },
  { id: 2, icon: <BookUser /> },
  { id: 3, icon: <CreditCard /> },
  { id: 4, icon: <ReceiptText /> },
  { id: 5, icon: <PartyPopper /> },
];

export interface FormData {
  check_in: string;
  check_out: string;
  days: number;
  rooms: any[];
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  category: string;
  newsletter: boolean;
  notifications: boolean;
  paymentMethod: string;
  idFile?: string | null;
}

const defaultFormData: FormData = {
  check_in: "",
  check_out: "",
  days: 1,
  rooms: [],
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  category: "",
  newsletter: false,
  notifications: false,
  paymentMethod: "",
  idFile: null,
};

const stepMotion = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.35, ease: easeInOut },
};

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Load initial form data
  const reservationDate = getFromLocalStorage("reservationDate");
  const storedFormData = getFromLocalStorage("reservationDetails");

  const initialFormData: FormData = {
    ...defaultFormData,
    ...(storedFormData || {}),
    check_in:
      formatDate(reservationDate?.check_in) || storedFormData?.check_in || "",
    check_out:
      formatDate(reservationDate?.check_out) || storedFormData?.check_out || "",
    days: reservationDate?.days || storedFormData?.days || 1,
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // ✅ Keep localStorage synced with formData
  useEffect(() => {
    saveToLocalStorage("reservationDetails", formData);
  }, [formData]);

  // ✅ Autoload from localStorage when mounted (in case user refreshes)
  useEffect(() => {
    const saved = getFromLocalStorage("reservationDetails");
    if (saved) setFormData((prev) => ({ ...prev, ...saved }));
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length && isStepComplete(currentStep)) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep === 1) {
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const setSelectedRooms = (rooms: any[]) =>
    setFormData((prev) => ({ ...prev, rooms }));

  const setPaymentMethod = (method: string) =>
    setFormData((prev) => ({ ...prev, paymentMethod: method }));

  const handleFileUpload = async (file?: File | null) => {
    if (!file) return setFormData((p) => ({ ...p, idFile: null }));
    const dataUrl = await new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(String(reader.result));
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
    setFormData((p) => ({ ...p, idFile: dataUrl }));
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.rooms.length > 0;
      case 2:
        return (
          formData.firstName.trim() &&
          formData.lastName.trim() &&
          /\S+@\S+\.\S+/.test(formData.email) &&
          formData.phone.trim().length > 6
        );
      case 3:
        return (
          formData.street.trim() &&
          formData.city.trim() &&
          formData.state.trim() &&
          formData.zipCode.trim()
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!isStepComplete(2) || !isStepComplete(3)) {
      alert("Please complete required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Submission failed");
      alert("Booking submitted — check your email for confirmation.");
      localStorage.removeItem("reservationDetails");
    } catch (err) {
      console.error(err);
      alert("Error submitting booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="p-8 shadow-none border-none">
        <Stepper steps={STEPS} currentStep={currentStep} />

        <div className="mt-8 mb-8 min-h-[350px]">
          <AnimatePresence mode="wait" initial={false}>
            {currentStep === 1 && (
              <motion.div key="step1" {...stepMotion}>
                <Step1
                  formData={formData}
                  handleInputChange={handleInputChange}
                  setSelectedRooms={setSelectedRooms}
                />
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div key="step2" {...stepMotion}>
                <Step2
                  formData={formData}
                  handleInputChange={handleInputChange}
                  onFileUpload={handleFileUpload}
                />
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div key="step3" {...stepMotion}>
                <Step3
                  formData={formData}
                  selectedRoom={{
                    name: "Standard",
                    floor: "Second Floor",
                    bed_type: "Double Bed",
                    price: 999,
                  }}
                  onEdit={() => setCurrentStep(2)}
                  onProceed={() => setCurrentStep(4)}
                />
              </motion.div>
            )}
            {currentStep === 4 && (
              <motion.div key="step4" {...stepMotion}>
                <Step4
                  setPaymentMethod={setPaymentMethod}
                  onBack={() => setCurrentStep(3)}
                  onProceed={() => setCurrentStep(5)}
                />
              </motion.div>
            )}
            {currentStep === 5 && (
              <motion.div key="step5" {...stepMotion}>
                <Step5 formData={formData} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {currentStep < 5 && (
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              className="px-6 py-2">
              {currentStep === 3 ? " ← Edit Personal Info" : " ← Back"}
            </Button>
            {currentStep === 4 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-black">
                {submitting ? "Submitting..." : "Proceed to Payment"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepComplete(currentStep)}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-black">
                Continue
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
