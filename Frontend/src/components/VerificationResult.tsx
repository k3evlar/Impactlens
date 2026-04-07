import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Coins,
  Fingerprint,
  Brain,
  TreePine,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Link2,
  RotateCcw,
  Lightbulb,
  Cpu,
  Loader2,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VerificationData {
  success: boolean;
  verified: boolean;
  confidence: number;
  detected_class: string;
  activity?: string;
  reason?: string;
  explanation?: string;
  objects_detected?: string[];
  ipfsUri?: string;
  imageHash: string;
  timestamp?: number;
  mintTxId?: string;
  impactScore?: number;
  impact_score?: number;
  effort?: string;
  impact_summary?: string;
  impact_narrative?: string;
  narrative?: string;
  what_is_happening?: string;
  improvements?: string[];
  detailed_explanation?: string;
  reasoning?: string[];
  suggestions?: string[];
  minted?: boolean;
  detections?: Array<{
    label: string;
    confidence: number;
    bbox: [number, number, number, number];
  }>;
  status?: string;
  previewUrl?: string;
  finalDecision?: string;
}


interface VerificationResultProps {
  data: VerificationData;
  onReset: () => void;
  onMint: () => void;
  onReevaluate: () => void;
  isMinting?: boolean;
}


const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const VerificationResult = ({ data, onReset, onMint, onReevaluate, isMinting }: VerificationResultProps) => {
  const confidencePct = Math.round(data.confidence * 100);
  const impactValue = data.impactScore ?? data.impact_score ?? 0;
  const isAccepted = data.verified;
  const activityLabel = (data.activity || data.detected_class || "unknown").replace(/_/g, " ");
  const objectList = data.objects_detected || [];

  const getProgressColor = (val: number) => {
    if (val > 70) return "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]";
    if (val >= 40) return "bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.6)]";
    return "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]";
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Main status card */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-xl"
      >
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isAccepted
              ? "bg-gradient-to-r from-green-500 via-green-400 to-green-500"
              : "bg-gradient-to-r from-red-500 via-red-400 to-red-500"
          }`}
        />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-2xl font-bold">Verification Results</h2>
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
            >
              {data.status === 'verified' && (
                <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-5 py-2.5 text-sm font-bold text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 className="h-5 w-5" />
                  Successfully Verified
                </span>
              )}
              {data.status === 'suspicious' && (
                <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-2.5 text-sm font-bold text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  <AlertTriangle className="h-5 w-5" />
                  Suspicious Activity Detected
                </span>
              )}
              {data.status === 'rejected' && (
                <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <XCircle className="h-5 w-5" />
                  Verification Rejected
                </span>
              )}
              {!data.status && (isAccepted ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-5 py-2.5 text-sm font-bold text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 className="h-5 w-5" />
                  Successfully Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <XCircle className="h-5 w-5" />
                  Verification Rejected
                </span>
              ))}
            </motion.div>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 mb-6">
            <motion.div
              variants={item}
              className="group rounded-xl border border-border/50 bg-background/50 p-6 hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  <Activity className="h-4 w-4" />
                  Impact Score
                </div>
                <span className={`font-heading text-3xl font-black ${
                    impactValue >= 70 ? "text-green-500" : impactValue >= 40 ? "text-yellow-500" : "text-red-500"
                }`}>
                  {impactValue}/100
                </span>
              </div>
              <div className="h-4 rounded-full bg-secondary/80 overflow-hidden border border-border/50 p-0.5 relative z-10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${impactValue}%` }}
                  transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
                  className={`h-full rounded-full relative ${getProgressColor(impactValue)}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                </motion.div>
              </div>
              
              <div className="mt-5 flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                  Effort Level
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  data.effort?.toLowerCase() === 'high' ? 'bg-orange-500/20 text-orange-600' : 
                  data.effort?.toLowerCase() === 'medium' ? 'bg-blue-500/20 text-blue-600' : 'bg-slate-500/20 text-slate-600'
                }`}>
                  {data.effort || 'Moderate'}
                </span>
              </div>

              <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none">
                 <Cpu className="w-40 h-40" />
              </div>
            </motion.div>

            <motion.div
              variants={item}
              className="group rounded-xl border border-border/50 bg-background/50 p-4 hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]"
            >
              {data.previewUrl ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border/40 shadow-inner group-hover:border-primary/30 transition-colors">
                  <img src={data.previewUrl} className="w-full h-full object-contain" alt="AI Analysis" />
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none" 
                    viewBox="0 0 256 256" 
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {data.detections?.map((det, i) => {
                      const [x1, y1, x2, y2] = det.bbox;
                      return (
                        <motion.g 
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 + (i * 0.2) }}
                        >
                          <rect 
                            x={x1} y={y1} width={x2-x1} height={y2-y1}
                            className="fill-primary/10 stroke-primary stroke-[2]"
                            strokeDasharray="4 2"
                          />
                          <rect 
                            x={x1} y={y1-12} width={50} height={12}
                            className="fill-primary"
                          />
                          <text 
                            x={x1+2} y={y1-3} 
                            className="fill-primary-foreground text-[8px] font-bold uppercase"
                          >
                            {det.label}
                          </text>
                        </motion.g>
                      );
                    })}
                  </svg>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-xs rounded text-[10px] font-bold text-white/90 flex items-center gap-1.5 uppercase tracking-wider">
                     <Brain className="w-3 h-3 text-primary" />
                     Live AI Vision Map
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground tracking-wide uppercase mb-3 relative z-10">
                    <Fingerprint className="h-4 w-4" />
                    Detected Object
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <TreePine className="h-7 w-7" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-heading text-2xl font-bold capitalize leading-none tracking-tight">
                        {activityLabel}
                      </span>
                      <span className="text-sm font-medium text-primary mt-1">
                        Reason: {data.reason || data.detected_class || "N/A"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {data.impact_summary && (
            <motion.div variants={item} className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 overflow-hidden relative">
              <div className="flex items-center gap-3 mb-2.5 relative z-10">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600">
                  <TreePine className="w-4 h-4" />
                </div>
                <span className="font-heading font-bold text-emerald-700 tracking-tight">Environmental Impact Summary</span>
              </div>
              <p className="text-sm font-bold text-emerald-600 leading-relaxed mb-3 relative z-10">
                {data.impact_narrative}
              </p>
              <p className="text-xs font-medium text-emerald-700/80 leading-relaxed max-w-[90%] relative z-10">
                {data.impact_summary}
              </p>
              <div className="absolute -bottom-6 -right-6 opacity-[0.08] pointer-events-none">
                <Activity className="w-32 h-32 text-emerald-500" />
              </div>
            </motion.div>
          )}

          {/* AI Reasoning Bullets */}
          {data.reasoning && data.reasoning.length > 0 && (
            <motion.div variants={item} className="mb-5 rounded-xl border border-border/50 bg-background/50 p-5">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase text-muted-foreground">
                <Brain className="w-4 h-4" />
                AI Impact Reasoning
              </div>
              <ul className="space-y-3">
                {data.reasoning.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-foreground/80 leading-snug">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Actionable Suggestions */}
          {data.suggestions && data.suggestions.length > 0 && (
            <motion.div variants={item} className="mb-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase text-blue-600">
                <Lightbulb className="w-4 h-4" />
                Next Steps for Greater Impact
              </div>
              <ul className="space-y-3">
                {data.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-blue-700 leading-snug">
                    <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <motion.div variants={item} className="mb-5 rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm text-muted-foreground flex items-center justify-between gap-3">
            <span className="font-semibold uppercase tracking-wide text-xs text-muted-foreground">Verification Ledger</span>
            <span className={data.minted ? "text-green-500 font-bold" : "text-yellow-500 font-bold"}>
              {data.minted ? "On-Chain Verified" : "Verification Logged"}
            </span>
          </motion.div>

          {/* Section 1 - What is happening */}
          {data.what_is_happening && (
            <motion.div variants={item} className="mb-5 rounded-xl border border-border/50 bg-background/50 p-5 ai-section">
              <h4 className="flex items-center gap-2 mb-3 text-sm font-bold uppercase text-foreground">
                <Brain className="w-5 h-5 text-primary" />
                What is happening
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {data.what_is_happening}
              </p>
            </motion.div>
          )}

          {/* Section 2 - LLM Narrative */}
          {data.narrative && (
            <motion.div variants={item} className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-5 ai-section">
              <h4 className="flex items-center gap-2 mb-3 text-sm font-bold uppercase text-primary">
                <Brain className="w-5 h-5" />
                AI Analysis
              </h4>
              <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                {data.narrative}
              </p>
            </motion.div>
          )}

          {/* Section 3 - Improvements */}
          {data.improvements && data.improvements.length > 0 && (
            <motion.div variants={item} className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 ai-section">
              <h4 className="flex items-center gap-2 mb-3 text-sm font-bold uppercase text-amber-600">
                <Lightbulb className="w-5 h-5" />
                How to improve your score
              </h4>
              <ul className="space-y-3">
                {data.improvements.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-amber-700/90 leading-snug">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Original Explanation Fallback */}
          {(!data.narrative && data.detailed_explanation) && (
             <motion.div variants={item} className="rounded-xl bg-primary/5 border border-primary/10 p-5 flex items-start gap-4 mb-2">
               <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                 <Cpu className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                    {data.detailed_explanation || data.explanation || "Impact analysis processed successfully."}
                 </p>
                 <div className="flex items-center gap-1.5 mt-3 text-xs font-mono text-muted-foreground/80 opacity-70">
                   <Activity className="w-3.5 h-3.5" />
                   AI Model: Explainable AI
                 </div>
               </div>
            </motion.div>
          )}

        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="rounded-2xl border border-border/50 bg-card/80 p-6 sm:p-8 backdrop-blur-sm shadow-md"
      >
        <div className="flex items-center justify-between mb-5">
           <div className="flex items-center gap-2 text-sm font-bold tracking-wide uppercase text-muted-foreground">
             <Link2 className="h-4 w-4" />
             Decentralized Matrix
           </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-secondary/10 p-5 space-y-4 shadow-inner">
          <p className="text-sm text-foreground/80 font-mono break-all leading-relaxed bg-background/50 p-3 rounded-lg border border-border/40">
            <span className="text-muted-foreground/60 select-none mr-2">SHA-Hash:</span>
            {data.imageHash}
          </p>
          {data.ipfsUri ? (
            <Button
              variant="outline"
              className="w-full border-primary/30 text-primary font-semibold hover:bg-primary/5 hover:border-primary/50 transition-colors h-12"
              asChild
            >
              <a href={data.ipfsUri.startsWith('ipfs://') ? `https://gateway.pinata.cloud/ipfs/${data.ipfsUri.replace('ipfs://', '')}` : data.ipfsUri} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Analyze Proof on Trusted Pinata Network
              </a>
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled
              className="w-full border-border/50 text-muted-foreground font-semibold h-12 cursor-not-allowed"
            >
              <ExternalLink className="mr-2 h-4 w-4 opacity-50" />
              <span className="opacity-70">Awaiting IPFS Anchor...</span>
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Button
          variant="outline"
          size="lg"
          className="w-full h-14 text-[13px] font-bold rounded-2xl border-border/60 bg-card/10 hover:bg-secondary/50 border-dashed"
          onClick={onReevaluate}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Re-evaluate
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full h-14 text-[13px] font-bold rounded-2xl border-border/60 bg-card/50 hover:bg-secondary/50"
          onClick={onReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          New Proof
        </Button>
        <Button
          variant="glow"
          size="lg"
          className="w-full h-14 text-[14px] font-bold tracking-wide rounded-2xl"
          disabled={!isAccepted || isMinting}
          onClick={onMint}
        >
          {isMinting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Minting...
            </>
          ) : (
            <>
              <Coins className="mr-2 h-5 w-5" />
              Mint Credit
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>

  );
};

export default VerificationResult;
