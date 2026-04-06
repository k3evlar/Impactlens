import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import VerificationResult, { type VerificationData } from "@/components/VerificationResult";
import { Button } from "@/components/ui/button";

const VerifyPage = () => {
  const { imageHash } = useParams<{ imageHash: string }>();
  const [data, setData] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/verify/${imageHash}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Verification record not found");
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load verification");
      } finally {
        setIsLoading(false);
      }
    };

    if (imageHash) {
      fetchVerification();
    }
  }, [imageHash]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading tracking-tight">SecureCarbonX</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Public Verification Node</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Link>
          </Button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Retrieving decentralized proof data...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 flex flex-col items-center text-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive opacity-50" />
            <div>
              <h2 className="text-xl font-bold text-destructive">Record Not Found</h2>
              <p className="text-muted-foreground mt-2 max-w-md">
                The verification hash <code className="bg-destructive/10 px-1.5 py-0.5 rounded text-xs text-destructive">{imageHash}</code> could not be found on our network.
              </p>
            </div>
            <Button variant="outline" asChild className="mt-4">
              <Link to="/upload">Upload New Proof</Link>
            </Button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="bg-secondary/10 border border-border/40 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verification Hash</p>
                <p className="text-sm font-mono mt-1 break-all text-primary/80">{imageHash}</p>
            </div>
            
            <VerificationResult 
              data={data} 
              onReset={() => {}} 
              onMint={() => {}} 
              isMinting={false}
            />
            
            <footer className="pt-10 text-center border-t border-border/40">
                <p className="text-sm text-muted-foreground">
                    SecureCarbonX Phase 2 - Powered by YOLO Extraction & Decentralized Ledgers
                </p>
            </footer>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default VerifyPage;
