import { useState, useEffect } from "react";
import { Leaf, UploadCloud, CheckCircle, BrainCircuit, Network, Coins, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getUserTier } from "@/lib/utils";

const Dashboard = () => {
  const [stats, setStats] = useState({ credits: 0, uploads: 0, verified: 0 });
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const loadUserData = () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "User");
        
        if (user.email) {
          const dataKey = `data_${user.email}`;
          const userDataStr = localStorage.getItem(dataKey);
          
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            setStats({
              credits: userData.credits || 0,
              uploads: userData.uploads ? userData.uploads.length : (userData.history || []).length,
              verified: (userData.history || []).filter((h: any) => h.verified).length,
            });
          } else {
            // First time loading - Initialize data
            const initialData = { credits: 0, uploads: [], history: [] };
            localStorage.setItem(dataKey, JSON.stringify(initialData));
            setStats({ credits: 0, uploads: 0, verified: 0 });
          }
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    };

    loadUserData();
  }, []);

  const mockGraphData = Array.from({ length: 7 }, (_, i) => ({
    name: `Day ${i + 1}`,
    credits: i === 6 ? stats.credits : Math.max(0, Math.floor((stats.credits / 6) * i))
  }));

  const steps = [
    {
      title: "Upload Proof",
      description: "Submit images of your environmental actions.",
      icon: UploadCloud,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "AI Verification",
      description: "Our AI validates the authenticity of your action.",
      icon: BrainCircuit,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Store on IPFS",
      description: "Data is immutably stored on the decentralized web.",
      icon: Network,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Mint Carbon Credit",
      description: "Receive a verified blockchain-based credit token.",
      icon: Coins,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
             <h1 className="font-heading text-4xl font-bold tracking-tight mb-2">
               Welcome back, {userName} 👋
             </h1>
             <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
               SecureCarbonX allows you to verify sustainability actions using AI and convert them into blockchain-based carbon credits dynamically!
             </p>
           </div>
           
           <div className="flex bg-secondary/30 border border-border/50 backdrop-blur-sm px-6 py-4 rounded-2xl items-center gap-3 shadow-sm hover:shadow-md transition-all shrink-0">
             <div className="h-12 w-12 rounded-full bg-primary/20 flex flex-col items-center justify-center border border-primary/30 shadow-inner">
               <span className="text-xl font-bold text-primary">{userName?.charAt(0) || "U"}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap opacity-80">Current Rank</span>
               <span className="font-heading text-xl font-bold text-primary whitespace-nowrap">{getUserTier(stats.credits)}</span>
             </div>
           </div>
        </div>
      </motion.div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Stats Block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <Card className="bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-colors shadow-sm hover:shadow-lg sm:col-span-3">
            <CardContent className="p-0">
               <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
                 
                 <div className="p-8 flex flex-col justify-center bg-green-500/5 hover:bg-green-500/10 transition-colors group cursor-default">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-green-500 uppercase tracking-widest opacity-80">Total Credits</p>
                      <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Leaf className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-5xl font-black font-heading text-green-600 tracking-tighter">{stats.credits}</p>
                 </div>

                 <div className="p-8 flex flex-col justify-center hover:bg-secondary/20 transition-colors group cursor-default">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-80">Total Uploads</p>
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-5xl font-black font-heading tracking-tighter">{stats.uploads}</p>
                 </div>

                 <div className="p-8 flex flex-col justify-center hover:bg-secondary/20 transition-colors group cursor-default">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-80">Verified Proofs</p>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <p className="text-5xl font-black font-heading tracking-tighter">{stats.verified}</p>
                 </div>

               </div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/80 backdrop-blur-sm border-border/50 sm:col-span-3 h-[240px] shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-heading font-bold text-lg">Credits Analytics Timeline</h3>
                 <span className="text-xs font-semibold text-muted-foreground px-2 py-1 bg-secondary rounded-md uppercase">Lifetime Tracker</span>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockGraphData}>
                    <defs>
                      <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                       itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="credits" stroke="hsl(142 71% 45%)" strokeWidth={3} fillOpacity={1} fill="url(#colorCredits)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        </motion.div>

        {/* Right Info Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/20 shadow-md relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
             <CardContent className="p-8 space-y-4">
               <div className="flex items-center gap-3 mb-2">
                 <Sparkles className="w-6 h-6 text-primary" />
                 <h3 className="font-heading font-black text-xl tracking-tight text-primary">Why This Matters</h3>
               </div>
               <p className="text-base text-foreground/90 leading-relaxed font-medium">
                 Every single carbon credit represents a definitively verified sustainability action contributing exactly to real-world environmental impacts.
               </p>
               <div className="pt-4 border-t border-border/50">
                 <p className="text-sm text-muted-foreground">Keep verifying offline efforts to continue increasing your ecosystem tier directly!</p>
               </div>
             </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* How it works Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="pt-6"
      >
        <h2 className="text-2xl font-bold font-heading mb-6">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="bg-background/60 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-lg shadow-sm">
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center ${step.bg}`}>
                    <Icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;