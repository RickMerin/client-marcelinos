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
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="ghost"
        onClick={onPrevious}
        className="px-6 py-2">
        {currentStep === 3 ? " ← Edit Personal Info" : " ← Back"}
      </Button>
      <Button
        onClick={onNext}
        disabled={isNextDisabled}
        className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-black">
        Continue
      </Button>
    </div>
  );
};
