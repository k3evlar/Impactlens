import { useState, useEffect } from "react";
import { UserCircle, MapPin, Mail, Save, Edit2, Coins, CheckCircle2, XCircle, Calendar, ShieldCheck, Leaf, UploadCloud, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getUserTier } from "@/lib/utils";

const STATES = [
  "Karnataka",
  "Maharashtra",
  "Delhi",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "Kerala"
];

const CITIES: Record<string, string[]> = {
  "Karnataka": ["Bangalore", "Mysore", "Mangalore"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  "Delhi": ["New Delhi", "Dwarka"],
  "Tamil Nadu": ["Chennai", "Coimbatore"],
  "Telangana": ["Hyderabad", "Warangal"],
  "Gujarat": ["Ahmedabad", "Surat"],
  "Kerala": ["Kochi", "Trivandrum"]
};

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState({ name: "", email: "", city: "", state: "" });
  const [stats, setStats] = useState({ credits: 0, uploads: 0, verified: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", city: "", state: "" });

  useEffect(() => {
    // Load general user Auth
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Map native profile details
        setUserProfile({
          name: user.name || "User",
          email: user.email || "",
          city: user.city || "",
          state: user.state || ""
        });
        setFormData({
          name: user.name || "User",
          city: user.city || "",
          state: user.state || ""
        });

        // Load specific user data bucket
        if (user.email) {
          const dataKey = `data_${user.email}`;
          const userDataStr = localStorage.getItem(dataKey);
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            
            // Map Stats
            setStats({
              credits: userData.credits || 0,
              uploads: (userData.uploads || []).length > 0 ? userData.uploads.length : (userData.history || []).length,
              verified: (userData.history || []).filter((h: any) => h.verified).length,
            });

            // Map Recent Transactions (last 3)
            const sortedTx = (userData.transactions || []).sort((a: any, b: any) => b.timestamp - a.timestamp);
            setRecentTransactions(sortedTx.slice(0, 3));

            // Map Recent Uploads (last 3)
            const sortedHistory = (userData.history || []).sort((a: any, b: any) => b.timestamp - a.timestamp);
            setRecentUploads(sortedHistory.slice(0, 3));
          }
        }
      } catch (e) {
        console.error("Profile payload failed to parse.");
      }
    }
  }, []);

  const handleSaveProfile = () => {
    // Save to localStorage 'user' string
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const originalUser = JSON.parse(userStr);
        const updatedUser = {
          ...originalUser,
          name: formData.name,
          city: formData.city,
          state: formData.state
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        setUserProfile({
          ...userProfile,
          name: formData.name,
          city: formData.city,
          state: formData.state
        });
        
        setIsEditing(false);
        toast.success("Profile updated seamlessly! Refresh to sync sidebar.");
      } catch (e) {
        toast.error("Failed to update profile configurations.");
      }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage your account settings and view your summary.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Column: User Info & Stats */}
         <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.1 }}
           className="lg:col-span-1 space-y-6"
         >
            {/* User Info Card */}
            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-primary/30 shrink-0 shadow-inner">
                      <span className="text-4xl font-bold font-heading uppercase">{userProfile.name?.charAt(0) || "U"}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-col items-center gap-1.5">
                      <h2 className="text-2xl font-bold font-heading">{userProfile.name}</h2>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary shadow-sm hover:scale-105 transition-transform cursor-default">
                        {getUserTier(stats.credits)}
                      </span>
                    </div>
                    <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm mt-3">
                      <Mail className="w-4 h-4 text-muted-foreground/70" /> {userProfile.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-5 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Account Details</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="h-8">
                      {isEditing ? "Cancel" : <><Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit</>}
                    </Button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Full Name</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">State</label>
                        <select 
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value, city: ""})}
                          className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
                        >
                          <option value="">Select State</option>
                          {STATES.map(state => <option key={state} value={state}>{state}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">City</label>
                        <select 
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          disabled={!formData.state}
                          className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 transition-all"
                        >
                          <option value="">Select City</option>
                          {(CITIES[formData.state] || []).map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                      </div>
                      <Button className="w-full mt-2" onClick={handleSaveProfile}>
                        <Save className="w-4 h-4 mr-2" /> Save Profile
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-secondary/20 p-4 rounded-xl border border-border/30">
                       <div className="flex items-center gap-3 text-sm">
                          <UserCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{userProfile.name}</span>
                       </div>
                       <div className="flex items-center gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{userProfile.city && userProfile.state ? `${userProfile.city}, ${userProfile.state}` : <span className="text-muted-foreground italic">Location not set</span>}</span>
                       </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Stats */}
            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-heading font-bold text-lg mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-green-500/10 border border-green-500/20">
                     <div className="flex items-center gap-3">
                        <Leaf className="w-5 h-5 text-green-500" />
                        <span className="font-medium">Total Credits</span>
                     </div>
                     <span className="font-heading font-bold text-xl">{stats.credits}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                     <div className="flex items-center gap-3">
                        <UploadCloud className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Total Uploads</span>
                     </div>
                     <span className="font-heading font-bold text-xl">{stats.uploads}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary/10 border border-primary/20">
                     <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="font-medium">Verified Actions</span>
                     </div>
                     <span className="font-heading font-bold text-xl">{stats.verified}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
         </motion.div>

         {/* Right Column: Summaries */}
         <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="lg:col-span-2 space-y-6"
         >
            {/* Wallet Summary */}
            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/10 rounded-bl-full -z-10 translate-x-8 -translate-y-8 blur-2xl pointer-events-none" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-heading font-bold text-xl flex items-center gap-2">
                     <Coins className="w-5 h-5 text-green-500" /> Wallet Summary
                   </h3>
                   <span className="font-bold text-3xl font-heading text-green-500">{stats.credits} CC</span>
                </div>

                <div className="space-y-3">
                   <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Wallet Transactions</p>
                   {recentTransactions.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-6 text-center rounded-xl border border-dashed border-border/50 bg-secondary/10">No recent transactions found.</p>
                   ) : (
                      <div className="grid gap-3">
                        {recentTransactions.map((tx, idx) => (
                          <div key={idx} className={`flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30 transition-colors ${tx.type === 'spent' ? 'hover:border-red-500/30' : 'hover:border-green-500/30'}`}>
                             <div className="flex flex-col">
                               <span className={`font-semibold flex items-center gap-2 ${tx.type === 'spent' ? 'text-red-500' : 'text-green-500'}`}>
                                 <Coins className="w-4 h-4" /> {tx.type === 'spent' ? `-${tx.amount || 1} Credits Spent` : `+${tx.amount || 1} Credit Earned`}
                               </span>
                               <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mt-1.5">
                                 <Calendar className="w-3.5 h-3.5" /> {new Date(tx.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                               </span>
                             </div>
                             <span className="text-xs font-mono text-muted-foreground/50 bg-secondary/50 px-2 py-1 rounded hidden sm:inline-block">TXN-OK</span>
                          </div>
                        ))}
                      </div>
                   )}
                </div>
              </CardContent>
            </Card>

            {/* Submissions Section */}
            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors shadow-sm relative overflow-hidden">
              <div className="absolute left-0 bottom-0 w-32 h-32 bg-primary/10 rounded-tr-full -z-10 -translate-x-8 translate-y-8 blur-2xl pointer-events-none" />
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-xl mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Recent Verifications
                </h3>
                
                <div className="space-y-3">
                   {recentUploads.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-6 text-center rounded-xl border border-dashed border-border/50 bg-secondary/10">No recent submissions found.</p>
                   ) : (
                      <div className="grid gap-3">
                        {recentUploads.map((upload, idx) => (
                           <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30 gap-4 hover:border-primary/30 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg \${upload.verified ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                  {upload.verified ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-[15px]">{upload.verified ? "Verified Action" : "Rejected Submission"}</span>
                                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mt-1">
                                    <Calendar className="w-3.5 h-3.5" /> {new Date(upload.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                  </span>
                                </div>
                              </div>
                              {upload.confidence !== undefined && (
                                <div className="text-sm font-medium bg-background/50 px-3 py-1.5 rounded-lg border border-border/50 flex flex-col items-center min-w-[90px]">
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Confidence</span>
                                  <span className={upload.verified ? "text-green-500 font-bold" : "text-red-500 font-bold"}>{Math.round(upload.confidence * 100)}%</span>
                                </div>
                              )}
                           </div>
                        ))}
                      </div>
                   )}
                </div>
              </CardContent>
            </Card>
         </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
