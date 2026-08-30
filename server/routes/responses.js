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

// Submit a new response (Public)
router.post('/:slug', (req, res) => {
    const { answers } = req.body;
    const slug = req.params.slug;

    if (!answers) {
        return res.status(400).json({ error: 'Answers are required' });
    }

    try {
        // Find the campaign id by slug, and get the owner's email and notification frequency
        const campStmt = db.prepare(`
            SELECT c.id, c.user_id, c.title, c.webhook_url, u.email as owner_email, u.notification_frequency 
            FROM campaigns c
            JOIN users u ON c.user_id = u.id
            WHERE c.slug = ?
        `);
        const campaign = campStmt.get(slug);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const stmt = db.prepare(`
            INSERT INTO responses (campaign_id, answers_json, status)
            VALUES (?, ?, 'new')
        `);
        const info = stmt.run(campaign.id, JSON.stringify(answers));
        const responseId = info.lastInsertRowid;

        // Gamification: Award +10 XP to campaign owner
        const xpStmt = db.prepare("UPDATE users SET xp = xp + 10 WHERE id = ?");
        xpStmt.run(campaign.user_id);

        // Critical Feedback Escalation: Force immediate notification for ratings ≤ 2
        let isCritical = false;
        if (Array.isArray(answers)) {
            isCritical = answers.some(a => a.type === 'rating' && Number(a.value) <= 2);
        } else if (answers.rating && Number(answers.rating) <= 2) {
            isCritical = true;
        }

        // Trigger Notification Service
        const notificationService = require('../services/notificationService');
        notificationService.notify(
            campaign.user_id,
            campaign.owner_email,
            isCritical ? 'immediate' : campaign.notification_frequency,
            campaign,
            answers,
            responseId,
            isCritical
        ).catch(err => console.error("Notification Service failed:", err));

        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error submitting response' });
    }
});

// Get all responses for a specific campaign (Protected)
router.get('/campaign/:campaignId', requireAuth, (req, res) => {
    const campaignId = req.params.campaignId;

    try {
        // First verify this campaign belongs to the user
        const campStmt = db.prepare('SELECT id FROM campaigns WHERE id = ? AND user_id = ?');
        const campaign = campStmt.get(campaignId, req.session.userId);

        if (!campaign) {
            return res.status(403).json({ error: 'Forbidden or Campaign not found' });
        }

        const stmt = db.prepare('SELECT id, answers_json, status, created_at FROM responses WHERE campaign_id = ? ORDER BY created_at DESC');
        const responses = stmt.all(campaignId);

        // Parse JSON for the frontend
        responses.forEach(r => {
            r.answers = JSON.parse(r.answers_json);
            delete r.answers_json;
        });

        res.json(responses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching responses' });
    }
});

// Get analytics for a specific campaign (Protected)
router.get('/campaign/:campaignId/analytics', requireAuth, (req, res) => {
    const campaignId = req.params.campaignId;

    try {
        // Verify this campaign belongs to the user
        const campStmt = db.prepare('SELECT id, questions_json FROM campaigns WHERE id = ? AND user_id = ?');
        const campaign = campStmt.get(campaignId, req.session.userId);

        if (!campaign) {
            return res.status(403).json({ error: 'Forbidden or Campaign not found' });
        }

        // Total responses
        const totalStmt = db.prepare('SELECT COUNT(*) as total FROM responses WHERE campaign_id = ?');
        const { total } = totalStmt.get(campaignId);

        // Responses today
        const todayStmt = db.prepare("SELECT COUNT(*) as count FROM responses WHERE campaign_id = ? AND date(created_at) = date('now')");
        const { count: todayCount } = todayStmt.get(campaignId);

        // Responses this week
        const weekStmt = db.prepare("SELECT COUNT(*) as count FROM responses WHERE campaign_id = ? AND created_at >= datetime('now', '-7 days')");
        const { count: weekCount } = weekStmt.get(campaignId);

        // Responses this month
        const monthStmt = db.prepare("SELECT COUNT(*) as count FROM responses WHERE campaign_id = ? AND created_at >= datetime('now', '-30 days')");
        const { count: monthCount } = monthStmt.get(campaignId);

        // Fetch all responses to compute rating analytics
        const allStmt = db.prepare('SELECT answers_json, created_at FROM responses WHERE campaign_id = ? ORDER BY created_at ASC');
        const allResponses = allStmt.all(campaignId);

        // Star breakdown and average
        const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let ratingSum = 0;
        let ratingCount = 0;

        allResponses.forEach(r => {
            const answers = JSON.parse(r.answers_json);
            let rating = 0;
            if (Array.isArray(answers)) {
                const ratingAns = answers.find(a => a.type === 'rating');
                if (ratingAns) rating = Number(ratingAns.value);
            } else if (answers.rating) {
                rating = Number(answers.rating);
            }
            if (rating >= 1 && rating <= 5) {
                starCounts[rating]++;
                ratingSum += rating;
                ratingCount++;
            }
        });

        const averageRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '0.0';

        // Weekly trend (last 8 weeks)
        const weeklyTrend = [];
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() - (i * 7));
            
            let weekRatingSum = 0;
            let weekRatingCount = 0;
            let weekResponseCount = 0;

            allResponses.forEach(r => {
                const createdAt = new Date(r.created_at);
                if (createdAt >= weekStart && createdAt < weekEnd) {
                    weekResponseCount++;
                    const answers = JSON.parse(r.answers_json);
                    let rating = 0;
                    if (Array.isArray(answers)) {
                        const ratingAns = answers.find(a => a.type === 'rating');
                        if (ratingAns) rating = Number(ratingAns.value);
                    } else if (answers.rating) {
                        rating = Number(answers.rating);
                    }
                    if (rating >= 1 && rating <= 5) {
                        weekRatingSum += rating;
                        weekRatingCount++;
                    }
                }
            });

            weeklyTrend.push({
                label: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                responses: weekResponseCount,
                avgRating: weekRatingCount > 0 ? (weekRatingSum / weekRatingCount).toFixed(1) : null
            });
        }

        res.json({
            total,
            todayCount,
            weekCount,
            monthCount,
            averageRating: Number(averageRating),
            starCounts,
            weeklyTrend
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error computing analytics' });
    }
});

// Update response status (Protected) — New → Reviewing → Resolved
router.patch('/:id/status', requireAuth, (req, res) => {
    const responseId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['new', 'reviewing', 'resolved'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        // Verify the response belongs to a campaign owned by this user
        const checkStmt = db.prepare(`
            SELECT r.id, r.status as current_status, c.user_id
            FROM responses r
            JOIN campaigns c ON r.campaign_id = c.id
            WHERE r.id = ? AND c.user_id = ?
        `);
        const response = checkStmt.get(responseId, req.session.userId);

        if (!response) {
            return res.status(404).json({ error: 'Response not found or access denied' });
        }

        const updateStmt = db.prepare('UPDATE responses SET status = ? WHERE id = ?');
        updateStmt.run(status, responseId);

        // Gamification: Award +25 XP for resolving a customer issue (meaningful business action)
        if (status === 'resolved' && response.current_status !== 'resolved') {
            const xpStmt = db.prepare("UPDATE users SET xp = xp + 25 WHERE id = ?");
            xpStmt.run(req.session.userId);
        }

        res.json({ message: 'Status updated', status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating response status' });
    }
});

module.exports = router;
