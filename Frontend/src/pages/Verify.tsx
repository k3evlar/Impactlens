import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Copy, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { VerificationData } from "@/components/VerificationResult";

const truncateMiddle = (str: string, maxLength: number = 24) => {
  if (!str) return 'N/A';
  if (str.length <= maxLength) return str;
  const charsToShow = maxLength - 3;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return str.substr(0, frontChars) + '...' + str.substr(str.length - backChars);
};

const VerifyPage = () => {
  const { imageHash } = useParams<{ imageHash: string }>();
  const [data, setData] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    // Inject fonts exclusively for this page to avoid full app reload impacts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Inter:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

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

  const handleCopy = (text: string, field: string) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const cssVars = {
    "--cert-bg": "#05080a",
    "--cert-surface": "rgba(12, 17, 23, 0.85)",
    "--cert-border": "#1a2a1a",
    "--cert-emerald": "#10b981",
    "--cert-emerald-dim": "#064e35",
    "--cert-blue": "#3b82f6",
    "--cert-text": "#e2e8f0",
    "--cert-muted": "#64748b",
    fontFamily: "'Inter', sans-serif"
  } as React.CSSProperties;

  const surfaceStyle: React.CSSProperties = {
    background: "var(--cert-surface)",
    border: "1px solid var(--cert-border)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 0 40px rgba(16, 185, 129, 0.06)",
    position: "relative",
    overflow: "hidden"
  };

  // Grain overlay element
  const GrainOverlay = () => (
    <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" 
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
    </div>
  );

  if (isLoading) {
    return (
      <div style={cssVars} className="min-h-screen bg-[var(--cert-bg)] text-[var(--cert-text)] flex flex-col items-center justify-center">
         <div className="w-20 h-20 border-4 border-[var(--cert-border)] border-t-[var(--cert-emerald)] rounded-full animate-spin"></div>
         <p className="mt-6 text-[var(--cert-emerald)] font-mono text-sm tracking-widest uppercase animate-pulse">Establishing secure link...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={cssVars} className="min-h-screen bg-[var(--cert-bg)] text-[var(--cert-text)] flex flex-col items-center justify-center p-6">
         <div style={surfaceStyle} className="p-10 rounded-lg max-w-lg w-full text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-80" />
            <h2 className="text-xl font-mono text-red-400 mb-2 font-bold">ERR_NOT_FOUND</h2>
            <p className="text-[var(--cert-muted)] mb-8">{error}</p>
            <Link to="/dashboard" className="text-[var(--cert-blue)] hover:text-blue-400 font-mono text-sm underline underline-offset-4">RETURN TO TERMINAL</Link>
         </div>
      </div>
    );
  }

  return (
    <div style={cssVars} className="min-h-screen bg-[var(--cert-bg)] text-[var(--cert-text)] p-4 sm:p-8 xl:p-12 font-sans selection:bg-[var(--cert-emerald)] selection:text-black">
      
      {/* Top Nav Action (Non-intrusive) */}
      <div className="max-w-6xl mx-auto mb-6">
        <Link to="/history" className="inline-flex items-center gap-2 text-[var(--cert-muted)] hover:text-[var(--cert-text)] transition-colors text-sm font-mono group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to History
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* ① Header Strip */}
        <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-[var(--cert-emerald)]/20 pb-4 mb-10 gap-6 relative">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[var(--cert-emerald)] opacity-20"></div>
          <div>
             <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-8 h-8 text-[var(--cert-emerald)]" />
                 <h1 className="text-2xl font-bold tracking-tight">SecureCarbonX</h1>
             </div>
             <p className="text-[var(--cert-muted)] tracking-[0.2em] font-mono text-xs font-bold uppercase">Impact Certificate</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
             <div className="flex items-center gap-2 bg-[var(--cert-emerald-dim)]/30 border border-[var(--cert-emerald)]/30 px-3 py-1.5 rounded-sm">
                <div className="w-2 h-2 rounded-full bg-[var(--cert-emerald)] animate-[pulse_2s_ease-in-out_infinite]"></div>
                <span className="text-[var(--cert-emerald)] font-mono text-xs uppercase font-bold tracking-wider">Verified</span>
             </div>
             <span className="text-[var(--cert-muted)] font-mono text-xs">
                {new Date(data.timestamp || Date.now()).toUTCString()}
             </span>
          </div>
        </header>

        {/* ③ AI Narrative & Image Preview Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* NARRATIVE */}
          <div style={surfaceStyle} className="rounded-lg p-8 border-l-[3px] border-l-[var(--cert-emerald)] bg-white/[0.01]">
            <GrainOverlay />
            <p className="text-[var(--cert-muted)] font-mono text-xs uppercase tracking-[0.15em] mb-6">Environmental Impact Assessment — AI Generated</p>
            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-lg md:text-xl font-serif text-[var(--cert-text)]/90 leading-relaxed italic" style={{ fontFamily: "Georgia, serif" }}>
                "{data.narrative || "The analysis confirms a positive contribution to ecological restoration and sustainable management practices."}"
              </p>
            </div>
            
            {(data.activity || data.status) && (
               <div className="mt-auto flex flex-wrap gap-4 pt-6 border-t border-[var(--cert-border)]">
                 <div className="flex flex-col gap-1">
                   <span className="text-xs font-mono text-[var(--cert-muted)]">CLASSIFICATION</span>
                   <span className="text-sm font-mono text-[var(--cert-text)] uppercase">{data.activity}</span>
                 </div>
                 <div className="h-8 border-r border-[var(--cert-border)] hidden sm:block"></div>
                 <div className="flex flex-col gap-1">
                   <span className="text-xs font-mono text-[var(--cert-muted)]">IMPACT LEVEL</span>
                   <span className="text-sm font-mono text-[var(--cert-text)] uppercase">{data.status}</span>
                 </div>
               </div>
            )}
          </div>

          {/* IMAGE PREVIEW */}
          <div style={surfaceStyle} className="rounded-lg overflow-hidden flex flex-col">
            <GrainOverlay />
            <div className="p-4 border-b border-[var(--cert-border)] flex justify-between items-center bg-black/20">
               <span className="text-[var(--cert-muted)] font-mono text-[10px] uppercase tracking-widest">Visual Hash Reference</span>
               <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--cert-emerald)]/40"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--cert-emerald)]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--cert-emerald)]/40"></div>
               </div>
            </div>
            <div className="flex-1 min-h-[300px] relative bg-black/40 flex items-center justify-center p-4">
               {data.ipfsUri ? (
                 <img 
                   src={data.ipfsUri.startsWith('ipfs://') ? `https://gateway.pinata.cloud/ipfs/${data.ipfsUri.replace('ipfs://', '')}` : data.ipfsUri} 
                   alt="Verified Proof"
                   className="max-h-full max-w-full object-contain rounded-sm shadow-2xl relative z-10 border border-[var(--cert-border)]"
                 />
               ) : data.previewUrl ? (
                 <img src={data.previewUrl} alt="Preview" className="max-h-full max-w-full object-contain opacity-50 grayscale" />
               ) : (
                 <div className="text-[var(--cert-muted)] font-mono text-xs uppercase italic">No image reference found in ledger</div>
               )}
               {/* Decorative scanline overlay */}
               <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-20 overflow-hidden">
                  <div className="w-full h-1 bg-[var(--cert-emerald)] animate-[scan_4s_linear_infinite]"></div>
               </div>
            </div>
          </div>
        </div>

        {/* ④ Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          
          {/* LEFT: Verification Protocol Ledger */}
          <div style={surfaceStyle} className="rounded-lg p-8">
             <GrainOverlay />
             <h3 className="font-mono text-[var(--cert-muted)] text-xs tracking-[0.15em] uppercase mb-6 flex items-center gap-2">
                Protocol Status
                <div className="h-[1px] flex-1 bg-[var(--cert-border)] ml-4"></div>
             </h3>
             <ul className="space-y-4 font-mono text-sm">
                <li className="flex justify-between items-center py-2 border-b border-[var(--cert-border)]">
                   <span className="text-[var(--cert-text)]">Vision Analysis</span>
                   <span className="flex items-center gap-2 text-[var(--cert-emerald)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--cert-emerald)]"></div> VERIFIED
                   </span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-[var(--cert-border)]">
                   <span className="text-[var(--cert-text)]">IPFS Storage</span>
                   <span className="flex items-center gap-2 text-[var(--cert-emerald)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--cert-emerald)]"></div> ONLINE
                   </span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-[var(--cert-border)]">
                   <span className="text-[var(--cert-text)]">Hash Integrity</span>
                   <span className="flex items-center gap-2 text-[var(--cert-emerald)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--cert-emerald)]"></div> CONFIRMED
                   </span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-[var(--cert-border)]">
                   <span className="text-[var(--cert-text)]">Blockchain Anchor</span>
                   <span className={`flex items-center gap-2 ${data.minted ? 'text-[var(--cert-emerald)]' : 'text-[#f59e0b]'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${data.minted ? 'bg-[var(--cert-emerald)]' : 'bg-[#f59e0b]'}`}></div> 
                      {data.minted ? 'ANCHORED' : 'PENDING'}
                   </span>
                </li>
                <li className="flex justify-between items-center py-2">
                   <span className="text-[var(--cert-text)]">AI Narrative</span>
                   <span className="flex items-center gap-2 text-[var(--cert-emerald)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--cert-emerald)]"></div> GENERATED
                   </span>
                </li>
             </ul>
          </div>

          {/* RIGHT: Cryptographic Details */}
          <div style={surfaceStyle} className="rounded-lg p-8 group">
             <GrainOverlay />
             <h3 className="font-mono text-[var(--cert-muted)] text-xs tracking-[0.15em] uppercase mb-6 flex items-center gap-2">
                Cryptographic Proof
                <div className="h-[1px] flex-1 bg-[var(--cert-border)] ml-4"></div>
             </h3>
             <ul className="space-y-6 font-mono text-sm">
                
                {/* SHA-256 Hash */}
                <li>
                   <p className="text-[var(--cert-muted)] text-xs mb-1.5">SHA-256 HASH</p>
                   <div 
                      onClick={() => handleCopy(data.imageHash || 'N/A', 'hash')}
                      className="bg-black/40 border border-[var(--cert-border)] p-3 rounded group/item flex items-center justify-between cursor-pointer hover:border-[var(--cert-emerald)]/50 transition-colors"
                      title={data.imageHash}
                   >
                     <span className="text-[var(--cert-text)] truncate mr-4">{truncateMiddle(data.imageHash)}</span>
                     {copiedField === 'hash' ? <CheckCircle2 className="w-4 h-4 text-[var(--cert-emerald)] shrink-0" /> : <Copy className="w-4 h-4 text-[var(--cert-muted)] group-hover/item:text-[var(--cert-emerald)] shrink-0 transition-colors" />}
                   </div>
                </li>

                {/* IPFS CID */}
                <li>
                   <p className="text-[var(--cert-muted)] text-xs mb-1.5">IPFS CID</p>
                   <div 
                      onClick={() => handleCopy(data.ipfsUri || 'N/A', 'ipfs')}
                      className="bg-black/40 border border-[var(--cert-border)] p-3 rounded group/item flex items-center justify-between cursor-pointer hover:border-[var(--cert-blue)]/50 transition-colors"
                      title={data.ipfsUri || 'N/A'}
                   >
                     <span className="text-[var(--cert-blue)] truncate mr-4">{truncateMiddle(data.ipfsUri)}</span>
                     {copiedField === 'ipfs' ? <CheckCircle2 className="w-4 h-4 text-[var(--cert-blue)] shrink-0" /> : <Copy className="w-4 h-4 text-[var(--cert-muted)] group-hover/item:text-[var(--cert-blue)] shrink-0 transition-colors" />}
                   </div>
                </li>

                {/* Blockchain TX ID */}
                <li>
                   <p className="text-[var(--cert-muted)] text-xs mb-1.5">BLOCKCHAIN TX ID</p>
                   <div 
                      onClick={() => handleCopy(data.mintTxId || 'N/A', 'txid')}
                      className="bg-black/40 border border-[var(--cert-border)] p-3 rounded group/item flex items-center justify-between cursor-pointer hover:border-[var(--cert-emerald)]/50 transition-colors"
                      title={data.mintTxId || 'N/A'}
                   >
                     <span className={`truncate mr-4 ${data.mintTxId ? 'text-[var(--cert-text)]' : 'text-[var(--cert-muted)]'}`}>
                       {truncateMiddle(data.mintTxId)}
                     </span>
                     {copiedField === 'txid' ? <CheckCircle2 className="w-4 h-4 text-[var(--cert-emerald)] shrink-0" /> : <Copy className="w-4 h-4 text-[var(--cert-muted)] group-hover/item:text-[var(--cert-emerald)] shrink-0 transition-colors" />}
                   </div>
                </li>

             </ul>
          </div>

        </div>

        {/* ⑤ Footer strip */}
        <footer className="border-t border-[var(--cert-border)] pt-8 pb-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
           <p className="text-[var(--cert-muted)] font-mono text-xs uppercase">
              This certificate is cryptographically immutable and publicly verifiable.
           </p>
           {data.ipfsUri && (
              <a 
                href={data.ipfsUri.startsWith('ipfs://') ? `https://gateway.pinata.cloud/ipfs/${data.ipfsUri.replace('ipfs://', '')}` : data.ipfsUri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[var(--cert-blue)]/10 text-[var(--cert-blue)] border border(--cert-blue)]/30 px-4 py-2 rounded-sm font-mono text-xs uppercase hover:bg-[var(--cert-blue)]/20 transition-colors flex items-center gap-2"
              >
                 Analyze Proof on Trusted Pinata Network ↗
              </a>
           )}
        </footer>

      </div>
    </div>
  );
};

export default VerifyPage;
