import { CircleX } from "lucide-react";

export interface ModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Called when the modal should close (e.g. overlay click or close button) */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Show the X close button in the top-right (default: true) */
  showCloseButton?: boolean;
  /** Optional class for the inner content box (background, padding, etc.) */
  contentClassName?: string;
  /** Optional background image URL for the inner box */
  backgroundImage?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  showCloseButton = true,
contentClassName = "relative bg-green-800 text-center p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 overflow-hidden",
  backgroundImage = "/green-leaves-extended.png",
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className={contentClassName}>
         {showCloseButton && (
            <button
              type="button"
              className="absolute top-2 right-2 text-white hover:text-gray-900 z-20"
              onClick={onClose}
              aria-label="Close modal">
              <CircleX />
            </button>
          )}
        {backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
          />
        )}

        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
