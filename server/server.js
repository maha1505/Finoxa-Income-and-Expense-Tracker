const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));

app.use(cors({
    origin: function (origin, callback) {
        // If CLIENT_URL is set, enforce it; otherwise allow all (dev/first deploy)
        if (!process.env.CLIENT_URL) {
            return callback(null, true);
        }
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            process.env.CLIENT_URL
        ].filter(Boolean);
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            return callback(null, true);
        }
        return callback(new Error('CORS: Origin not allowed: ' + origin), false);
    },
    credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));


// Routes Configuration
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/behavior', require('./routes/behavior'));

// Serve Static Assets in Production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*path', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('Expense Tracker API is running');
    });
}

// Error Handler
app.use((err, req, res, next) => {
    console.error('--- SERVER ERROR ---');
    console.error('Time:', new Date().toISOString());
    console.error('Method:', req.method);
    console.error('URL:', req.originalUrl);
    console.error('Body:', req.body);
    console.error('Stack:', err.stack);
    console.error('--------------------');
    
    res.status(500).json({ 
        msg: 'Server Error', 
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
