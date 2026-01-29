import { useState, useEffect } from "react";
import ModalDesign from "./ModalDesign";
import { CircleX } from "lucide-react";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";

export default function Modal() {
  const [open, setOpen] = useState(false);
  const {saveToLocalStorage, getFromLocalStorage} = useLocalStorage();

  useEffect(() => { 
    const accepted = localStorage.getItem("marcelino_modal_accepted");
    if (!accepted) {
      setOpen(true); // show modal if not accepted
    } 
  }, []);

  const handleAccept = () => {
    localStorage.setItem("marcelino_modal_accepted", "true"); // save accept
    setOpen(false); // close modal
  };

  if (!open) return null;

  return (
   <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
  <div className="relative bg-green-800 text-center p-6 rounded-lg shadow-lg max-w-2xl w-full mx-2 overflow-hidden">
    
    <div
      className="absolute inset-0 bg-cover bg-center opacity-50"
      style={{ backgroundImage: "url('/green-leaves-extended.png')" }}
    ></div>

    {}
    <div className="relative z-10">
      <ModalDesign onAccept={handleAccept} />

      {}
      <button
        className="absolute top-2 right-2 text-white hover:text-gray-900 z-20"
        onClick={handleAccept} // treat close as accept
      >
        <CircleX />
      </button>
    </div>

  </div>
</div>

  );
}
