import { useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import StepIndicator, { type VerificationStep } from "@/components/StepIndicator";
import UploadCard, { type UploadMetadata } from "@/components/UploadCard";
import ProcessingAnimation from "@/components/ProcessingAnimation";
import VerificationResult, { type VerificationData } from "@/components/VerificationResult";
import { useWallet } from "@/hooks/use-wallet";

const UploadPage = () => {
  const { refreshWallet } = useWallet();
  const [step, setStep] = useState<VerificationStep>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reevData, setReevData] = useState<{file: File, metadata?: UploadMetadata} | null>(null);

  const handleUpload = async (file: File, metadata?: UploadMetadata) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setStep("processing");
    
    // Create preview URL for vision overlay
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    let resolvedMetadata: UploadMetadata = metadata || {
      description: "Sustainable project verification proof",
      projectType: "Reforestation",
      location: "Satellite Coordinates",
      captureTimestamp: new Date().toISOString(),
      sessionId: `manual-${Date.now()}`
    };

    try {
      const formData = new FormData();
      formData.append("image", file);
      
      formData.append("description", resolvedMetadata.description);
      formData.append("projectType", resolvedMetadata.projectType);
      formData.append("location", resolvedMetadata.location);
      if (resolvedMetadata.captureTimestamp) {
        formData.append("captureTimestamp", resolvedMetadata.captureTimestamp);
      }
      if (resolvedMetadata.sessionId) {
        formData.append("sessionId", resolvedMetadata.sessionId);
      }


      formData.append('isReevaluation', reevData ? 'true' : 'false');

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data: VerificationData = await response.json();
      console.log("API RESPONSE:", data);
      
      setResult(data);
      setStep("verified");

      // Update history
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.email) {
            const dataKey = `data_${user.email}`;
            const existingData = localStorage.getItem(dataKey);
            const userData = existingData ? JSON.parse(existingData) : { credits: 0, uploads: [], history: [] };

            // Ensure arrays exist
            if (!userData.history) userData.history = [];
            if (!userData.uploads) userData.uploads = [];

            userData.history.push({
              imageHash: data.imageHash,
              ipfsUri: data.ipfsUri,
              verified: data.verified,
              confidence: data.confidence,
              timestamp: Date.now()
            });
            userData.uploads.push(Date.now());

            localStorage.setItem(dataKey, JSON.stringify(userData));
          }
        }
      } catch (e) { }

      if (data.finalDecision === "ACCEPT") {
        toast.success("Sustainability proof successfully validated structure!");
      } else {
        toast.error("Project rejected by AI fraud detection.");
      }
      setReevData({ file, metadata: resolvedMetadata });

    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Verification failed: ${message}. Please try again.`);
      setStep("upload");
      if (message.toLowerCase().includes("failed to fetch")) {
        toast.error("Failed to connect to verification server.");
      } else {
        toast.error(message);
      }
      setReevData({ file, metadata: resolvedMetadata });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReevaluate = () => {
    setStep("upload");
    setResult(null);
    setError(null);
    // Keep previewUrl and reevData as they are used to pre-fill
  };

  const handleReset = () => {
    setStep("upload");
    setResult(null);
    setError(null);
    setReevData(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleMint = async () => {
    setIsMinting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      if (result?.imageHash || result?.ipfsUri) {
        const userKey = (() => {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            try { return JSON.parse(userStr).email || "anonymous"; } catch(e) {}
          }
          return "anonymous";
        })();

        const mintResponse = await fetch('http://localhost:5000/api/mint-credit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-key': userKey
          },
          body: JSON.stringify({
            imageHash: result?.imageHash,
            ipfsUri: result?.ipfsUri,
            mintTxId: `0x${crypto.getRandomValues(new Uint8Array(32)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '')}`
          })
        });

        if (!mintResponse.ok) {
          const mintError = await mintResponse.json().catch(() => ({}));
          throw new Error(mintError.error || `Minting endpoint returned ${mintResponse.status}`);
        }
      }

      // Refresh global wallet state
      refreshWallet();
      toast.success("🎉 Carbon Credit Minted Successfully!");
      handleReset();
    } catch (e) { 
      const message = e instanceof Error ? e.message : "Minting operation failed. Please try again.";
      toast.error(`❌ ${message}`);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-bold">Upload Proof</h1>
        <p className="text-muted-foreground mt-1">
          Submit your sustainability activities for AI verification to earn credits
        </p>
      </div>

      <StepIndicator currentStep={step} />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
          >
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Upload Error</p>
              <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <UploadCard 
              onUpload={handleUpload} 
              isLoading={isLoading} 
              initialFile={reevData?.file}
              initialMetadata={reevData?.metadata}
            />
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ProcessingAnimation />
          </motion.div>
        )}

        {step === "verified" && result && (
          <motion.div key="verified" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-2">
            <VerificationResult 
               data={{...result, previewUrl: previewUrl || undefined}} 
               onReset={handleReset}
               onMint={handleMint}
               onReevaluate={handleReevaluate}
               isMinting={isMinting}
            />
          </motion.div>

        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadPage;
