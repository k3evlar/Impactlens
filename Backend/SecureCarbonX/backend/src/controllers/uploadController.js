const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');
const { runFraudChecks, storeFraudRecord, markCreditAsMinted, getPublicVerificationData, calculateImageHash, readStore } = require('../services/fraudDetectionService');
const { addCredits } = require('../services/walletService');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

function createMockIpfsUri(imageHash) {
    return `ipfs://mock-${imageHash.substring(0, 32)}`;
}

async function uploadAndVerify(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
        const imageHash = calculateImageHash(req.file.buffer);
        const store = readStore();
        const records = store?.records || [];
        
        // Detect session for basic context
        const sessionKey = req.body.sessionId || req.ip;
        const existsInSession = records.some(r => r.imageHash === imageHash && r.sessionKey === sessionKey);
        const isReevaluation = (existsInSession || req.body.isReevaluation === 'true');

        // 1. Call ImpactLens AI (Vision + Gemini Reasoning)
        const aiFormData = new FormData();
        aiFormData.append('file', req.file.buffer, {
            filename: req.file.originalname || 'image.jpg',
            contentType: req.file.mimetype || 'image/jpeg',
            knownLength: req.file.buffer.length
        });

        const userDescription = req.body.description || '';
        aiFormData.append('description', userDescription);

        const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze-image`, aiFormData, {
            headers: {
                ...aiFormData.getHeaders()
            }
        });

        const aiResult = aiResponse.data;

        // 2. Map to ImpactLens Schema
        const impactScore = aiResult.impact_score || 0;
        const impactLevel = aiResult.impact_level || 'Moderate';
        const activity = aiResult.activity || 'unknown';
        
        // Threshold for basic verifiable proof (Increased to 60 for strict verification)
        const finalDecision = impactScore >= 60 ? 'ACCEPT' : 'REJECT';
        
        const recordData = {
            imageHash,
            ip: req.ip,
            sessionKey,
            finalDecision,
            status: impactLevel.toLowerCase(),
            impactScore,
            activity,
            explanation: aiResult.detailed_explanation,
            impactSummary: aiResult.impact_summary,
            narrative: aiResult.narrative,
            what_is_happening: aiResult.what_is_happening || '',
            improvements: aiResult.improvements || [],
            reasoning: aiResult.reasoning || [],
            suggestions: aiResult.suggestions || [],
            detections: aiResult.detections || [],
            isReevaluation,
            previewUrl: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
            ipfsUri: null
        };

        // --- IMPACT AUDIT LOG ---
        console.log(`\n=== IMPACTLENS AI AUDIT [${imageHash.substring(0, 8)}] ===`);
        console.log(`Activity: ${activity} | Impact Score: ${impactScore} | Level: ${impactLevel}`);
        console.log(`Narrative: ${recordData.narrative}`);
        console.log(`What is happening: ${recordData.what_is_happening}`);
        console.log(`Improvements: [${recordData.improvements?.length || 0} items]`);
        console.log(`===========================================\n`);

        if (finalDecision === 'REJECT') {
            storeFraudRecord(recordData);
            return res.json({
                success: false,
                verified: false,
                ...recordData
            });
        }

        // 3. Optional: Upload to IPFS via Pinata
        let ipfsUri;
        let storageMode = 'mock';

        if (process.env.PINATA_JWT) {
            const pinataFormData = new FormData();
            pinataFormData.append('file', req.file.buffer, {
                filename: `${imageHash}.jpg`,
                contentType: req.file.mimetype,
            });

            const pinataResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", pinataFormData, {
                headers: {
                    ...pinataFormData.getHeaders(),
                    Authorization: `Bearer ${process.env.PINATA_JWT}`
                }
            });

            ipfsUri = `ipfs://${pinataResponse.data.IpfsHash}`;
            storageMode = 'pinata';
        } else {
            ipfsUri = createMockIpfsUri(imageHash);
        }

        recordData.ipfsUri = ipfsUri;
        storeFraudRecord(recordData);

        // 3.5. Update USER WALLET (Real Backend Persistence)
        if (finalDecision === 'ACCEPT') {
            addCredits(sessionKey, impactScore / 10);
        }

        // 4. Return Final ImpactLens Result
        return res.json({
            success: true,
            verified: true,
            ...recordData,
            storageMode,
            minted: false,
            impact_score: impactScore // for extra compatibility
        });

    } catch (error) {
        console.error("ImpactLens Upload Error:", error.message);
        if (error.response) {
             console.error("AI Service Response:", error.response.data);
        }
        res.status(500).json({ error: 'ImpactLens Internal Error.' });
    }
}

async function mintCredit(req, res) {
    const { imageHash, ipfsUri, mintTxId } = req.body || {};
    if (!imageHash && !ipfsUri) {
        return res.status(400).json({ error: 'imageHash or ipfsUri is required' });
    }
    try {
        const mintResult = markCreditAsMinted({ imageHash, ipfsUri, mintTxId });
        if (!mintResult || !mintResult.success) {
            return res.status(400).json({ error: mintResult?.message || 'Minting failed' });
        }
        return res.json({ success: true, minted: true, ...mintResult.record });
    } catch (error) {
        return res.status(500).json({ error: 'Minting service error' });
    }
}

async function getVerificationByHash(req, res) {
    const { imageHash } = req.params;
    try {
        const data = getPublicVerificationData(imageHash);
        if (!data) return res.status(404).json({ error: 'Record not found' });
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Fetch error' });
    }
}

module.exports = {
    uploadAndVerify,
    mintCredit,
    getVerificationByHash
};
