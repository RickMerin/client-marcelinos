import { useState } from "react";
import Modal from "./Modal";
import ModalDesign from "./ModalDesign";
import {
  saveToLocalStorage,
  getFromLocalStorage,
} from "@/lib/storage/localStorage";

const STORAGE_EXPIRATION_MS =  0; 
const STORAGE_KEY = "marcelino_modal_accepted";

function getAlreadyAccepted(): boolean {
  if (typeof window === "undefined") return false;
  return getFromLocalStorage(STORAGE_KEY) === "true";
}

export default function WelcomeModal() {
  const [open, setOpen] = useState(() => !getAlreadyAccepted());

  const handleAccept = () => {
    saveToLocalStorage(STORAGE_KEY, "true", STORAGE_EXPIRATION_MS);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      contentClassName="relative w-full max-w-2xl mx-4 overflow-hidden rounded-xl border border-[#d7c089]/25 bg-[#0c2c27]/95 px-4 py-5 text-center shadow-2xl backdrop-blur-sm md:px-6 md:py-6"
      backgroundImage={undefined}
    >
      <ModalDesign onAccept={handleAccept} />
    </Modal>
  );
}
