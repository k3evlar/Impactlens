require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

app.use((err, req, res, next) => {
    if (!err) {
        return next();
    }

    if (err.message && err.message.includes('Only image uploads are allowed')) {
        return res.status(400).json({ error: err.message });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image exceeds 10MB upload limit.' });
    }

    return res.status(500).json({ error: 'Unexpected server error.' });
});

app.get('/', (req, res) => {
    res.json({ message: "SecureCarbonX Backend Orchestrator is running." });
});

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
