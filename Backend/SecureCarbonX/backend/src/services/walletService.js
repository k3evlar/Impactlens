const { readStore, writeStore } = require('./fraudDetectionService');

function getTier(totalEarned) {
    if (totalEarned >= 50) return "PLATINUM";
    if (totalEarned >= 20) return "GOLD";
    if (totalEarned >= 5) return "SILVER";
    return "BRONZE";
}

function getOrCreateWallet(userKey) {
    const store = readStore();
    if (!store.wallets) store.wallets = [];
    
    let wallet = store.wallets.find(w => w.userKey === userKey);
    if (!wallet) {
        wallet = {
            userKey,
            credits: 0,
            totalEarned: 0,
            totalSpent: 0,
            tier: "BRONZE",
            purchases: [],
            transactions: []
        };
        store.wallets.push(wallet);
        writeStore(store);
    }
    return wallet;
}

function addCredits(userKey, amount, metadata = {}) {
    const store = readStore();
    let wallet = store.wallets.find(w => w.userKey === userKey);
    
    if (!wallet) {
        wallet = {
            userKey,
            credits: 0,
            totalEarned: 0,
            totalSpent: 0,
            tier: "BRONZE",
            purchases: [],
            transactions: []
        };
        store.wallets.push(wallet);
    }

    wallet.credits = Math.round((wallet.credits + amount) * 100) / 100;
    wallet.totalEarned = Math.round((wallet.totalEarned + amount) * 100) / 100;
    wallet.tier = getTier(wallet.totalEarned);
    
    wallet.transactions.push({
        type: 'earned',
        amount: amount,
        timestamp: Date.now(),
        ...metadata
    });

    writeStore(store);
    return wallet;
}

function redeemCredits(userKey, amount, itemName) {
    const store = readStore();
    const wallet = store.wallets.find(w => w.userKey === userKey);
    
    if (!wallet || wallet.credits < amount) {
        throw new Error("Insufficient credits");
    }

    wallet.credits = Math.round((wallet.credits - amount) * 100) / 100;
    wallet.totalSpent = Math.round((wallet.totalSpent + amount) * 100) / 100;
    
    wallet.purchases.push({
        item: itemName,
        amount: amount,
        timestamp: Date.now(),
        status: "Completed"
    });

    wallet.transactions.push({
        type: 'spent',
        amount: amount,
        item: itemName,
        timestamp: Date.now()
    });

    writeStore(store);
    return wallet;
}

module.exports = {
    getOrCreateWallet,
    addCredits,
    redeemCredits,
    getTier
};
