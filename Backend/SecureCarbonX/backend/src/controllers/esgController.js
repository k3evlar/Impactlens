const getESGSummary = async (req, res) => {
    try {
        const { userId } = req.params;
        const queryCredits = parseFloat(req.query.credits || "0");
        
        // Base numerical conversions
        const totalCredits = queryCredits;
        const co2OffsetKg = (totalCredits * 0.85).toFixed(2);
        const treesEquivalent = Math.round(totalCredits * 0.04);
        const carsOffDays = (totalCredits * 0.00037).toFixed(3);

        // Simulated Activity Breakdown
        // Using strict scaling based on the exact amount of credits.
        const baseBreakdown = [
            { name: "Reforestation", value: totalCredits * 0.4 },
            { name: "Carpooling", value: totalCredits * 0.25 },
            { name: "Recycling", value: totalCredits * 0.2 },
            { name: "Energy Saving", value: totalCredits * 0.15 }
        ];

        // Ensure 0 value renders as minimally visible if they have no credits
        const activityBreakdown = totalCredits > 0 
            ? baseBreakdown 
            : baseBreakdown.map(b => ({ ...b, value: 0 }));

        // Generate 6-month simulated growth curve
        // Scales based on current credits to create a plausible chart
        const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
        const monthlyGrowth = months.map((month, index) => {
            // Simulated historic curve (growing towards the current totalCredits)
            const simulatedHistoricValue = totalCredits * (Math.pow((index + 1) / 6, 1.5));
            return {
                month,
                impact: Number(simulatedHistoricValue.toFixed(2))
            };
        });

        return res.json({
            userId,
            totalCredits,
            co2OffsetKg,
            treesEquivalent,
            carsOffDays,
            activityBreakdown,
            monthlyGrowth
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getESGSummary
};
