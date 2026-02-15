import { Button } from "@/components/ui/button";
import { pricingFormat } from "@/lib/formatters/pricingFormat";

interface NavigationButtonsProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
  /** Estimated total for step 1 (rooms + venues × days); shown before Continue */
  estimatedTotal?: number;
}

/**
 * Navigation buttons component for the booking form
 */
export const NavigationButtons = ({
  currentStep,
  onPrevious,
  onNext,
  isNextDisabled,
  estimatedTotal = 0,
}: NavigationButtonsProps) => {
  if (currentStep >= 5 || currentStep === 4) {
    return null;
  }

  const showEstimatedTotal = currentStep === 1;

  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <Button
        variant="ghost"
        onClick={onPrevious}
        className="px-5 py-2.5 text-(--color-charcoal) hover:bg-(--color-sage-muted) font-medium">
        {currentStep === 3 ? "← Edit Personal Info" : "← Back"}
      </Button>
      <div className="flex items-center gap-4">
        {showEstimatedTotal && (
          <div
            className="text-right"
            style={{ color: "var(--color-charcoal)" }}>
            <p className="text-sm font-medium opacity-90">Estimated total</p>
            <p className="text-xl font-bold tracking-tight">
              {pricingFormat(estimatedTotal)}
            </p>
          </div>
        )}
        <Button
          onClick={onNext}
          disabled={isNextDisabled}
          className="px-8 py-3 font-semibold text-white transition-all shadow-sm hover:opacity-95 disabled:opacity-50"
          style={{ backgroundColor: "var(--color-sage)" }}>
          Continue
        </Button>
      </div>
    </div>
  );
};
