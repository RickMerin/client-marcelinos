import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
}

/**
 * Navigation buttons component for the booking form
 */
export const NavigationButtons = ({
  currentStep,
  onPrevious,
  onNext,
  isNextDisabled,
}: NavigationButtonsProps) => {
  if (currentStep >= 5 || currentStep === 4) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <Button
        variant="ghost"
        onClick={onPrevious}
        className="px-5 py-2.5 text-[var(--color-charcoal)] hover:bg-[var(--color-sage-muted)] font-medium">
        {currentStep === 3 ? "← Edit Personal Info" : "← Back"}
      </Button>
      <Button
        onClick={onNext}
        disabled={isNextDisabled}
        className="px-8 py-3 font-semibold text-white transition-all shadow-sm hover:opacity-95 disabled:opacity-50"
        style={{ backgroundColor: "var(--color-sage)" }}>
        Continue
      </Button>
    </div>
  );
};
