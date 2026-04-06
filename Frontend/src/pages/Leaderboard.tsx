import { useState, useEffect } from "react";
import { Medal, Award, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const MOCK_USERS = [
  { name: "Rahul", credits: 8 },
  { name: "Sneha", credits: 6 },
  { name: "Ayan", credits: 5 },
  { name: "Priya", credits: 3 },
  { name: "Vikram", credits: 1 },
];

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    let activeName = "User";
    let activeCredits = 0;

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        activeName = user.name || "User";

        if (user.email) {
          const dataKey = `data_${user.email}`;
          const userDataStr = localStorage.getItem(dataKey);
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            activeCredits = userData.credits || 0;
          }
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    // Combine mock data with active user securely
    // We prevent duplicate entries by omitting a mock user if they share the exact name as your active login string
    const filteredMock = MOCK_USERS.filter((u) => u.name !== activeName);
    const combined = [...filteredMock, { name: activeName, credits: activeCredits, isCurrent: true }];
    
    // Sort highest first dynamically
    const sorted = combined.sort((a, b) => b.credits - a.credits);
    setLeaderboard(sorted);
  }, []);

  const getRankAppearance = (rank: number) => {
    switch(rank) {
      case 1:
        return { icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/40" };
      case 2:
        return { icon: Medal, color: "text-slate-300", bg: "bg-slate-300/10", border: "border-slate-300/40" };
      case 3:
        return { icon: Award, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/40" };
      default:
        return { icon: null, color: "text-muted-foreground", bg: "bg-secondary/30", border: "border-border/40" };
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-3xl font-bold tracking-tight">Global Leaderboard</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Compete against other sustainability champions and earn your rank!
        </p>
      </motion.div>

      <div className="space-y-3">
        {leaderboard.map((user, idx) => {
          const rank = idx + 1;
          const styling = getRankAppearance(rank);
          const RankIcon = styling.icon;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 + 0.1, duration: 0.3 }}
            >
              <Card 
                className={`backdrop-blur-sm transition-all shadow-sm ${
                  user.isCurrent 
                    ? "border-primary shadow-primary/20 bg-primary/5 scale-[1.01]" 
                    : `bg-background/60 hover:bg-background/80 ${styling.border}`
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4 sm:gap-6">
                    
                    {/* Rank Badge */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-heading font-bold flex-shrink-0 ${styling.bg} ${styling.color}`}>
                       {RankIcon ? <RankIcon className="w-6 h-6 sm:w-7 sm:h-7" /> : <span className="text-lg">#{rank}</span>}
                    </div>

                    {/* Name */}
                    <div className="space-y-1">
                      <p className={`font-semibold text-lg sm:text-xl flex items-center gap-2 ${user.isCurrent ? 'text-primary' : ''}`}>
                        {user.name}
                        {user.isCurrent && (
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary px-2.5 py-0.5 rounded-full ml-1">
                            You
                          </span>
                        )}
                      </p>
                      {rank <= 3 && !user.isCurrent && (
                         <p className={`text-xs font-semibold ${styling.color} uppercase tracking-wider`}>Top 3 Rating</p>
                      )}
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="flex flex-col items-end">
                    <span className="font-heading text-3xl font-bold">{user.credits}</span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Credits</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
};

export default LeaderboardPage;
