const express = require('express');
const multer = require('multer');
const { uploadAndVerify, mintCredit, getVerificationByHash } = require('../controllers/uploadController');
const { getWallet, redeemCatalogItem, getMarketListings, createListing, purchaseListing } = require('../controllers/marketplaceController');
const { rateLimiter } = require('../middleware/rateLimiter');
const { getESGSummary } = require('../controllers/esgController');

const router = express.Router();

// --- IMAGE VERIFICATION ---
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (!file.mimetype || !file.mimetype.startsWith('image/')) {
			return cb(new Error('Only image uploads are allowed'));
		}
		return cb(null, true);
	}
});

router.post('/upload', rateLimiter, upload.single('image'), uploadAndVerify);
router.post('/mint-credit', mintCredit);
router.get('/verify/:imageHash', getVerificationByHash);

// --- MARKETPLACE & WALLET ---
router.get('/user/wallet', getWallet);
router.post('/user/wallet/redeem', redeemCatalogItem);
router.get('/marketplace/listings', getMarketListings);
router.post('/marketplace/list', createListing);
router.post('/marketplace/purchase', purchaseListing);

// --- ESG DASHBOARD ---
router.get('/esg/summary/:userId', getESGSummary);

module.exports = router;

