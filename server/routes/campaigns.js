const express = require('express');
const db = require('../db');

const router = express.Router();

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Create a new campaign
router.post('/', requireAuth, (req, res) => {
    const { title, brandColor, questions, webhookUrl, logoData } = req.body;

    if (!title || !questions) {
        return res.status(400).json({ error: 'Title and questions are required' });
    }

    // Generate a simple unique slug (could use a library like shortid in a real app)
    const slug = Math.random().toString(36).substring(2, 8) + Date.now().toString(36).substring(4);

    try {
        // Enforce 3-Tier Limits
        const userStmt = db.prepare('SELECT plan_type, plan_expires_at FROM users WHERE id = ?');
        const user = userStmt.get(req.session.userId);
        const plan = (user?.plan_type || 'none').toLowerCase();

        // 1. Require a valid paid subscription (No free accounts)
        if (!plan || plan === 'free') {
            return res.status(403).json({
                error: 'SUBSCRIPTION_REQUIRED',
                message: 'A paid subscription is required to create and launch review campaigns. Please choose a plan.'
            });
        }

        // 2. Starter Tier Limit: Up to 5 Campaigns, no webhooks
        let finalWebhook = null;
        if (plan === 'starter') {
            const countStmt = db.prepare('SELECT COUNT(*) as count FROM campaigns WHERE user_id = ?');
            const result = countStmt.get(req.session.userId);
            if (result.count >= 5) {
                return res.status(403).json({
                    error: 'UPGRADE_REQUIRED',
                    message: 'Starter plan is limited to 5 campaigns. Upgrade to Growth (Pro) for unlimited campaigns!'
                });
            }
        } else {
            // Growth and Enterprise plans can save webhooks
            finalWebhook = webhookUrl || null;
        }

        const stmt = db.prepare(`
            INSERT INTO campaigns (user_id, title, slug, brand_color, logo_data, webhook_url, questions_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(
            req.session.userId, 
            title, 
            slug, 
            brandColor || '#000000', 
            logoData || null,
            finalWebhook,
            JSON.stringify(questions)
        );

        // Award +50 XP for creating a campaign
        const xpStmt = db.prepare("UPDATE users SET xp = xp + 50 WHERE id = ?");
        xpStmt.run(req.session.userId);

        res.status(201).json({
            id: info.lastInsertRowid,
            user_id: req.session.userId,
            title,
            slug,
            brand_color: brandColor || '#000000',
            logo_data: logoData || null,
            webhook_url: finalWebhook,
            questions: questions,
            created_at: new Date().toISOString()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error creating campaign' });
    }
});

// Get all campaigns for the logged-in user
router.get('/', requireAuth, (req, res) => {
    try {
        const stmt = db.prepare('SELECT id, title, slug, brand_color, logo_data, questions_json, created_at FROM campaigns WHERE user_id = ? ORDER BY created_at DESC');
        const campaigns = stmt.all(req.session.userId);
        
        // Parse JSON for the frontend
        campaigns.forEach(c => {
            if (c.questions_json) {
                c.questions = JSON.parse(c.questions_json);
                delete c.questions_json;
            }
        });
        
        res.json(campaigns);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching campaigns' });
    }
});

// Get a specific campaign (Public route, used by the feedback page)
router.get('/:slug', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT c.id, c.title, c.brand_color, c.logo_data, c.questions_json, u.plan_type
            FROM campaigns c
            JOIN users u ON c.user_id = u.id
            WHERE c.slug = ?
        `);
        const campaign = stmt.get(req.params.slug);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        campaign.questions = JSON.parse(campaign.questions_json);
        delete campaign.questions_json; // Don't send stringified JSON
        
        res.json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching campaign details' });
    }
});

module.exports = router;
