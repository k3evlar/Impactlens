import { motion } from "framer-motion";
import { Upload, Cpu, ShieldCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type VerificationStep = "upload" | "processing" | "verified";

const steps: { key: VerificationStep; label: string; icon: typeof Upload }[] = [
  { key: "upload", label: "Upload", icon: Upload },
  { key: "processing", label: "Processing", icon: Cpu },
  { key: "verified", label: "Result", icon: ShieldCheck },
];

interface StepIndicatorProps {
  currentStep: VerificationStep;
}

const stepIndex = (step: VerificationStep) =>
  steps.findIndex((s) => s.key === step);

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const current = stepIndex(currentStep);

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {steps.map((step, i) => {
        const isCompleted = i < current;
        const isActive = i === current;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-2 relative">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1 : 0.9,
                  backgroundColor: isCompleted
                    ? "hsl(142 71% 45%)"
                    : isActive
                    ? "hsl(142 71% 45% / 0.15)"
                    : "hsl(150 6% 14%)",
                  borderColor: isCompleted || isActive
                    ? "hsl(142 71% 45% / 0.5)"
                    : "hsl(150 8% 16%)",
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2",
                  isActive && "shadow-[0_0_20px_hsl(142_71%_45%/0.25)]"
                )}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </motion.div>
                ) : (
                  <step.icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                )}
              </motion.div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-3 mb-6 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full w-full origin-left bg-primary"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
