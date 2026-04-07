const { getOrCreateWallet, addCredits, redeemCredits } = require('../services/walletService');
const { readStore, writeStore } = require('../services/fraudDetectionService');

function resolveUserKey(req) {
    // Priority: Header > Body > IP (Fallback)
    return req.headers['x-user-key'] || req.body.userKey || req.ip;
}

const getWallet = async (req, res) => {
    try {
        const userKey = resolveUserKey(req);
        const wallet = getOrCreateWallet(userKey);
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const redeemCatalogItem = async (req, res) => {
    try {
        const userKey = resolveUserKey(req);
        const { cost, name } = req.body;
        
        if (!cost || !name) {
            return res.status(400).json({ error: 'Item cost and name are required' });
        }

        const wallet = redeemCredits(userKey, cost, name);
        res.json({ success: true, wallet });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getMarketListings = async (req, res) => {
    try {
        const store = readStore();
        res.json(store.marketplaceListings || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createListing = async (req, res) => {
    try {
        const userKey = resolveUserKey(req);
        const { amount, price, activity, imageHash } = req.body;
        
        const wallet = getOrCreateWallet(userKey);
        // Tier check removed per user request

        if (wallet.credits < amount) {
            return res.status(400).json({ error: 'Insufficient credits to list' });
        }

        // Deduct from wallet immediately to "escrow"
        wallet.credits -= amount;
        
        const store = readStore();
        const listingId = Date.now().toString();
        const newListing = {
            id: listingId,
            seller: userKey,
            tier: wallet.tier,
            amount: parseFloat(amount),
            price: parseFloat(price),
            activity,
            imageHash,
            status: "Active",
            createdAt: Date.now()
        };

        if (!store.marketplaceListings) store.marketplaceListings = [];
        store.marketplaceListings.push(newListing);
        
        writeStore(store);
        res.json({ success: true, listing: newListing, wallet });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const purchaseListing = async (req, res) => {
    try {
        const buyerKey = resolveUserKey(req);
        const { listingId } = req.body;
        
        const store = readStore();
        const listingIndex = (store.marketplaceListings || []).findIndex(l => l.id === listingId);
        
        if (listingIndex === -1) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        const listing = store.marketplaceListings[listingIndex];
        if (listing.status !== "Active") {
            return res.status(400).json({ error: 'Listing is no longer active' });
        }

        // Get or create wallet directly from THIS store instance to ensure consistency
        if (!store.wallets) store.wallets = [];
        let buyerWallet = store.wallets.find(w => w.userKey === buyerKey);
        if (!buyerWallet) {
            buyerWallet = {
                userKey: buyerKey,
                credits: 0,
                totalEarned: 0,
                totalSpent: 0,
                tier: "BRONZE",
                purchases: [],
                transactions: []
            };
            store.wallets.push(buyerWallet);
        }
        
        // Move credits to buyer
        buyerWallet.credits += listing.amount;
        buyerWallet.totalEarned += listing.amount; // Optional: depending on policy

        if (!buyerWallet.transactions) buyerWallet.transactions = [];
        buyerWallet.transactions.push({
            type: 'earned',
            amount: listing.amount,
            timestamp: Date.now()
        });

        // Update listing
        listing.status = "Sold";
        listing.soldTo = buyerKey;
        listing.soldAt = Date.now();

        writeStore(store);
        res.json({ success: true, wallet: buyerWallet, listing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getWallet,
    redeemCatalogItem,
    getMarketListings,
    createListing,
    purchaseListing
};
