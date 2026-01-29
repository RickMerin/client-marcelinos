import { useState } from "react";
import Modal from "./Modal";
import ModalDesign from "./ModalDesign";
import {
  saveToLocalStorage,
  getFromLocalStorage,
} from "@/lib/storage/localStorage";

const STORAGE_KEY = "marcelino_modal_accepted";

function getAlreadyAccepted(): boolean {
  if (typeof window === "undefined") return false;
  return getFromLocalStorage(STORAGE_KEY) === "true";
}

export default function WelcomeModal() {
  const [open, setOpen] = useState(() => !getAlreadyAccepted());

  const handleAccept = () => {
    saveToLocalStorage(STORAGE_KEY, "true");
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDesign onAccept={handleAccept} />
    </Modal>
  );
}
