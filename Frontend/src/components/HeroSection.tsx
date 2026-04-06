import { motion } from "framer-motion";
import { ArrowRight, Shield, Leaf, Database } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Shield, title: "AI Verification", desc: "Automated proof validation using advanced AI models" },
  { icon: Database, title: "IPFS Storage", desc: "Immutable, decentralized proof storage on IPFS" },
  { icon: Leaf, title: "Carbon Credits", desc: "Convert verified activities into tradeable carbon credits" },
];

const HeroSection = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log(data);
      setResult(data);

    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        id="fileInput"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleUpload(e.target.files[0]);
          }
        }}
      />

      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="container relative z-10 py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Powered by AI & Blockchain
          </motion.div>

          <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Verify. Store.{" "}
            <span className="text-gradient-primary">Earn Credits.</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            SecureCarbonX uses AI to verify sustainability activities, stores proof on IPFS,
            and converts them into verifiable carbon credits.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* UPDATED BUTTON */}
            <Button
              variant="glow"
              size="lg"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              {loading ? "Processing..." : "Start Verifying"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            <Button variant="outline" size="lg" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </motion.div>

          {/* RESULT DISPLAY */}
          {result && (
            <div className="mt-10 p-6 rounded-xl border border-primary/20 bg-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4">Verification Result</h3>

              <p className="mb-2">
                Status:{" "}
                <span className={result.verified ? "text-green-400" : "text-red-400"}>
                  {result.verified ? "✅ Verified" : "❌ Rejected"}
                </span>
              </p>

              <p className="mb-2">Confidence: {result.confidence}</p>
              <p className="mb-2">Detected: {result.detected_class}</p>

              <a
                href={`https://gateway.pinata.cloud/ipfs/${result.ipfsUri.split("ipfs://")[1]}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                View on IPFS
              </a>
            </div>
          )}
        </motion.div>

        {/* Feature cards */}
        <div id="features" className="mt-32 grid gap-6 sm:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="group rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm hover:border-primary/30 hover:bg-card transition-all duration-300"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;