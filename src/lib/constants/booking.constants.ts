import { easeInOut } from "framer-motion";
import { FormData } from "@/types/booking.types";

export const defaultFormData: FormData = {
  current_step: 1,
  check_in: "",
  check_out: "",
  days: 1,
  rooms: [],

  firstName: "",
  middleName: null,
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

  totalPrice: 0,
  grandTotalPrice: 0,
};

export const stepMotion = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.35, ease: easeInOut },
};
