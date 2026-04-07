const fs = require('fs');
const path = require('path');

const STORE_FILE = path.join(__dirname, '..', 'src', 'data', 'fraud-store.json');

function cleanup() {
    if (!fs.existsSync(STORE_FILE)) return;

    const store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    let correctedCount = 0;

    store.wallets.forEach(wallet => {
        const oldCredits = wallet.credits;
        wallet.credits = Math.round(wallet.credits * 100) / 100;
        wallet.totalEarned = Math.round(wallet.totalEarned * 100) / 100;
        wallet.totalSpent = Math.round(wallet.totalSpent * 100) / 100;
        
        if (oldCredits !== wallet.credits) correctedCount++;
    });

    if (correctedCount > 0) {
        fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
        console.log(`✅ Success: Scrubbed ${correctedCount} wallets of precision errors.`);
    } else {
        console.log("ℹ️ No precision errors found in wallets.");
    }
}

cleanup();
