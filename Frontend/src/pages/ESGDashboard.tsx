import { useState, useEffect } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";

interface ActivityBreakdown {
  category: string;
  credits: number;
  color: string;
}

interface MonthlyGrowth {
  month: string;
  credits: number;
}

interface ESGData {
  userId: string;
  tier: string;
  totalCredits: number;
  co2OffsetKg: string | number;
  treesEquivalent: number;
  carsOffDays: string | number;
  flightsOffset: string | number;
  activityBreakdown: ActivityBreakdown[];
  monthlyGrowth: MonthlyGrowth[];
  verifiedAt: string;
}

const ESGDashboard = () => {
  const [data, setData] = useState<ESGData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchESGData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Dynamically load auth user and local storage credits
      let localCredits = 0;
      let targetUserId = "user_001";
      
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.email) {
            targetUserId = user.email;
            const dataStr = localStorage.getItem(`data_${user.email}`);
            if (dataStr) {
              localCredits = JSON.parse(dataStr).credits || 0;
            }
          }
        } catch (e) {}
      }

      const response = await fetch(`http://localhost:5000/api/esg/summary/${encodeURIComponent(targetUserId)}?credits=${localCredits}`);
      if (!response.ok) {
        throw new Error("Failed to fetch ESG data");
      }
      const json: ESGData = await response.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchESGData();
  }, []);

  const handleDownloadPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    
    // Background black
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 297, "F");

    doc.setTextColor(240, 253, 244);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SecureCarbonX ESG Verification Certificate", 15, 30);
    
    doc.setTextColor(134, 239, 172);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Powered by multimodal AI verification pipeline", 15, 40);

    doc.setDrawColor(26, 46, 26);
    doc.line(15, 45, 195, 45);

    doc.setTextColor(240, 253, 244);
    doc.setFontSize(14);
    doc.text(`User ID: ${data.userId}`, 15, 55);
    doc.text(`Tier: ${data.tier}`, 15, 65);
    
    const dateStr = new Date(data.verifiedAt).toLocaleDateString();
    doc.text(`Date verified: ${dateStr}`, 15, 75);

    doc.setFontSize(16);
    doc.setTextColor(34, 197, 94); // Green
    doc.text("Metrics Overview", 15, 95);

    doc.setTextColor(240, 253, 244);
    doc.setFontSize(12);
    doc.text(`TOTAL CREDITS: ${data.totalCredits} carbon credits earned`, 15, 110);
    doc.text(`CO2 OFFSET: ${data.co2OffsetKg} kilograms of CO2`, 15, 120);
    doc.text(`TREES PLANTED: ${data.treesEquivalent} tree equivalent offset`, 15, 130);
    doc.text(`CARS OFF ROAD: ${data.carsOffDays} car-days neutralised`, 15, 140);

    doc.setFontSize(16);
    doc.setTextColor(34, 197, 94); // Green
    doc.text("Activity Breakdown", 15, 160);

    doc.setTextColor(240, 253, 244);
    doc.setFontSize(12);
    let y = 175;
    data.activityBreakdown.forEach((act) => {
      doc.text(`- ${act.category}: ${act.credits} credits`, 15, y);
      y += 10;
    });

    doc.setTextColor(75, 122, 86);
    doc.setFontSize(10);
    doc.text("This certificate is generated from AI-verified sustainability", 15, 270);
    doc.text("proofs recorded on the SecureCarbonX platform.", 15, 275);

    doc.save(`esg-certificate-${data.userId}-${dateStr.replace(/\//g, "-")}.pdf`);
  };

  const MetricCard = ({ label, value, unit }: { label: string; value: string | number; unit: string }) => (
    <div style={{ background: "#111a11", border: "1px solid #1a2e1a", borderRadius: "12px", padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ color: "#86efac", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
        <div style={{ width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%" }}></div>
      </div>
      <div style={{ color: "#22c55e", fontSize: "2.8rem", fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      <div style={{ color: "#4b7a56", fontSize: "0.85rem", marginTop: "0.5rem" }}>{unit}</div>
    </div>
  );

  return (
    <div style={{ background: "#0a0f0a", minHeight: "100vh", padding: "2rem" }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 0.4; }
          }
          .skeleton {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            background: #111a11;
            border: 1px solid #1a2e1a;
            border-radius: 12px;
            height: 130px;
          }
        `}
      </style>

      {/* SECTION A */}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", marginBottom: "2rem", gap: "1rem" }}>
        <div>
          <h1 style={{ color: "#f0fdf4", fontWeight: 700, fontSize: "1.8rem", margin: 0 }}>ESG Impact Dashboard</h1>
          <p style={{ color: "#86efac", fontSize: "0.95rem", marginTop: "4px" }}>Verified carbon offset portfolio — powered by SecureCarbonX AI</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ background: "#14532d", color: "#4ade80", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.7rem", display: "inline-block" }}>
            {data ? `${data.tier} TIER` : "LOADING TIER"}
          </div>
          <div style={{ color: "#4b7a56", fontSize: "0.8rem", marginTop: "4px" }}>Verified by AI</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton"></div>)}
        </div>
      ) : error ? (
        <div style={{ background: "#111a11", border: "1px solid #1a2e1a", borderRadius: "12px", padding: "2.5rem", textAlign: "center" }}>
          <h3 style={{ color: "#f0fdf4", margin: "0 0 0.5rem 0" }}>Unable to load ESG data</h3>
          <p style={{ color: "#4b7a56", marginBottom: "1.5rem" }}>{error}</p>
          <button 
            onClick={fetchESGData}
            style={{ background: "#22c55e", color: "#0a0f0a", fontWeight: 600, borderRadius: "8px", padding: "0.6rem 1.4rem", border: "none", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <>
          {/* SECTION B */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <MetricCard label="TOTAL CREDITS" value={data.totalCredits} unit="carbon credits earned" />
            <MetricCard label="CO₂ OFFSET" value={data.co2OffsetKg} unit="kilograms of CO₂" />
            <MetricCard label="TREES PLANTED" value={data.treesEquivalent} unit="tree equivalent offset" />
            <MetricCard label="CARS OFF ROAD" value={data.carsOffDays} unit="car-days neutralised" />
          </div>

          {/* SECTION C */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "#111a11", border: "1px solid #1a2e1a", borderRadius: "12px", padding: "1.5rem" }}>
              <h3 style={{ color: "#86efac", fontSize: "0.75rem", letterSpacing: "0.08em", fontWeight: 600, margin: "0 0 1rem 0", textTransform: "uppercase" }}>CREDITS BY ACTIVITY</h3>
              <div style={{ height: "220px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.activityBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1a2e1a" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="category" tick={{ fill: "#4b7a56", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#4b7a56", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ background: "#0d150d", border: "1px solid #1a2e1a", borderRadius: "6px", color: "#86efac" }}
                      itemStyle={{ color: "#86efac" }}
                    />
                    <Bar dataKey="credits">
                      {data.activityBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: "#111a11", border: "1px solid #1a2e1a", borderRadius: "12px", padding: "1.5rem" }}>
              <h3 style={{ color: "#86efac", fontSize: "0.75rem", letterSpacing: "0.08em", fontWeight: 600, margin: "0 0 1rem 0", textTransform: "uppercase" }}>PORTFOLIO GROWTH — 6 MONTHS</h3>
              <div style={{ height: "220px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1a2e1a" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#4b7a56", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#4b7a56", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: "#0d150d", border: "1px solid #1a2e1a", borderRadius: "6px", color: "#86efac" }}
                      itemStyle={{ color: "#22c55e" }}
                    />
                    <Area type="monotone" dataKey="credits" stroke="#22c55e" strokeWidth={2.5} fill="#22c55e" fillOpacity={0.08} activeDot={{ r: 6, fill: "#4ade80", stroke: "#111a11", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SECTION D */}
          <div style={{ background: "#111a11", border: "1px solid #1a2e1a", borderRadius: "12px", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ maxWidth: "600px" }}>
              <h2 style={{ color: "#f0fdf4", fontWeight: 600, margin: "0 0 4px 0", fontSize: "1.1rem" }}>Download ESG Certificate</h2>
              <p style={{ color: "#4b7a56", fontSize: "0.9rem", margin: 0, lineHeight: 1.5 }}>
                Generate a verifiable PDF report of your carbon offset portfolio for ESG reporting and corporate disclosure.
              </p>
            </div>
            <button 
              onClick={handleDownloadPDF}
              style={{ background: "#22c55e", color: "#0a0f0a", fontWeight: 700, borderRadius: "8px", padding: "0.65rem 1.6rem", fontSize: "0.9rem", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
              onMouseOver={(e) => e.currentTarget.style.background = "#4ade80"}
              onMouseOut={(e) => e.currentTarget.style.background = "#22c55e"}
            >
              Download PDF Certificate
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ESGDashboard;
