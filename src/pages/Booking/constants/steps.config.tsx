import {
  HousePlus,
  User,
  FileText,
  CreditCard,
  CheckCircle,
} from "lucide-react";

export const STEPS = [
  { id: 1, label: "Room & Venue", icon: <HousePlus className="size-5 md:size-6" /> },
  { id: 2, label: "Personal Info", icon: <User className="size-5 md:size-6" /> },
  { id: 3, label: "Review Details", icon: <FileText className="size-5 md:size-6" /> },
  { id: 4, label: "Choose Payment", icon: <CreditCard className="size-5 md:size-6" /> },
  { id: 5, label: "Confirmation", icon: <CheckCircle className="size-5 md:size-6" /> },
];
