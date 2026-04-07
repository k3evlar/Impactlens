const express = require('express');
const { getOrCreateWallet } = require('../services/walletService');

const router = express.Router();

router.get('/summary/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const wallet = getOrCreateWallet(userId);
        
        const overrideCredits = req.query.credits ? parseFloat(req.query.credits) : null;
        const credits = (overrideCredits !== null && !isNaN(overrideCredits)) ? overrideCredits : (wallet.credits || 0);

        // Calculate metrics using local UI-expected scaling
        const totalCredits = credits;
        const co2OffsetKg = (totalCredits * 0.85).toFixed(2);
        const treesEquivalent = Math.round(totalCredits * 0.04);
        const carsOffDays = (totalCredits * 0.00037).toFixed(3);
        const flightsOffset = (totalCredits * 0.0012).toFixed(3);

        // Activity Breakdown - uses "name" and "value" for UI charts, plus colors from remote
        const activityBreakdown = [
            { name: "Reforestation", value: totalCredits * 0.4, color: "#22c55e" },
            { name: "Carpooling", value: totalCredits * 0.25, color: "#4ade80" },
            { name: "Recycling", value: totalCredits * 0.2, color: "#16a34a" },
            { name: "Energy Saving", value: totalCredits * 0.15, color: "#86efac" }
        ].map(item => totalCredits > 0 ? item : { ...item, value: 0 });

        // Monthly Growth - uses "month" and "impact" for UI AreaChart
        const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
        const monthlyGrowth = months.map((month, index) => {
            const simulatedHistoricValue = totalCredits * (Math.pow((index + 1) / 6, 1.5));
            return {
                month,
                impact: Number(simulatedHistoricValue.toFixed(2))
            };
        });

        const responseData = {
            userId,
            tier: wallet.tier || 'BRONZE',
            totalCredits,
            co2OffsetKg,
            treesEquivalent,
            carsOffDays,
            flightsOffset,
            activityBreakdown,
            monthlyGrowth,
            verifiedAt: new Date().toISOString()
        };

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
