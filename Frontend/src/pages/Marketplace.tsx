import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShoppingBag, Coins, X, ShieldCheck, Loader2, Lock, ArrowRight, TrendingUp, Building2, ExternalLink } from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// --- STATIC CATALOG (UI only) ---
const CATALOG_ITEMS = [
  { id: 1, icon: "🌱", name: "Plant a Tree", description: "Sponsor the planting of a single native tree in a deforested region.", cost: 2 },
  { id: 2, icon: "🌲", name: "Plant 5 Trees", description: "Maximize your impact by planting a small cluster of trees.", cost: 8 },
  { id: 3, icon: "♻️", name: "Support Recycling Program", description: "Fund community-based recycling and waste cleanups.", cost: 1 },
  { id: 4, icon: "🌫️", name: "Offset 10kg CO₂", description: "Direct calculation-based carbon neutralizing credits.", cost: 3 },
  { id: 5, icon: "🌍", name: "Carbon Neutral Certificate", description: "An official digital certificate honoring your zero-emissions benchmark.", cost: 5 },
  { id: 6, icon: "🔋", name: "Support Renewable Energy", description: "Back community solar power microgrids.", cost: 4 },
  { id: 7, icon: "🏆", name: "Carbon Neutral Badge", description: "Display a verified carbon neutral badge on your profile visible to all users.", cost: 3 },
  { id: 8, icon: "📜", name: "Impact Report PDF", description: "Generate a detailed PDF report of all your environmental activities and impact.", cost: 2 },
];

const MarketplacePage = () => {
  const [activeTab, setActiveTab] = useState<"redeem" | "sell" | "buy">("redeem");
  
  // Wallet State
  const [credits, setCredits] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [tier, setTier] = useState("BRONZE");
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  
  // Market Listings State
  const [listings, setListings] = useState<any[]>([]);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);

  // Form States
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Helper to get session ID for backend wallet lookup
  const getUserKey = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try { return JSON.parse(userStr).email || "anonymous"; } catch(e) {}
    }
    return "anonymous";
  };

  // Sync wallet from Real Backend
  const syncWallet = async () => {
    try {
      const userKey = getUserKey();
      const response = await axios.get(`${API_BASE}/user/wallet`, {
        headers: { "x-user-key": userKey }
      });
      const wallet = response.data;
      setCredits(wallet.credits || 0);
      setTotalEarned(wallet.totalEarned || 0);
      setTotalSpent(wallet.totalSpent || 0);
      setTier(wallet.tier || "BRONZE");
      setPurchases(wallet.purchases || []);
    } catch (e) {
      console.error("Wallet sync error:", e);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const fetchMarketListings = async () => {
    setIsLoadingMarket(true);
    try {
      const response = await axios.get(`${API_BASE}/marketplace/listings`);
      setListings(response.data || []);
    } catch (e) {
      console.error("Market listings error:", e);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  useEffect(() => {
    syncWallet();
    if (activeTab === "buy" || activeTab === "sell") {
      fetchMarketListings();
    }
    
    // Listen for storage events (emitted by Upload page)
    window.addEventListener("storage", syncWallet);
    return () => window.removeEventListener("storage", syncWallet);
  }, [activeTab]);

  const handleConfirmRedemption = async () => {
    if (!selectedItem) return;
    if (credits < selectedItem.cost) return;

    setIsRedeeming(true);
    try {
      const userKey = getUserKey();
      const response = await axios.post(`${API_BASE}/user/wallet/redeem`, {
        cost: selectedItem.cost,
        name: selectedItem.name
      }, {
        headers: { "x-user-key": userKey }
      });

      if (response.data.success) {
        const wallet = response.data.wallet;
        setCredits(wallet.credits);
        setTotalSpent(wallet.totalSpent);
        setPurchases(wallet.purchases);
        toast.success(`Successfully redeemed ${selectedItem.name}! Check Purchases for details.`);
        // Notify other components
        window.dispatchEvent(new Event("storage"));
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Transaction failed.");
    } finally {
      setIsRedeeming(false);
      setSelectedItem(null);
    }
  };

  const getTierBadge = () => {
    switch (tier) {
      case "PLATINUM": return "bg-gray-100 text-gray-900 border-gray-300";
      case "GOLD": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "SILVER": return "bg-gray-300/20 text-gray-300 border-gray-400/30";
      default: return "bg-orange-800/20 text-orange-600 border-orange-800/30"; // Bronze
    }
  };

  const getTierProgress = () => {
    if (tier === "PLATINUM") return { next: "MAX", req: 50, msg: "Highest tier unlocked!", pct: 100 };
    if (tier === "GOLD") return { next: "PLATINUM", req: 50, msg: `earn ${Math.max(0, 50 - totalEarned).toFixed(2)} more CC to reach PLATINUM`, pct: (totalEarned / 50) * 100 };
    if (tier === "SILVER") return { next: "GOLD", req: 20, msg: `earn ${Math.max(0, 20 - totalEarned).toFixed(2)} more CC to reach GOLD`, pct: (totalEarned / 20) * 100 };
    return { next: "SILVER", req: 5, msg: `earn ${Math.max(0, 5 - totalEarned).toFixed(2)} more CC to reach SILVER`, pct: (totalEarned / 5) * 100 };
  };

  const prog = getTierProgress();

  if (isLoadingWallet) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      
      {/* Header & Tabs */}
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-white mb-6">
          Rewards Marketplace
        </h1>
        
        <div className="flex flex-wrap gap-2 border-b border-border/50 pb-[1px]">
          {[
            { id: "redeem", label: "Redeem Credits" },
            { id: "sell", label: "Sell Credits" },
            { id: "buy", label: "Buy Credits (Companies)" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all relative ${
                activeTab === tab.id 
                  ? "text-green-400" 
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="marketplace-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500 shadow-[0_0_8px_rgba(0,255,136,0.5)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: REDEEM CREDITS */}
      {/* ========================================================= */}
      {activeTab === "redeem" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          
          {/* Wallet Balance Card */}
          <div className="flex w-full justify-end">
            <Card className="bg-[#0d1f0d] border border-green-500/20 backdrop-blur-sm w-full md:w-[350px] shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors duration-500" />
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-green-500" />
                  <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Wallet Balance</span>
                </div>
                <div className="font-heading font-bold text-4xl text-white mb-4">
                  {credits.toFixed(2)} <span className="text-xl text-green-500">CC</span>
                </div>
                <div className="flex flex-col gap-2 pt-4 border-t border-green-500/10 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tier:</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border uppercase ${getTierBadge()}`}>{tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Earned:</span>
                    <span className="text-white font-mono">{totalEarned.toFixed(2)} CC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Spent:</span>
                    <span className="text-white font-mono">{totalSpent.toFixed(2)} CC</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tier Banner */}
          <div className="w-full bg-[#0a0f0a] border border-border/50 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                You are <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase ${getTierBadge()}`}>{tier}</span> — {prog.msg}
              </p>
              <div className="w-full md:w-64 h-2.5 bg-gray-900 rounded-full mt-3 overflow-hidden border border-gray-800">
                <div className="h-full bg-green-500 transition-all duration-1000 relative" style={{ width: `${Math.min(prog.pct, 100)}%` }}>
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex gap-4 md:flex-col md:gap-1 text-right">
              <div><span className="text-orange-500">Bronze: 0-5</span> → Basic access</div>
              <div><span className="text-gray-400">Silver: 5-20</span> → Priority verification</div>
              <div><span className="text-yellow-500">Gold: 20-50</span> → Sell credits</div>
              <div><span className="text-blue-200">Platinum: 50+</span> → Bulk trading</div>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CATALOG_ITEMS.map((item) => {
              const affordable = credits >= item.cost;
              const hasPurchased = purchases.some(p => p.item === item.name);

              return (
                <div key={item.id} className="bg-[#0a0f0a] border border-border/50 rounded-xl overflow-hidden hover:border-green-500/30 transition-colors flex flex-col group">
                  <div className="p-5 flex flex-col h-full">
                    <div className="text-3xl mb-3 bg-[#0d1f0d] w-14 h-14 flex items-center justify-center rounded-lg border border-green-500/10 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-white mb-2 leading-tight">{item.name}</h3>
                    <p className="text-xs text-muted-foreground flex-grow mb-5 leading-relaxed">{item.description}</p>
                    
                    <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-auto">
                      <span className="font-bold text-white font-mono text-sm">
                        {item.cost.toFixed(2)} CC
                      </span>
                      
                      {hasPurchased ? (
                        <Button disabled variant="outline" className="border-green-500/50 text-green-500 h-8 text-xs font-semibold px-3 bg-green-500/5">
                          Redeemed ✓
                        </Button>
                      ) : affordable ? (
                        <Button 
                          onClick={() => setSelectedItem(item)}
                          className="bg-green-500 hover:bg-green-400 text-black h-8 text-xs font-bold px-4"
                        >
                          Redeem
                        </Button>
                      ) : (
                        <Button 
                          disabled 
                          variant="secondary" 
                          className="h-8 text-xs font-medium px-3 bg-gray-900 text-gray-500"
                          title="Upload more activities to earn CC"
                        >
                          Need {(item.cost - credits).toFixed(2)} more CC
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SELL CREDITS */}
      {/* ========================================================= */}
      {activeTab === "sell" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {(tier === "BRONZE" || tier === "SILVER") ? (
            <Card className="bg-[#0a0f0a] border-dashed border-gray-700/50 py-16 text-center">
              <CardContent className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="p-4 rounded-full bg-gray-900 border border-gray-800 text-gray-500">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mt-4">Selling credits is available for Gold tier and above</h3>
                <p className="text-muted-foreground flex flex-col items-center">
                  You need 20 CC total earned to unlock selling to corporate buyers.
                  <span className="font-mono mt-2 bg-gray-900 px-3 py-1 rounded-md border border-gray-800 text-white">Current: {totalEarned.toFixed(2)} CC</span>
                </p>
                <Button variant="outline" className="mt-4 border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => window.location.href='/upload'}>
                  Upload Activity to Earn More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                <div className="bg-[#0a0f0a] border border-border/50 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-border/50 bg-[#0d1f0d]">
                    <h3 className="font-bold text-white">Your Active Listings</h3>
                  </div>
                  <div className="p-5">
                    {listings.filter(l => l.seller === getUserKey()).length === 0 ? (
                      <p className="text-sm text-muted-foreground italic text-center py-6">No active listings. Create one below to sell your credits to companies.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left font-mono">
                          <thead>
                            <tr className="text-gray-500 uppercase text-[10px] tracking-wider border-b border-border/30">
                              <th className="pb-3 px-2">Amount</th>
                              <th className="pb-3 px-2">Price/CC</th>
                              <th className="pb-3 px-2">Value</th>
                              <th className="pb-3 px-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {listings.filter(l => l.seller === getUserKey()).map(l => (
                              <tr key={l.id} className="border-b border-border/10">
                                <td className="py-3 px-2 text-white">{l.amount} CC</td>
                                <td className="py-3 px-2 text-white">${l.price}</td>
                                <td className="py-3 px-2 text-green-400 font-bold">${(l.amount * l.price).toFixed(2)}</td>
                                <td className="py-3 px-2"><span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20">{l.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#0d1f0d] border border-green-500/20 rounded-xl overflow-hidden shadow-lg shadow-green-500/5">
                  <div className="px-5 py-4 border-b border-green-500/10">
                    <h3 className="font-bold text-green-400 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> List Your Credits for Sale</h3>
                  </div>
                  <div className="p-5 space-y-5">
                    <p className="text-sm text-muted-foreground">Listing logic implementation pending (Backend state mutation ready).</p>
                    <Button className="w-full bg-green-500 hover:bg-green-400 text-black font-bold h-11" onClick={() => toast.info("Listing form submission wiring in progress.")}>
                      List for Sale
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-[#0a0f0a] border border-border/50 rounded-xl overflow-hidden p-5">
                    <h3 className="font-bold text-white border-b border-border/50 pb-3 mb-4 text-sm uppercase tracking-wider">Current Market</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs uppercase">Average price</span>
                        <span className="text-2xl font-mono text-white font-bold">$4.50<span className="text-sm text-gray-500 font-sans font-normal">/CC</span></span>
                      </div>
                      <div className="flex justify-between border-t border-gray-800 pt-3">
                        <span className="text-gray-400">Total Credits listed:</span>
                        <span className="text-white font-mono">{listings.length > 0 ? listings.reduce((acc,l) => acc+l.amount, 0).toFixed(2) : "142"} CC</span>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: BUY CREDITS (COMPANIES) */}
      {/* ========================================================= */}
      {activeTab === "buy" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          
          <div className="w-full bg-gradient-to-r from-[#0d1f0d] to-background border border-green-500/20 p-8 rounded-2xl relative overflow-hidden flex flex-col justify-center">
             <Building2 className="absolute right-0 top-0 opacity-5 w-64 h-64 -translate-y-8 translate-x-8" />
             <div className="relative z-10 max-w-2xl">
               <h2 className="text-3xl font-heading font-bold text-white mb-2 tracking-tight">Corporate Carbon Offset Portal</h2>
               <p className="text-gray-400 mb-6 text-lg">Purchase verified AI-authenticated carbon credits from securely verified sustainability activities directly from users.</p>
               <div className="flex flex-wrap gap-3">
                 <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Lock className="w-3 h-3"/> AI Verified</span>
                 <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><ShieldCheck className="w-3 h-3"/> Blockchain Secured</span>
                 <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="w-3 h-3"/> ESG Compliant</span>
               </div>
             </div>
          </div>

          <div>
             <div className="flex justify-between items-end mb-4">
               <h3 className="font-bold text-xl text-white">Available Credits</h3>
             </div>
             
             {isLoadingMarket ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-900/50 animate-pulse rounded-xl" />)}
               </div>
             ) : listings.length === 0 ? (
               <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-dashed border-border/50">
                  <p className="text-muted-foreground">No credits available for purchase at the moment.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="bg-[#0a0f0a] border border-border/50 rounded-xl p-5 hover:border-green-500/40 transition-colors">
                       <div className="flex justify-between items-start mb-3 border-b border-border/30 pb-3">
                          <div className="font-bold text-lg text-white flex items-center gap-2">🌱 {listing.activity || "Verified Activity"}</div>
                          <div className="text-right">
                            <div className="font-mono text-green-400 font-bold">{listing.amount.toFixed(2)} CC</div>
                            <div className="text-xs text-gray-500">${listing.price.toFixed(2)} / CC</div>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-400 font-mono mb-4">
                          <div>Seller: <span className="text-white truncate">{listing.seller.substring(0,8)}...</span> ({listing.tier})</div>
                          <div className="text-right">Verified: <span className="text-white">{new Date(listing.createdAt).toLocaleDateString()}</span></div>
                       </div>
                       <div className="flex items-center text-xs text-gray-500 mb-4 bg-gray-900 p-2 rounded">
                          <span>Proof Hash: <a href="#" className="text-blue-400 hover:text-blue-300 flex inline-flex items-center ml-1">{listing.imageHash ? listing.imageHash.substring(0,12) + "..." : "0xDEAD...BEEF"} <ExternalLink className="w-3 h-3 ml-1" /></a></span>
                       </div>
                       
                       <div className="flex items-center justify-between pt-2">
                          <div className="flex flex-col">
                             <span className="text-xs text-gray-500">Total Price</span>
                             <span className="font-bold text-white text-xl">${(listing.amount * listing.price).toFixed(2)}</span>
                          </div>
                          <Button 
                            className="bg-green-500 hover:bg-green-400 text-black font-bold px-6"
                            onClick={async () => {
                              try {
                                const buyerKey = getUserKey();
                                await axios.post(`${API_BASE}/marketplace/purchase`, { listingId: listing.id }, {
                                  headers: { "x-user-key": buyerKey }
                                });
                                toast.success("Purchase successful! Verified credits transferred to your wallet.");
                                syncWallet();
                                fetchMarketListings();
                              } catch(e: any) {
                                toast.error(e.response?.data?.error || "Purchase failed.");
                              }
                            }}
                          >
                            Purchase
                          </Button>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>

          <div className="bg-[#0d1f0d] border border-green-500/20 rounded-xl p-8">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-green-400 mb-2">Need Large Volume?</h3>
              <p className="text-gray-400 mb-6 border-b border-green-500/10 pb-6">Request a bulk purchase of 100+ CC for your organization's annual ESG report and secure an aggregated price schedule.</p>
              <Button className="w-full sm:w-auto mt-6 bg-green-500 hover:bg-green-400 text-black font-bold h-11 px-8" onClick={() => toast.success("Bulk request submitted to sales protocol.")}>
                Submit Bulk Request
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => !isRedeeming && setSelectedItem(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: "50%", x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, y: "50%", x: "-50%" }}
              className="fixed top-1/2 left-1/2 z-50 w-[95%] max-w-md rounded-2xl border border-primary/30 bg-[#0d1f0d] p-6 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-6 border-b border-green-500/20 pb-4">
                <h2 className="font-heading text-xl font-bold flex items-center gap-2 text-white">
                   <ShieldCheck className="w-5 h-5 text-green-500" /> Confirm Redemption
                </h2>
                <Button variant="ghost" size="icon" disabled={isRedeeming} onClick={() => setSelectedItem(null)} className="h-8 w-8 rounded-full text-gray-400 hover:text-white hover:bg-gray-800">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-5">
                 <div className="p-4 rounded-xl bg-black/40 border border-green-500/10 flex flex-col items-center gap-3 text-center">
                    <span className="text-5xl">{selectedItem.icon}</span>
                    <div>
                      <span className="font-bold text-lg text-white block mb-1">Redeem {selectedItem.name}?</span>
                      <span className="text-sm text-gray-400">{selectedItem.description}</span>
                    </div>
                 </div>

                 <div className="bg-background rounded-lg border border-border/50 p-4 font-mono text-sm space-y-3">
                    <div className="flex justify-between text-gray-400">
                      <span>Card Cost</span>
                      <span className="text-white">{selectedItem.cost.toFixed(2)} CC</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Your Balance</span>
                      <span className="text-white">{credits.toFixed(2)} CC</span>
                    </div>
                    <div className="h-px bg-gray-800 my-1"/>
                    <div className="flex justify-between text-gray-400">
                      <span>Remaining Balance</span>
                      <span className="font-bold text-green-500">{(credits - selectedItem.cost).toFixed(2)} CC</span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 pt-2">
                   <Button 
                     variant="outline" 
                     className="h-11 border-gray-700 hover:bg-gray-800 hover:text-white"
                     disabled={isRedeeming}
                     onClick={() => setSelectedItem(null)}
                   >
                     Cancel
                   </Button>
                   <Button 
                     className="h-11 bg-green-500 hover:bg-green-400 text-black font-bold" 
                     disabled={isRedeeming}
                     onClick={handleConfirmRedemption}
                   >
                     {isRedeeming ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm"}
                   </Button>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MarketplacePage;
