const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    try {
        try {
            const relaybaseResponse = await fetch('https://api.tryrelaybase.com/v1/email/single-validate', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-RB-Key': process.env.RELAYBASE_API_KEY || 'YOUR_API_KEY'
                },
                body: JSON.stringify({ email })
            });

            if (relaybaseResponse.ok) {
                const rbData = await relaybaseResponse.json();
                if (!rbData.valid) {
                    return res.status(400).json({ error: 'Please provide a valid email address.' });
                }
            } else {
                console.warn('Relaybase API returned an error status:', relaybaseResponse.status);
            }
        } catch (fetchErr) {
            console.warn('Relaybase email validation failed or fetch is not available:', fetchErr.message);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        const today = new Date().toISOString().split('T')[0];
        const stmt = db.prepare(`
            INSERT INTO users (first_name, last_name, email, password_hash, last_login_date, streak_days, xp)
            VALUES (?, ?, ?, ?, ?, 1, 0)
        `);
        
        const info = stmt.run(firstName, lastName, email, passwordHash, today);
        
        // Log the user in immediately (no active plan until subscription)
        req.session.userId = info.lastInsertRowid;
        req.session.email = email;
        req.session.firstName = firstName;
        req.session.planType = 'free';
        
        res.status(201).json({ success: true, user: { email, firstName, planType: 'free' } });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists!' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required!' });
    }

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password!' });
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password!' });
        }

        // Gamification logic
        const today = new Date().toISOString().split('T')[0];
        let newStreak = user.streak_days || 1;
        let newXp = user.xp || 0;

        if (user.last_login_date && user.last_login_date !== today) {
            const lastLogin = new Date(user.last_login_date);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate - lastLogin);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays === 1) {
                newStreak += 1;
                newXp += 20; // daily login bonus
            } else {
                newStreak = 1;
            }
            
            const updateStmt = db.prepare("UPDATE users SET last_login_date = ?, streak_days = ?, xp = ? WHERE id = ?");
            updateStmt.run(today, newStreak, newXp, user.id);
        } else if (!user.last_login_date) {
            // First time logic fallback
            const updateStmt = db.prepare("UPDATE users SET last_login_date = ? WHERE id = ?");
            updateStmt.run(today, user.id);
        }

        // Setup session
        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.firstName = user.first_name;
        req.session.planType = user.plan_type || 'free';

        res.json({ success: true, user: { email: user.email, firstName: user.first_name, planType: user.plan_type || 'free' } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// API endpoint to check if user is logged in (useful for frontend JS)
router.get('/me', (req, res) => {
    if (req.session.userId) {
        try {
            const stmt = db.prepare('SELECT plan_type, plan_expires_at, notification_frequency, xp, streak_days, squad_token FROM users WHERE id = ?');
            const user = stmt.get(req.session.userId);
            const currentPlan = user ? (user.plan_type || 'free') : 'free';
            req.session.planType = currentPlan;

            res.json({ 
                loggedIn: true, 
                email: req.session.email, 
                firstName: req.session.firstName, 
                planType: currentPlan,
                planExpiresAt: user ? user.plan_expires_at : null,
                notificationFrequency: user ? user.notification_frequency : 'immediate',
                xp: user ? user.xp : 0,
                streakDays: user ? user.streak_days : 1,
                hasAutoRenew: user ? !!user.squad_token : false
            });
        } catch (err) {
            res.status(500).json({ error: 'Server Error' });
        }
    } else {
        res.json({ loggedIn: false });
    }
});

router.put('/me/frequency', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { frequency } = req.body;
    if (!['immediate', 'daily', 'weekly', 'monthly'].includes(frequency)) {
        return res.status(400).json({ error: 'Invalid frequency' });
    }
    
    try {
        const stmt = db.prepare("UPDATE users SET notification_frequency = ? WHERE id = ?");
        stmt.run(frequency, req.session.userId);
        res.json({ success: true, notificationFrequency: frequency });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update frequency' });
    }
});

module.exports = router;
