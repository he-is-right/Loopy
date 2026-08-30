const express = require('express');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const responseRoutes = require('./routes/responses');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'super-secret-loopy-key';

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure Sessions
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

// Serve Static Frontend Files (React Production Build)
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/payment', paymentRoutes);

// Catch-all route to serve index.html for client-side routing in production
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        const indexPath = path.join(__dirname, '../client/dist/index.html');
        res.sendFile(indexPath, (err) => {
            if (err) {
                res.status(200).send('Loopy API server is active. Client build not found or running in dev mode.');
            }
        });
    }
});

// START THE SERVER
const cronService = require('./services/cronService');

app.listen(PORT, () => {
    console.log(`Loopy API Server is running on port ${PORT}!`);
    cronService.start();
    console.log(`Cron scheduler started.`);
});
