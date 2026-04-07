const fs = require('fs');
const path = require('path');

const STORE_FILE = path.join(__dirname, '..', 'src', 'data', 'fraud-store.json');

function cleanup() {
    if (!fs.existsSync(STORE_FILE)) {
        console.log("❌ Store file not found.");
        return;
    }

    const store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    const oldRecordCount = store.records.length;

    // 1. Filter Records (Keep only real IPFS hashes or null/rejects that aren't mock)
    // We specifically want to REMOVE anything that says "mock-"
    const cleanRecords = store.records.filter(record => {
        if (!record.ipfsUri) return true; // Keep rejections/pending
        return !record.ipfsUri.includes('mock-');
    });

    // 2. Clean Wallets (Remove transactions linked to deleted records)
    const validHashes = new Set(cleanRecords.map(r => r.imageHash));
    const cleanWallets = store.wallets.map(wallet => {
        return {
            ...wallet,
            transactions: (wallet.transactions || []).filter(tx => {
                if (!tx.imageHash) return true;
                return validHashes.has(tx.imageHash);
            }),
            credits: validHashes.size === 0 ? 0 : wallet.credits // Conservative reset if history is gone
        };
    });

    // 3. Clean Marketplace
    const cleanListings = (store.marketplaceListings || []).filter(item => {
        return validHashes.has(item.imageHash) || item.id.startsWith('mock-') === false;
    });

    const newStore = {
        ...store,
        records: cleanRecords,
        wallets: cleanWallets,
        marketplaceListings: cleanListings
    };

    fs.writeFileSync(STORE_FILE, JSON.stringify(newStore, null, 2), 'utf8');

    console.log(`✅ Ledger Cleaned!`);
    console.log(`- Removed ${oldRecordCount - cleanRecords.length} mock records.`);
    console.log(`- Final real proofs remaining: ${cleanRecords.filter(r => r.ipfsUri).length}`);
}

cleanup();
