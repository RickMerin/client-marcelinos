"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS } from "./constants/steps.config";

interface ProgressIndicatorProps {
  currentStep: number;
  
}

export function ProgressIndicator({
  currentStep,
}: ProgressIndicatorProps) {
  const steps = STEPS;

  return (
		<div
			className="w-full py-6 sm:py-8 px-0 lg:px-12 border-b"
			style={{
				backgroundColor: "var(--color-cream)",
				borderColor: "var(--color-sage-muted, #e5e7eb)",
			}}>
			<div className="max-w-[1200px] mx-auto">
				<div className="flex items-center justify-center gap-2 sm:gap-4 relative">
					{/* Connector lines */}
					{steps.map((_, index) => {
						if (index < steps.length - 1) {
							const isComplete = index + 1 < currentStep;
							return (
								<div
									key={`connector-${index}`}
									className={cn(
										"absolute top-6 h-0.5 transition-colors duration-300",
										isComplete ? "bg-sea" : "bg-sage-muted",
									)}
									style={{
										left: `calc(${(index + 0.5) * (100 / steps.length)}% + 1.5rem)`,
										right: `calc(${100 - (index + 1.5) * (100 / steps.length)}% + 1.5rem)`,
									}}
								/>
							);
						}
					})}

					{steps.map((step, index) => {
						const isActive = index + 1 === currentStep;
						const isComplete = index + 1 < currentStep;

						return (
							<div
								key={step.id}
								className="flex flex-col items-center flex-1 relative z-10">
								{/* Step Circle */}
								<div
									className={cn(
										"w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow-sm",
										isComplete
											? "bg-sea text-cream"
											: isActive
												? "bg-sea text-cream ring-4 ring-gold/50"
												: "bg-sage-muted text-ink-soft",
									)}>
									{isComplete ? (
										<Check
											className="w-5 h-5 sm:w-6 sm:h-6"
											strokeWidth={2.5}
										/>
									) : (
										step.icon
									)}
								</div>

								{/* Step Label */}
								<span
									className={cn(
										"text-xs text-center font-medium hidden sm:block whitespace-nowrap",
										isActive || isComplete
											? "text-ink font-semibold"
											: "text-ink-soft",
									)}>
									{step.label}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
