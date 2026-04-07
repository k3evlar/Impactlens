const fs = require('fs');
const path = require('path');

const STORE_FILE = path.join(__dirname, '..', 'src', 'data', 'fraud-store.json');

function recover() {
    if (!fs.existsSync(STORE_FILE)) return;

    const store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    let healedCount = 0;

    store.wallets.forEach(wallet => {
        wallet.transactions.forEach(tx => {
            if (tx.ipfsUri && !tx.imageHash) {
                // Find parent record by IPFS URI
                const record = store.records.find(r => r.ipfsUri === tx.ipfsUri);
                if (record) {
                    tx.imageHash = record.imageHash;
                    healedCount++;
                }
            }
        });
    });

    if (healedCount > 0) {
        fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
        console.log(`✅ Success: Healed ${healedCount} transaction records.`);
    } else {
        console.log("ℹ️ No records needed healing.");
    }
}

recover();
