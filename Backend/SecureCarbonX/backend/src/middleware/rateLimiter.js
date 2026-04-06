const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

const ipBucket = new Map();

function rateLimiter(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();

    const state = ipBucket.get(ip) || { count: 0, start: now };

    if (now - state.start > WINDOW_MS) {
        state.count = 0;
        state.start = now;
    }

    state.count += 1;
    ipBucket.set(ip, state);

    if (state.count > MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({
            error: 'Rate limit exceeded. Please slow down uploads.',
            retryAfterSeconds: Math.ceil((WINDOW_MS - (now - state.start)) / 1000)
        });
    }

    return next();
}

module.exports = {
    rateLimiter
};
