import React from "react";
import { cn } from "~/lib/utils";

interface Step {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface StepperProps {
    steps: Step[];
    currentStepIndex: number;
    className?: string;
}

export default function Stepper({
    steps,
    currentStepIndex,
    className,
}: Readonly<StepperProps>) {
    return (
        <div className={cn("w-full px-4 py-3", className)}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center gap-1.5 text-center">
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300",
                                        isCompleted
                                            ? "bg-primary text-white"
                                            : isCurrent
                                            ? "bg-primary/20 border-2 border-primary text-primary"
                                            : "bg-gray-200 text-gray-400"
                                    )}
                                >
                                    {step.icon}
                                </div>
                                <p
                                    className={cn(
                                        "text-xs font-medium transition-colors duration-300",
                                        isCurrent || isCompleted
                                            ? "text-primary"
                                            : "text-gray-400"
                                    )}
                                >
                                    {step.label}
                                </p>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "flex-1 h-1 transition-colors duration-300 -mx-2",
                                        isCompleted
                                            ? "bg-primary"
                                            : "bg-gray-200"
                                    )}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
