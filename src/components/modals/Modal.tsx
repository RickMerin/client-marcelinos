import { CircleX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
  contentClassName?: string;
  backgroundImage?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  showCloseButton = true,
  contentClassName = "relative bg-green-800 text-center px-4 py-5 rounded-lg shadow-lg max-w-2xl w-full mx-4 overflow-hidden",
  backgroundImage = "/green-leaves-extended.png",
}: ModalProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          {/* BACKDROP */}
          <motion.div
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            onClick={onClose}
          />

          {/* MODAL */}
          <motion.div
            initial={{ y: 45, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 45, scale: 0.93, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 110,
              damping: 20,
              mass: 1,
              delay: 0.12, // ✨ DELAY HERE
            }}
            className={contentClassName}
            onClick={(e) => e.stopPropagation()}
          >
            {showCloseButton && (
              <button
                type="button"
                className="absolute top-3 right-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
                onClick={onClose}
                aria-label="Close modal"
              >
                <CircleX className="h-4 w-4" />
              </button>
            )}

            {backgroundImage && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-50"
                style={{ backgroundImage: `url('${backgroundImage}')` }}
              />
            )}

            <div className="relative z-10">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
