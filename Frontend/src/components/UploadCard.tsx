import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, Loader2, X, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface UploadMetadata {
  description: string;
  projectType?: string;
  location?: string;
  captureTimestamp?: string;
  sessionId?: string;
}

interface UploadCardProps {
  onUpload: (file: File, metadata?: UploadMetadata) => void;
  isLoading: boolean;
  initialFile?: File;
  initialMetadata?: UploadMetadata;
}

const UploadCard = ({ onUpload, isLoading, initialFile, initialMetadata }: UploadCardProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [selectedMetadata, setSelectedMetadata] = useState<UploadMetadata | undefined>(undefined);

  useEffect(() => {
    if (initialFile) {
      setSelectedFile(initialFile);
      setSelectedMetadata(initialMetadata);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(initialFile);
    }
  }, [initialFile, initialMetadata]);

  const handleFile = useCallback((file: File, metadata?: UploadMetadata) => {
    setSelectedFile(file);
    setSelectedMetadata(metadata);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) handleFile(file);
    },
    [handleFile]
  );

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile, {
        ...(selectedMetadata || {}),
        description: description || selectedMetadata?.description || "",
      });
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setSelectedFile(null);
    setSelectedMetadata(undefined);
  };

  const createSampleFile = (
    fileName: string,
    draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
    metadata: UploadMetadata,
    width = 256,
    height = 256
  ) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    draw(ctx, width, height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], fileName, { type: "image/jpeg" });
        handleFile(file, metadata);
      }
    }, "image/jpeg");
  };

  const handleRealSample = () => {
    const timestampLabel = new Date().toISOString().slice(11, 19);

    const metadata: UploadMetadata = {
      description: "Verified reforestation activity with on-ground planting evidence and field documentation",
      projectType: "Reforestation",
      location: "Pune",
      captureTimestamp: new Date().toISOString(),
      sessionId: `real-${Date.now()}`
    };

    createSampleFile(
      "real-sample-reforestation.jpg",
      (ctx, width, height) => {
        // Sky
        const sky = ctx.createLinearGradient(0, 0, 0, height * 0.55);
        sky.addColorStop(0, "#87CEEB");
        sky.addColorStop(1, "#dff4ff");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height);

        // Ground
        ctx.fillStyle = "#6b4f2a";
        ctx.fillRect(0, height * 0.6, width, height * 0.4);

        // Sun
        ctx.fillStyle = "#ffd54f";
        ctx.beginPath();
        ctx.arc(width * 0.82, height * 0.18, 20, 0, Math.PI * 2);
        ctx.fill();

        // Tree trunk
        ctx.fillStyle = "#5d4037";
        ctx.fillRect(width * 0.47, height * 0.42, 18, 56);

        // Leaves
        ctx.fillStyle = "#2e7d32";
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.38, 34, 0, Math.PI * 2);
        ctx.arc(width * 0.42, height * 0.44, 24, 0, Math.PI * 2);
        ctx.arc(width * 0.58, height * 0.44, 24, 0, Math.PI * 2);
        ctx.fill();

        // Soil mound / sapling base
        ctx.fillStyle = "#8d6e63";
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.62, 16, 0, Math.PI * 2);
        ctx.fill();

        // Small volunteers / planting silhouettes
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(width * 0.18, height * 0.48, 8, 24);
        ctx.fillRect(width * 0.73, height * 0.5, 8, 20);

        // Timestamp-like overlay to keep each sample unique
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillRect(10, 10, 112, 22);
        ctx.fillStyle = "#111827";
        ctx.font = "12px monospace";
        ctx.fillText(timestampLabel, 16, 25);
      },
      metadata
    );
  };

  const handleFakeSample = () => {
    const metadata: UploadMetadata = {
      description: "screenshot",
      projectType: "Other",
      location: "Unknown",
      captureTimestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      sessionId: `fake-${Date.now()}`
    };

    createSampleFile(
      "fake-sample-fraud.jpg",
      (ctx, width, height) => {
        ctx.fillStyle = "#6b7280";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#111827";
        ctx.fillRect(28, 36, width - 56, height - 72);

        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(44, 52, width - 88, 28);
        ctx.fillRect(44, 92, width - 120, 18);
        ctx.fillRect(44, 122, width - 100, 18);

        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(58, 58);
        ctx.lineTo(width - 58, height - 58);
        ctx.moveTo(width - 58, 58);
        ctx.lineTo(58, height - 58);
        ctx.stroke();
      },
      metadata
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-2xl border border-border/50 bg-card/80 p-8 shadow-sm backdrop-blur-sm"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
           <h2 className="font-heading text-xl font-semibold mb-1">Upload Proof</h2>
           <p className="text-sm text-muted-foreground">
             Upload an image of your sustainability activity for AI extraction
           </p>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-300 cursor-pointer min-h-[220px]",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border/60 hover:border-primary/40 hover:bg-secondary/20"
        )}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center w-full"
            >
               <div className="relative group">
                 <img
                   src={preview}
                   alt="Selection Preview"
                   className="h-44 w-auto max-w-full rounded-xl object-contain border border-border/60 shadow-sm"
                 />
                 <button 
                   onClick={removeFile}
                   className="absolute -top-3 -right-3 bg-background border border-border/50 shadow-md text-muted-foreground hover:text-destructive hover:border-destructive/30 rounded-full p-1.5 transition-colors"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
              <p className="text-sm text-muted-foreground mt-4 font-mono truncate max-w-[90%] bg-secondary/50 px-3 py-1 rounded-md">{selectedFile?.name}</p>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50 border border-border/40 text-muted-foreground shadow-inner">
                <ImageIcon className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="text-base font-medium">Drag & drop your image here</p>
                <p className="text-sm text-muted-foreground mt-1.5">or click to browse local files</p>
                <p className="text-xs text-muted-foreground/60 mt-3 uppercase tracking-wider font-semibold">PNG, JPG up to 10MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground ml-1">
              <FlaskConical className="w-3 h-3 text-primary" />
              Activity Context (Optional)
            </div>
            <textarea
              placeholder="Tell the AI what you're doing in this photo... (e.g. I am planting a sapling at the park)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] bg-secondary/30 rounded-xl border border-border/40 p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50 resize-none translate-y-0"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6">
        <Button
          variant="outline"
          className="w-full sm:col-span-1 h-12"
          onClick={(e) => {
             e.preventDefault();
             handleRealSample();
          }}
          disabled={isLoading}
        >
          <FlaskConical className="mr-2 w-4 h-4" />
          Real Sample
        </Button>
        <Button
          variant="outline"
          className="w-full sm:col-span-1 h-12"
          onClick={(e) => {
             e.preventDefault();
             handleFakeSample();
          }}
          disabled={isLoading}
        >
          <FlaskConical className="mr-2 w-4 h-4" />
          Fake Sample
        </Button>
        <Button
          variant="glow"
          className="w-full sm:col-span-2 h-12 font-bold text-base tracking-wide"
          disabled={!selectedFile || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Image...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Upload and Verify Proof
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default UploadCard;
