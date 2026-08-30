const nodemailer = require('nodemailer');
const db = require('../db');

// In a real app, these would come from environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.ethereal.email';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER || 'ethereal_user';
const SMTP_PASS = process.env.SMTP_PASS || 'ethereal_pass';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@loopy.com';

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }
});

class NotificationService {
    async notify(userId, userEmail, userFrequency, campaign, answers, responseId, isCritical = false) {
        // 1. Process Webhooks immediately (independent of email frequency)
        if (campaign.webhook_url) {
            this.sendWebhook(campaign, answers).catch(err => console.error("Webhook failed:", err));
        }

        // 2. Process Email notification based on frequency preference
        if (userFrequency === 'immediate' || !userFrequency) {
            await this.sendImmediateEmail(userEmail, campaign, answers, isCritical);
        } else {
            // Save to pending_notifications for cron processing (daily/weekly/monthly)
            this.savePendingNotification(userId, campaign.id, responseId);
        }
    }

    async sendWebhook(campaign, answers) {
        let markdownText = `*New Feedback for ${campaign.title}*\n`;
        
        if (Array.isArray(answers)) {
            answers.forEach((ans, idx) => {
                markdownText += `*Q${idx + 1}:* ${ans.value}\n`;
            });
        } else {
            markdownText += `*Rating:* ${answers.rating}/5\n*Feedback:* ${answers.text}\n`;
        }

        const response = await fetch(campaign.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: markdownText })
        });
        
        if (!response.ok) {
            throw new Error(`Webhook responded with status ${response.status}`);
        }
    }

    async sendImmediateEmail(toEmail, campaign, answers, isCritical = false) {
        let htmlContent = '';
        
        if (isCritical) {
            htmlContent += `<div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:8px;padding:16px;margin-bottom:16px"><strong style="color:#dc2626">🚨 CRITICAL: Low rating received (≤ 2/5)</strong><br><span style="color:#7f1d1d">This feedback requires immediate attention.</span></div>`;
        }
        
        htmlContent += `<h2>New Feedback for ${campaign.title}</h2><ul>`;
        
        if (Array.isArray(answers)) {
            answers.forEach((ans, idx) => {
                htmlContent += `<li><strong>Q${idx + 1}:</strong> ${ans.value}</li>`;
            });
        } else {
            htmlContent += `<li><strong>Rating:</strong> ${answers.rating}/5</li>`;
            htmlContent += `<li><strong>Feedback:</strong> ${answers.text}</li>`;
        }
        htmlContent += `</ul>`;

        try {
            await transporter.sendMail({
                from: FROM_EMAIL,
                to: toEmail,
                subject: isCritical 
                    ? `🚨 CRITICAL: Low rating on ${campaign.title} — Immediate attention required`
                    : `New response on ${campaign.title}`,
                html: htmlContent
            });
            console.log(`[NotificationService] Sent immediate email to ${toEmail}`);
        } catch (err) {
            console.error(`[NotificationService] Failed to send email to ${toEmail}:`, err);
        }
    }

    savePendingNotification(userId, campaignId, responseId) {
        try {
            const stmt = db.prepare(`
                INSERT INTO pending_notifications (user_id, campaign_id, response_id)
                VALUES (?, ?, ?)
            `);
            stmt.run(userId, campaignId, responseId);
            console.log(`[NotificationService] Saved pending notification for User ${userId}`);
        } catch (err) {
            console.error(`[NotificationService] Failed to save pending notification:`, err);
        }
    }
}

module.exports = new NotificationService();
