import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, Server, CheckCircle2, FlaskConical, CircleDashed } from "lucide-react";

const PROGRESS_STEPS = [
  { icon: Server, label: "Upload completely received" },
  { icon: Cpu, label: "Running AI classification model" },
  { icon: FlaskConical, label: "Verifying sustainability footprint" },
  { icon: CheckCircle2, label: "Evaluating confidence ratios" }
];

const ProcessingAnimation = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Sequentially cascade checks every 800ms
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < PROGRESS_STEPS.length ? prev + 1 : prev));
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border/50 bg-card/80 p-8 shadow-sm backdrop-blur-sm"
    >
      <div className="flex flex-col space-y-8">
        
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-3 relative">
             <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
             <Cpu className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-heading text-2xl font-bold tracking-tight text-primary">AI Validation Offline</h3>
          <p className="text-base text-muted-foreground mx-auto max-w-sm">
            Please wait securely while our neural network processes your environmental metrics.
          </p>
        </div>

        <div className="w-full space-y-3.5 bg-secondary/20 p-5 rounded-xl border border-border/40">
          {PROGRESS_STEPS.map((step, idx) => {
            const isCompleted = activeStep > idx;
            const isActive = activeStep === idx;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className={`flex items-center gap-4 rounded-lg p-3 transition-colors duration-300 ${isCompleted ? "bg-green-500/10 border border-green-500/20" : isActive ? "bg-primary/10 border border-primary/20" : "bg-background/40 border border-border/20 opacity-60"}`}
              >
                <div className="shrink-0 flex items-center justify-center w-8 h-8">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 className="h-6 w-6 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    </motion.div>
                  ) : isActive ? (
                    <CircleDashed className="h-6 w-6 text-primary animate-spin shadow-primary/20" />
                  ) : (
                    <step.icon className="h-5 w-5 text-muted-foreground/60" />
                  )}
                </div>
                <span className={`text-sm font-medium ${isCompleted ? "text-green-500" : isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
                
                {isActive && (
                   <span className="ml-auto flex gap-1 items-center">
                     <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                     <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                     <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '300ms' }} />
                   </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ProcessingAnimation;
