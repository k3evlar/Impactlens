import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ExternalLink, Calendar, Link2, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const HistoryPage = () => {
  const [history, setHistory] = useState<any[]>([]);

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
            const sortedHistory = (userData.history || []).sort(
              (a: any, b: any) => b.timestamp - a.timestamp
            );
            setHistory(sortedHistory);
          }
        }
      } catch (e) {
        console.error("Failed to load history", e);
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
        <h1 className="font-heading text-3xl font-bold tracking-tight">Verification History</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Review all your submitted sustainability proofs and their AI results.
        </p>
      </motion.div>

      {history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-24 border border-dashed rounded-xl border-primary/20 bg-primary/5"
        >
          <p className="text-muted-foreground text-lg">No verification history found.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Upload a proof to see it here.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {history.map((record, idx) => (
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
                    <div className={`p-3.5 rounded-2xl flex items-center justify-center ${record.verified ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                      {record.verified ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                    </div>
                    <div>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        {record.verified ? "Verified Environmental Action" : "Rejected Submission"}
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

                  {/* Details (Confidence + IPFS) */}
                  <div className="flex flex-col items-start sm:items-end gap-3 mt-2 sm:mt-0">
                    {record.confidence !== undefined && (
                      <div className="flex items-center gap-2 text-sm font-medium bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50">
                        <Brain className="w-4 h-4 text-muted-foreground" />
                        AI Confidence: 
                        <span className={record.verified ? "text-green-500" : "text-red-500"}>
                          {Math.round(record.confidence * 100)}%
                        </span>
                      </div>
                    )}
                    
                    {record.ipfsUri && (
                      <a 
                        href={record.ipfsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-400 hover:underline transition-colors px-1"
                      >
                        <Link2 className="w-4 h-4" />
                        View on IPFS
                        <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                      </a>
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

export default HistoryPage;
