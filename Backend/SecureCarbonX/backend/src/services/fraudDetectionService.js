const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Jimp = require('jimp');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'fraud-store.json');
const LOG_FILE = path.join(DATA_DIR, 'suspicious-activity.log');

const SESSION_WINDOW_MS = 2 * 60 * 1000;
const MAX_UPLOADS_PER_SESSION_WINDOW = 5;

const DUPLICATE_SIMILARITY_HARD = 0.985;
const DUPLICATE_SIMILARITY_SOFT = 0.95;

function ensureStore() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(STORE_FILE)) {
        fs.writeFileSync(STORE_FILE, JSON.stringify({ records: [] }, null, 2), 'utf8');
    }
}

function readStore() {
    ensureStore();

    try {
        const raw = fs.readFileSync(STORE_FILE, 'utf8');
        const parsed = JSON.parse(raw);

        if (!parsed.records || !Array.isArray(parsed.records)) {
            return { records: [] };
        }

        return parsed;
    } catch (error) {
        return { records: [] };
    }
}

function writeStore(store) {
    ensureStore();
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function logSuspiciousActivity(event) {
    ensureStore();
    const line = `${new Date().toISOString()} ${JSON.stringify(event)}\n`;
    fs.appendFileSync(LOG_FILE, line, 'utf8');
}

function calculateImageHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function createPerceptualFingerprint(buffer) {
    try {
        const image = await Jimp.read(buffer);
        image.resize(32, 32).grayscale();
        return image.hash();
    } catch (error) {
        return calculateImageHash(buffer).slice(0, 16);
    }
}

function compareHashes(hashA, hashB) {
    if (!hashA || !hashB) {
        return 0;
    }

    try {
        const distance = Jimp.distanceFromHash(hashA, hashB); // 0 identical ... 1 totally different
        return 1 - distance;
    } catch (error) {
        let same = 0;
        const length = Math.min(hashA.length, hashB.length);
        for (let index = 0; index < length; index += 1) {
            if (hashA[index] === hashB[index]) {
                same += 1;
            }
        }
        return length > 0 ? same / length : 0;
    }
}

function parseTimestamp(value) {
    if (!value) {
        return null;
    }

    const numeric = Number(value);
    if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
        const asMs = numeric < 1e12 ? numeric * 1000 : numeric;
        return asMs;
    }

    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
        return null;
    }

    return parsed;
}

function evaluateTimestamp(timestampMs) {
    if (!timestampMs) {
        return {
            valid: true,
            warnings: ['MISSING_CAPTURE_TIMESTAMP'],
            reason: 'timestamp missing'
        };
    }

    const now = Date.now();
    const maxFutureDrift = 10 * 60 * 1000;
    const maxAge = 90 * 24 * 60 * 60 * 1000;

    if (timestampMs > now + maxFutureDrift) {
        return {
            valid: false,
            warnings: ['INVALID_METADATA_TIMESTAMP'],
            reason: 'timestamp too far in future'
        };
    }

    if (timestampMs < now - maxAge) {
        return {
            valid: false,
            warnings: ['STALE_METADATA_TIMESTAMP'],
            reason: 'timestamp too old'
        };
    }

    return {
        valid: true,
        warnings: [],
        reason: 'timestamp valid'
    };
}

function resolveSessionKey(req) {
    return req.body.sessionId || req.headers['x-session-id'] || req.ip;
}

function resolveUserKey(req) {
    return req.body.userId || req.headers['x-user-id'] || 'anonymous';
}

function validateFile(file) {
    if (!file) {
        return { valid: false, reason: 'missing image file', code: 'MISSING_IMAGE' };
    }

    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        return { valid: false, reason: 'invalid file type', code: 'INVALID_FILE_TYPE' };
    }

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
        return { valid: false, reason: 'file too large', code: 'IMAGE_TOO_LARGE' };
    }

    return { valid: true };
}

/**
 * Evaluates image characteristics to detect potential internet/stock images.
 * Stock images often have high resolution, low noise, and typical aspect ratios.
 */
function analyzeImageHeuristics(file) {
    const flags = [];
    let risk = 0;

    // 1. Resolution Check
    // Pro-level resolution without noise often suggests stock photography
    const sizeInKB = file.size / 1024;
    
    // Very small files with high perceived quality are suspicious (over-optimized/web-saved)
    if (sizeInKB < 50 && file.mimetype === 'image/jpeg') {
        flags.push('LOW_IMAGE_DENSITY');
        risk += 15;
    }

    // 2. Format check
    if (file.mimetype === 'image/webp' || file.mimetype === 'image/gif') {
        flags.push('NON_STANDARD_CAPTURE_FORMAT');
        risk += 10;
    }

    return { risk, flags };
}

async function runFraudChecks(req) {
    const fileValidation = validateFile(req.file);
    if (!fileValidation.valid) {
        return {
            verified: false,
            status: 'rejected',
            reason: fileValidation.reason,
            flags: [fileValidation.code],
            fraudScore: 100,
            riskPenalty: 60
        };
    }

    const imageHash = calculateImageHash(req.file.buffer);
    const fingerprint = await createPerceptualFingerprint(req.file.buffer);
    const heuristics = analyzeImageHeuristics(req.file);

    const store = readStore();
    const now = Date.now();
    const sessionKey = resolveSessionKey(req);
    const userKey = resolveUserKey(req);

    const records = store.records || [];
    const mintedRecords = records.filter((record) => record.minted === true);
    
    const flags = [...heuristics.flags];
    let riskPenalty = heuristics.risk;
    let reason = 'valid';
    let maxSimilarity = 0;
    let matchedRecordHash = null;

    // 1. Multi-User Duplicate Check (Persistent Hash) - Now scoped to same session for demo
    for (const record of mintedRecords) {
        if (record.sessionKey === sessionKey) { // Only check duplicates within the same session
            const similarity = compareHashes(record.fingerprint, fingerprint);
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                matchedRecordHash = record.imageHash;
            }
        }
    }

    if (maxSimilarity >= DUPLICATE_SIMILARITY_HARD) {
        flags.push('DUPLICATE_CLAIM_DETECTED');
        riskPenalty += 40;
        reason = 'duplicate of existing minted record';
    } else if (maxSimilarity >= DUPLICATE_SIMILARITY_SOFT) {
        flags.push('HIGH_SIMILARITY_WARNING');
        riskPenalty += 20;
    }

    // 2. Upload Frequency / Rate Limiting
    const recentSessionUploads = records.filter((record) => {
        return record.sessionKey === sessionKey && now - record.createdAt < SESSION_WINDOW_MS;
    });

    if (recentSessionUploads.length >= MAX_UPLOADS_PER_SESSION_WINDOW) {
        flags.push('RAPID_UPLOAD_PATTERN');
        riskPenalty += 15;
    }

    // 3. Metadata Integrity
    const captureTimestamp = parseTimestamp(
        req.body.captureTimestamp || req.body.timestamp || req.body.clientTimestamp
    );
    const timestampEval = evaluateTimestamp(captureTimestamp);

    if (!timestampEval.valid) {
        flags.push(...timestampEval.warnings);
        riskPenalty += 15;
    } else if (timestampEval.warnings.length > 0) {
        flags.push(...timestampEval.warnings);
        riskPenalty += 5;
    }

    // 4. Resolve Status
    const fraudScore = Math.min(100, riskPenalty);
    let status = 'verified';
    if (fraudScore > 45) status = 'rejected';
    else if (fraudScore > 20) status = 'suspicious';

    return {
        verified: status !== 'rejected',
        status,
        reason,
        flags,
        fraudScore,
        riskPenalty,
        similarityScore: Number(maxSimilarity.toFixed(4)),
        imageHash,
        fingerprint,
        matchedRecordHash,
        sessionKey,
        userKey,
        captureTimestamp: captureTimestamp || null
    };
}

function storeFraudRecord(record) {
    const store = readStore();

    store.records.push({
        imageHash: record.imageHash,
        fingerprint: record.fingerprint,
        createdAt: Date.now(),
        ip: record.ip,
        userKey: record.userKey,
        sessionKey: record.sessionKey,
        finalDecision: record.finalDecision,
        trustScore: record.trustScore,
        similarityScore: record.similarityScore ?? null,
        activity: record.activity || null,
        ipfsUri: record.ipfsUri || null,
        minted: record.minted === true,
        mintedAt: record.minted === true ? Date.now() : null,
        mintTxId: record.mintTxId || null,
        impactScore: record.impactScore || 0,
        // Phase 2 Metadata
        trustBreakdown: record.trustBreakdown || null,
        impact: record.impact || null,
        explanation: record.explanation || null,
        detections: record.detections || null
    });

    writeStore(store);
}

function markCreditAsMinted({ imageHash, ipfsUri, mintTxId }) {
    const store = readStore();
    const now = Date.now();

    const records = store.records || [];
    const candidates = records.filter((record) => {
        const matchesImageHash = imageHash && record.imageHash === imageHash;
        const matchesIpfsUri = ipfsUri && record.ipfsUri === ipfsUri;

        if (imageHash && ipfsUri) {
            return matchesImageHash && matchesIpfsUri;
        }

        return matchesImageHash || matchesIpfsUri;
    });

    const targetRecord = candidates
        .slice()
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];

    if (!targetRecord) {
        return {
            success: false,
            errorCode: 'NO_MATCHING_UPLOAD',
            message: 'No matching upload found to mint'
        };
    }

    if (targetRecord.minted === true) {
        return {
            success: false,
            errorCode: 'ALREADY_MINTED',
            message: 'This upload has already been minted',
            record: targetRecord
        };
    }

    const existingMintedForHash = records.find((record) => {
        if (!record || record.minted !== true) {
            return false;
        }

        // Only block if it's the same image AND the same session
        return record.imageHash === targetRecord.imageHash && record.sessionKey === targetRecord.sessionKey;
    });

    if (existingMintedForHash) {
        return {
            success: false,
            errorCode: 'DUPLICATE_IMAGE_ALREADY_MINTED',
            message: 'Duplicate image cannot be used to mint again',
            record: existingMintedForHash
        };
    }

    const updatedRecords = records.map((record) => {
        if (record.imageHash !== targetRecord.imageHash || (targetRecord.ipfsUri && record.ipfsUri !== targetRecord.ipfsUri)) {
            return record;
        }

        return {
            ...record,
            minted: true,
            mintedAt: record.mintedAt || now,
            mintTxId: mintTxId || record.mintTxId || null
        };
    });

    store.records = updatedRecords;
    writeStore(store);

    const mintedRecord = updatedRecords.find((record) => {
        if (imageHash && ipfsUri) {
            return record.imageHash === imageHash && record.ipfsUri === ipfsUri;
        }

        return record.imageHash === targetRecord.imageHash && record.createdAt === targetRecord.createdAt;
    }) || null;

    return {
        success: true,
        record: mintedRecord
    };
}

function getPublicVerificationData(imageHash) {
    const store = readStore();
    const record = store.records.find(r => r.imageHash === imageHash);
    
    if (!record) return null;

    return {
        success: true,
        verified: record.finalDecision === 'ACCEPT',
        trustScore: record.trustScore,
        trust_score: record.trustScore,
        activity: record.activity,
        explanation: record.explanation,
        impact: record.impact,
        trustBreakdown: record.trustBreakdown,
        detections: record.detections,
        ipfsUri: record.ipfsUri,
        imageHash: record.imageHash,
        minted: record.minted,
        impactScore: record.impactScore,
        impact_score: record.impactScore,
        narrative: record.narrative,
        mintTxId: record.mintTxId,
        createdAt: record.createdAt,
        finalDecision: record.finalDecision
    };
}

function resetLedger() {
    const emptyStore = {
        wallets: [],
        marketplaceListings: [],
        records: []
    };
    writeStore(emptyStore);
    return true;
}

module.exports = {
    runFraudChecks,
    storeFraudRecord,
    markCreditAsMinted,
    calculateImageHash,
    createPerceptualFingerprint,
    getPublicVerificationData,
    readStore,
    writeStore,
    resetLedger
};
