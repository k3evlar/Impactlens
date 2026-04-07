import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Coins, ExternalLink, Calendar, Link2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";

const CreditsPage = () => {
  const { transactions, isLoading, syncWallet } = useWallet();
  
  useEffect(() => {
    syncWallet();
  }, [syncWallet]);

  const sortedTransactions = [...transactions].sort(
    (a: any, b: any) => b.timestamp - a.timestamp
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">Credit History</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Track all your minted carbon credit transactions and view their decentralized proofs.
            </p>
          </div>
          
          <button
            onClick={async () => {
              if (window.confirm("⚠️ DANGER: This will permanently clear ALL transaction data and ledger hashes. Are you sure?")) {
                try {
                  await axios.post("http://localhost:5000/api/dangerous/reset");
                  
                  // Double Purge: Clear local storage as well
                  const userStr = localStorage.getItem("user");
                  if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.email) {
                      localStorage.removeItem(`data_${user.email}`);
                    }
                  }
                  
                  toast.success("💥 System Hash & Local Cache Reset!");
                  syncWallet();
                  window.location.reload(); // Hard refresh to ensure all hooks reset
                } catch (e) {
                  toast.error("Failed to reset system hash.");
                }
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-lg transition-all font-mono text-xs uppercase"
          >
            <Trash2 className="w-4 h-4" />
            Reset System Hash
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-24 text-muted-foreground animate-pulse">Loading transaction history...</div>
      ) : sortedTransactions.length === 0 ? (
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
          {sortedTransactions.map((record, idx) => (
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
                        {record.type === 'spent' ? `-${Number(record.amount || 1).toFixed(2)} Spent ${record.item ? `(${record.item})` : ''}` : `+${Number(record.amount || 1).toFixed(2)} Credit Earned`}
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
                    {record.ipfsUri && record.imageHash ? (
                      <Link
                        to={`/verify/${record.imageHash}`}
                        className="flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-400 hover:underline transition-colors px-1"
                      >
                        <Link2 className="w-4 h-4" />
                        View Full Impact Certificate
                        <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                      </Link>
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
