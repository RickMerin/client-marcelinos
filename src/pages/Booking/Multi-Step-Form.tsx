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
import { formatDate } from "@/lib/formatters/formatDate";
import { personalDetailsSchema } from "@/lib/validators/personalDetails.schema";
import {
  saveToLocalStorage,
  getFromLocalStorage,
} from "@/lib/storage/localStorage";

import {
  calculateTotalPrice,
  calculateGrandTotalPrice,
} from "@/lib/math/calculate";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import { queryClient } from "@/lib/api/queryClient";

const STEPS = [
  { id: 1, icon: <HousePlus /> },
  { id: 2, icon: <BookUser /> },
  { id: 3, icon: <CreditCard /> },
  { id: 4, icon: <ReceiptText /> },
  { id: 5, icon: <PartyPopper className="h-5 w-5 md:h-8 md:w-8" /> },
];

export type Gender = "Male" | "Female";

interface GuestResponse {
  message: string;
  data: {
    id: number;
  };
}

export interface FormData {
  reference_id?: string | null;
  current_step: number;
  check_in: string;
  check_out: string;
  days: number;
  rooms: any[];

  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: Gender;
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

  totalPrice: number;
  grandTotalPrice: number;
}

const defaultFormData: FormData = {
  current_step: 1,
  check_in: "",
  check_out: "",
  days: 1,
  rooms: [],

  firstName: "",
  middleName: null,
  lastName: "",
  gender: "Male", // 👈 REQUIRED
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
  totalPrice: 0,
  grandTotalPrice: 0,
};

const stepMotion = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.35, ease: easeInOut },
};

export function MultiStepForm() {

  // const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Load initial form data
  const reservationDate = getFromLocalStorage("reservationDate");
  const storedFormData = getFromLocalStorage("reservationDetails");

  if (reservationDate?.days === 0) {
    navigate("/");
  }

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

  const personalDetails = {
    firstName: formData.firstName,
    middleName: formData.middleName,
    lastName: formData.lastName,
    gender: formData.gender,
    phone: formData.phone,
    email: formData.email,
    address: formData.address,
    idFile: formData.idFile ?? null,
  };

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
    if (
      formData.current_step < STEPS.length &&
      isStepComplete(formData.current_step)
    ) {
      setFormData((prev) => ({ ...prev, current_step: prev.current_step + 1 }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
    const generateReferenceId = () => {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${rand}`;
  };

  const handlePrevious = () => {
    if (formData.current_step === 1) {
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setFormData((prev) => ({ ...prev, current_step: prev.current_step - 1 }));
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
    setFormData((prev) => {
      const totalPrice = calculateTotalPrice(rooms);
      const grandTotalPrice = calculateGrandTotalPrice(rooms, prev.days);
      return { ...prev, rooms, totalPrice, grandTotalPrice };
    });
  useEffect(() => {
    if (!reservationDate?.check_in) {
      navigate("/");
    }
  }, [reservationDate, navigate]);

  // 👇 keep grandTotalPrice in sync when days changes
  useEffect(() => {
    
    setFormData((prev) => ({
      ...prev,
      grandTotalPrice: calculateGrandTotalPrice(prev.rooms, prev.days),
    }));
  }, [formData.days]);

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
        return personalDetailsSchema.safeParse(personalDetails).success;
      case 3:
        return true;
      case 4:
        return formData.paymentMethod !== "";
      default:
        return true;
    }
  };

const createGuest = useApiMutation<GuestResponse>("post");

const buildGuestPayload = () => {
  const isIntl = false; 

  return {
    first_name: formData.firstName || "N/A",
    middle_name: formData.middleName || null,
    last_name: formData.lastName || "N/A",
    email: formData.email,
    contact_num: formData.phone || "0000000000",
    gender: formData.gender || "Male",
    id_type: "PhilID",
    id_number: "TEMP-ID",
    is_international: isIntl,
    province: isIntl ? null : formData.state || "Unknown",
    municipality: isIntl ? null : formData.city || "Unknown",
    barangay: isIntl ? null : formData.address || "Unknown",

    // International fields
    city: isIntl ? formData.city : null,
    state_region: isIntl ? formData.state : null,
  };
};




  const createBooking = useApiMutation("post", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

    
  const handleSubmit = async () => {
    if (!isStepComplete(2) || !isStepComplete(4)) {
      alert("Please complete required fields.");
      return;
    }

    
    let refId = formData.reference_id;
    if (!refId) {
      refId = generateReferenceId();
      setFormData((prev) => ({ ...prev, reference_id: refId }));
    }

  try {
    
    // 1️⃣ Create Guest
    const guestResponse = await createGuest.mutateAsync({
      url: "/guests",
      body: buildGuestPayload(),
    });



    // 2️⃣ Create Booking using guest_id
const guestId = guestResponse.data.id;
    console.log("Creating booking payload", {
      guest_id: guestId,
      room_id: formData.rooms[0]?.id,
      check_in: formData.check_in,
      check_out: formData.check_out,
    });
    console.log("Guest API response:", guestResponse.data.id);

await createBooking.mutateAsync({
  url: "/bookings",
  body: {
    reference_id: refId,
    guest_id: guestId,
    room_id: formData.rooms[0].id,
    check_in: formData.check_in,
    check_out: formData.check_out,
  },
});


    // 3️⃣ Move to success step
    setFormData((prev) => ({ ...prev, current_step: 5 }));
  } catch (error) {
    console.error(error);
    alert("Failed to complete booking.");
  }
};


  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="p-8 shadow-none border-none">
        <Stepper steps={STEPS} currentStep={formData.current_step} />

        <div className="mt-8 mb-8 min-h-[350px]">
          <AnimatePresence mode="wait" initial={false}>
            {formData.current_step === 1 && (
              <motion.div key="step1" {...stepMotion}>
                <Step1
                  formData={formData}
                  handleInputChange={handleInputChange}
                  setSelectedRooms={setSelectedRooms}
                />
              </motion.div>
            )}
            {formData.current_step === 2 && (
              <motion.div key="step2" {...stepMotion}>
                <Step2
                  formData={personalDetails}
                  onUpdate={(data) =>
                    setFormData((prev) => ({
                      ...prev,
                      ...data,
                    }))
                  }
                  onFileUpload={handleFileUpload}
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
                  onEdit={() =>
                    setFormData((prev) => ({ ...prev, current_step: 2 }))
                  }
                  onProceed={() =>
                    setFormData((prev) => ({ ...prev, current_step: 4 }))
                  }
                />
              </motion.div>
            )}
            {formData.current_step === 4 && (
              <motion.div key="step4" {...stepMotion}>
                <Step4
                  paymentMethod={formData.paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  onBack={() =>
                    setFormData((prev) => ({ ...prev, current_step: 3 }))
                  }
                  onProceed={handleSubmit}
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

        {formData.current_step < 5 && formData.current_step !== 4 && (
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              className="px-6 py-2">
              {formData.current_step === 3
                ? " ← Edit Personal Info"
                : " ← Back"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepComplete(formData.current_step)}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-black">
              Continue
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
