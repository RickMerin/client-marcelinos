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
      <div className="flex items-center justify-center w-full max-w-4xl">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Icon */}
              <div className="flex flex-col items-center relative">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                    isCompleted
                      ? "bg-green-600 text-white"
                      : isActive
                      ? "bg-green-500 text-primary-foreground ring-4 ring-primary/25"
                      : "bg-gray-200 text-gray-500"
                  )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-1 mx-2 mb-6">
                  <div
                    className={cn(
                      "h-full rounded transition-all duration-300",
                      isCompleted ? "bg-green-600" : "bg-gray-200"
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
