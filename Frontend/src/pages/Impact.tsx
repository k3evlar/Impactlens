import { useState, useEffect } from "react";
import { TreePine, CloudFog } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// Helper component for count-up animation
const AnimatedNumber = ({ value }: { value: number }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 45, damping: 15 });
  const roundedValue = useTransform(springValue, (latest) => Math.round(latest));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span>{roundedValue}</motion.span>;
};

const ImpactPage = () => {
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.email) {
          const dataKey = `data_${user.email}`;
          const userDataStr = localStorage.getItem(dataKey);
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            setCredits(userData.credits || 0);
          }
        }
      } catch (e) {
        console.error("Failed to load impact stats", e);
      }
    }
  }, []);

  const treesPlanted = credits;
  const co2Offset = credits * 10;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <h1 className="font-heading text-4xl font-bold tracking-tight">Environmental Impact</h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Your verified sustainability actions are contributing to real-world environmental impact. Every action counts!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Trees Planted Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-background/60 backdrop-blur-sm border-green-500/20 hover:border-green-500/40 transition-all shadow-sm hover:shadow-green-500/10 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/10 rounded-bl-full -z-10 translate-x-8 -translate-y-8 blur-2xl" />
            <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
                <TreePine className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium text-lg">Trees Planted</p>
                <div className="text-6xl sm:text-7xl font-bold font-heading text-foreground tracking-tight">
                  <AnimatedNumber value={treesPlanted} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CO2 Offset Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-background/60 backdrop-blur-sm border-neutral-500/20 hover:border-neutral-500/40 transition-all shadow-sm hover:shadow-neutral-500/10 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-32 h-32 bg-neutral-500/10 rounded-bl-full -z-10 translate-x-8 -translate-y-8 blur-2xl" />
            <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-neutral-500/10 flex items-center justify-center text-neutral-400 mb-2">
                <CloudFog className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium text-lg">CO₂ Offset (kg)</p>
                <div className="text-6xl sm:text-7xl font-bold font-heading text-foreground tracking-tight flex items-baseline justify-center gap-1">
                  <AnimatedNumber value={co2Offset} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {credits === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center pt-8"
        >
          <p className="text-muted-foreground">Upload and verify your first sustainability action to start tracking your impact!</p>
        </motion.div>
      )}
    </div>
  );
};

export default ImpactPage;
