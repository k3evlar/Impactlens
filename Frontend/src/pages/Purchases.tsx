import { useState, useEffect } from "react";
import { Receipt, Calendar, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";

const PurchasesPage = () => {
  const { purchases, isLoading } = useWallet();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
          <Receipt className="w-8 h-8" /> My Purchases
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Track all your securely redeemed marketplace rewards and certified ecosystem contributions.
        </p>
      </motion.div>

      {purchases.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-24 border border-dashed rounded-xl border-primary/20 bg-primary/5"
        >
          <div className="flex justify-center mb-4 text-primary/50">
            <Receipt className="w-12 h-12" />
          </div>
          <p className="text-muted-foreground text-lg">You haven't redeemed any rewards yet.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Visit the Marketplace to spend your credits!</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {purchases.map((record, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 + 0.1, duration: 0.4 }}
            >
              <Card className="bg-background/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors shadow-sm hover:shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-green-500/5 rounded-bl-full -z-10 translate-x-12 -translate-y-12 blur-3xl pointer-events-none" />
                <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                  
                  {/* Item Details */}
                  <div className="flex items-start sm:items-center gap-5">
                    <div className="p-3.5 sm:p-4 rounded-2xl flex items-center justify-center bg-green-500/10 text-green-500 shrink-0">
                      <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-lg sm:text-xl flex items-center gap-2">
                        {record.item}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(record.timestamp).toLocaleString(undefined, { 
                            dateStyle: 'medium', 
                            timeStyle: 'short' 
                          })}
                        </span>
                        <span className="flex items-center gap-1 text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {record.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Hash */}
                  <div className="flex flex-col items-start sm:items-end gap-2 sm:gap-3 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
                    <span className="font-bold text-xl text-green-500 bg-green-500/10 px-3 py-1 rounded-xl whitespace-nowrap">
                       -{Number(record.amount || 0).toFixed(2)} Credits
                    </span>
                    
                    {record.transactionHash && (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-secondary/50 px-2.5 py-1.5 rounded border border-border/50 max-w-full overflow-hidden">
                        <span className="shrink-0 text-muted-foreground/60">TXN:</span>
                        <span className="truncate">{record.transactionHash}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 ml-1 opacity-50" />
                      </div>
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

export default PurchasesPage;
