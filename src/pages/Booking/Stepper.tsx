"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex justify-center w-full">
      <div className="flex items-center justify-center w-full max-w-4xl gap-0">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center relative">
                <div
                  className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                    isCompleted
                      ? "bg-[var(--color-sage)] text-white shadow-sm"
                      : isActive
                        ? "bg-[var(--color-sage)] text-white ring-4 ring-[var(--color-sage)]/20"
                        : "bg-[var(--color-sage-muted)] text-[var(--color-charcoal)]/50",
                  )}>
                  {isCompleted ? (
                    <Check
                      className="w-4 md:w-5 h-4 md:h-5"
                      strokeWidth={2.5}
                    />
                  ) : (
                    step.icon
                  )}
                </div>
              </div>
              {!isLast && (
                <div className="flex-1 h-0.5 mx-1 md:mx-2 min-w-[12px]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isCompleted
                        ? "bg-[var(--color-sage)]"
                        : "bg-[var(--color-sage-muted)]",
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
