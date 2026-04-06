import { useState, useEffect } from "react";
import { Coins, ExternalLink, Calendar, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const CreditsPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.email) {
          const dataKey = `data_${user.email}`;
          const userDataStr = localStorage.getItem(dataKey);
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            // Sort latest first based on timestamp
            const sortedTransactions = (userData.transactions || []).sort(
              (a: any, b: any) => b.timestamp - a.timestamp
            );
            setTransactions(sortedTransactions);
          }
        }
      } catch (e) {
        console.error("Failed to load credit history", e);
      }
    }
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-3xl font-bold tracking-tight">Credit History</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Track all your minted carbon credit transactions and view their decentralized proofs.
        </p>
      </motion.div>

      {transactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-24 border border-dashed rounded-xl border-primary/20 bg-primary/5"
        >
          <div className="flex justify-center mb-4 text-green-500/50">
            <Coins className="w-12 h-12" />
          </div>
          <p className="text-muted-foreground text-lg">No carbon credits minted yet.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Upload verified proofs to start earning credits!</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {transactions.map((record, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 + 0.1, duration: 0.4 }}
            >
              <Card className="bg-background/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors shadow-sm hover:shadow-md">
                <CardContent className="p-5 flex flex-col sm:flex-row gap-5 sm:items-center justify-between">

                  {/* Status & Date */}
                  <div className="flex items-center gap-5">
                    <div className={`p-3.5 rounded-2xl flex items-center justify-center ${record.type === 'spent' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                      <Coins className="w-7 h-7" />
                    </div>
                    <div>
                      <p className={`font-semibold text-lg flex items-center gap-2 ${record.type === 'spent' ? 'text-red-500' : 'text-green-500'}`}>
                        {record.type === 'spent' ? `-${record.amount || 1} Spent (${record.item})` : `+${record.amount || 1} Credit Earned`}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.timestamp).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Details (IPFS Link) */}
                  <div className="flex flex-col items-start sm:items-end gap-3 mt-2 sm:mt-0">
                    {record.ipfsUri ? (
                      <a
                        href={record.ipfsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-400 hover:underline transition-colors px-1"
                      >
                        <Link2 className="w-4 h-4" />
                        View Proof on IPFS
                        <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground italic flex items-center gap-1.5">
                        <Link2 className="w-4 h-4" />
                        No URI Provided
                      </span>
                    )}
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreditsPage;
