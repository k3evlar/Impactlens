import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, Trees, Car, Building2, Download, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import jsPDF from "jspdf";
import axios from "axios";
import { toast } from "sonner";
import { useWallet } from "@/hooks/use-wallet";

const API_BASE = "http://localhost:5000/api";

const ESGDashboard = () => {
  const { credits, tier } = useWallet();
  const [esgData, setEsgData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEsgData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        const userId = userStr ? (JSON.parse(userStr).email || "anonymous") : "anonymous";
        
        // Pass credits to sync with local wallet state
        const response = await axios.get(`${API_BASE}/esg/summary/${encodeURIComponent(userId)}?credits=${credits}`);
        setEsgData(response.data);
      } catch (error) {
        console.error("ESG Data Fetch Error:", error);
        toast.error("Failed to load ESG impact data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEsgData();
  }, [credits]);

  const handleDownloadPDF = () => {
    if (!esgData) return;
    try {
      const doc = new jsPDF("landscape");
      
      // Black Background (#000000)
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, 297, 210, "F");

      // Green Accent Borders (#22c55e)
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(2);
      doc.rect(10, 10, 277, 190);
      
      doc.setLineWidth(0.5);
      doc.line(10, 45, 287, 45); // Header line

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text("SecureCarbonX", 20, 30);
      doc.setTextColor(34, 197, 94);
      doc.text("ESG Certificate", 95, 30);
      
      // Tagline from remote
      doc.setFontSize(10);
      doc.setTextColor(134, 239, 172);
      doc.setFont("helvetica", "normal");
      doc.text("Powered by multimodal AI verification pipeline", 20, 40);

      // User Context
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(12);
      doc.text(`Issued To: ${esgData.userId}`, 20, 60);
      doc.text(`Tier: ${tier}`, 20, 70);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);

      const drawMetricBox = (title: string, value: string, x: number, y: number) => {
        doc.setFillColor(17, 26, 17); // #111a11 equivalent
        doc.setDrawColor(26, 46, 26); // #1a2e1a
        doc.rect(x, y, 110, 35, "FD");
        
        doc.setTextColor(134, 239, 172); // #86efac
        doc.setFontSize(10);
        doc.text(title, x + 5, y + 10);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(value, x + 5, y + 25);
        doc.setFont("helvetica", "normal");
      };

      // Metrics
      drawMetricBox("Total Verified Credits", `${esgData.totalCredits} CC`, 20, 100);
      drawMetricBox("CO2 Offset (kg)", `${esgData.co2OffsetKg} kg`, 150, 100);
      drawMetricBox("Trees Equivalent", `${esgData.treesEquivalent} Trees`, 20, 145);
      drawMetricBox("Cars Off Road (Days)", `${esgData.carsOffDays} Days`, 150, 145);

      // Signature Area
      doc.setDrawColor(34, 197, 94);
      doc.line(200, 190, 270, 190);
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text("AI Verification signature", 215, 195);

      doc.save(`SecureCarbonX_ESG_${esgData.userId.split("@")[0]}.pdf`);
      toast.success("ESG Certificate Downloaded Successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF.");
    }
  };

  if (isLoading || !esgData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-green-500 animate-[spin_1.5s_linear_infinite]" />
        <h3 className="text-white font-bold animate-[pulse_2s_ease-in-out_infinite]">Calculating Unified ESG Metrics...</h3>
      </div>
    );
  }

  // Bar Chart Colors
  const COLORS = ['#22c55e', '#15803d', '#166534', '#14532d'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: "#111a11", border: "1px solid #1a2e1a", padding: "10px", borderRadius: "8px" }}>
          <p style={{ color: "#86efac", fontWeight: "bold", margin: 0 }}>{label || payload[0].payload.month}</p>
          <p style={{ color: "white", margin: 0 }}>{payload[0].value.toFixed(2)} CC</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ backgroundColor: "#0a0f0a", minHeight: "100%", padding: "2rem" }} className="rounded-xl border border-[#1a2e1a]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading" style={{ color: "white" }}>ESG<span style={{ color: "#22c55e" }}>Live</span> Impact</h1>
          <p style={{ color: "#4b7a56" }} className="mt-1">Real-time enterprise sustainability governance metrics.</p>
        </div>
        <Button 
          onClick={handleDownloadPDF}
          style={{ backgroundColor: "#22c55e", color: "black" }} 
          className="font-bold hover:bg-green-400"
        >
          <Download className="w-4 h-4 mr-2" /> Download Certificate (PDF)
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Verified Credits", value: `${esgData.totalCredits} CC`, icon: Leaf },
          { title: "CO2 Offset", value: `${esgData.co2OffsetKg} kg`, icon: Building2 },
          { title: "Trees Planted Equivalent", value: esgData.treesEquivalent, icon: Trees },
          { title: "Cars Off Road", value: `${esgData.carsOffDays} Days`, icon: Car }
        ].map((metric, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
          >
            <Card style={{ backgroundColor: "#111a11", borderColor: "#1a2e1a" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span style={{ color: "#86efac" }} className="text-sm font-semibold uppercase tracking-wider">{metric.title}</span>
                  <metric.icon style={{ color: "#22c55e" }} className="w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-white font-mono">{metric.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Curve */}
        <Card style={{ backgroundColor: "#111a11", borderColor: "#1a2e1a" }}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp style={{ color: "#22c55e" }} className="w-5 h-5" /> 6-Month Trajectory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={esgData.monthlyGrowth}>
                  <defs>
                    <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#4b7a56" tick={{ fill: "#4b7a56" }} />
                  <YAxis stroke="#4b7a56" tick={{ fill: "#4b7a56" }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1a2e1a', strokeWidth: 1, fill: 'transparent' }} />
                  <Area type="monotone" dataKey="impact" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorImpact)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Breakdown */}
        <Card style={{ backgroundColor: "#111a11", borderColor: "#1a2e1a" }}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Leaf style={{ color: "#22c55e" }} className="w-5 h-5" /> Portfolio Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={esgData.activityBreakdown} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" stroke="#4b7a56" tick={{ fill: "#4b7a56" }} />
                  <YAxis type="category" dataKey="name" stroke="#4b7a56" tick={{ fill: "#86efac" }} width={80} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {esgData.activityBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ESGDashboard;
