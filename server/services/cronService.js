const cron = require('node-cron');
const db = require('../db');
const nodemailer = require('nodemailer');
const squadService = require('./squadService');

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

class CronService {
    start() {
        // Daily Summary: Runs every day at 18:00 (6 PM)
        cron.schedule('0 18 * * *', () => {
            console.log('[CronService] Running daily summary job...');
            this.processSummaries('daily');
        });

        // Weekly Summary: Runs every Friday at 18:00
        cron.schedule('0 18 * * 5', () => {
            console.log('[CronService] Running weekly summary job...');
            this.processSummaries('weekly');
        });

        // Monthly Summary: Runs on the last day of the month at 18:00
        // (Simplified cron for demo purposes, 28th to cover all months)
        cron.schedule('0 18 28 * *', () => {
            console.log('[CronService] Running monthly summary job...');
            this.processSummaries('monthly');
        });

        // Daily Subscriptions Renewal: Runs every day at 00:00 (Midnight)
        cron.schedule('0 0 * * *', () => {
            console.log('[CronService] Running daily subscription renewal job...');
            this.processRenewals();
        });
    }

    async processRenewals() {
        try {
            const usersStmt = db.prepare(`
                SELECT id, email, first_name, plan_type, plan_is_annual, squad_token, plan_expires_at, renewal_failed_attempts
                FROM users
                WHERE plan_type != 'free' 
                  AND squad_token IS NOT NULL
                  AND plan_expires_at <= datetime('now')
            `);
            const users = usersStmt.all();

            for (const user of users) {
                await this.attemptRenewal(user);
            }
        } catch (err) {
            console.error('[CronService] Error processing renewals:', err);
        }
    }

    async attemptRenewal(user) {
        const plan = squadService.getPlanDetails(user.plan_type);
        if (!plan) return;

        const amount = user.plan_is_annual ? plan.annualAmount : plan.monthlyAmount;
        const amountInKobo = amount * 100;
        const transactionRef = squadService.generateTransactionRef('REN');

        try {
            console.log(`[CronService] Attempting to renew ${user.plan_type} plan for ${user.email}`);
            
            const result = await squadService.chargeCard({
                amountInKobo,
                tokenId: user.squad_token,
                transactionRef
            });

            if (result.status) {
                const days = user.plan_is_annual ? 365 : 30;
                const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
                
                db.prepare("UPDATE users SET plan_expires_at = ?, renewal_failed_attempts = 0 WHERE id = ?").run(expiresAt, user.id);
                db.prepare(`INSERT INTO transactions (user_id, transaction_ref, plan_type, amount, currency, status) VALUES (?, ?, ?, ?, 'NGN', 'success')`).run(user.id, transactionRef, user.plan_type, amount);

                await this.sendReceiptEmail(user, amount, plan.name);
            } else {
                await this.handleRenewalFailure(user);
            }
        } catch (err) {
            console.error(`[CronService] Renewal failed for user ${user.id}:`, err);
            await this.handleRenewalFailure(user);
        }
    }

    async handleRenewalFailure(user) {
        const attempts = (user.renewal_failed_attempts || 0) + 1;
        
        if (attempts >= 3) {
            console.log(`[CronService] User ${user.email} failed renewal 3 times. Downgrading to FREE.`);
            db.prepare("UPDATE users SET plan_type = 'free', squad_token = NULL, renewal_failed_attempts = 0 WHERE id = ?").run(user.id);
            await this.sendDowngradeEmail(user);
        } else {
            console.log(`[CronService] User ${user.email} failed renewal attempt ${attempts}. Grace period active.`);
            db.prepare("UPDATE users SET renewal_failed_attempts = ? WHERE id = ?").run(attempts, user.id);
            await this.sendFailedRenewalEmail(user, attempts);
        }
    }

    async processSummaries(frequency) {
        try {
            // Find users who have this frequency preference and have pending notifications
            const usersStmt = db.prepare(`
                SELECT DISTINCT u.id, u.email, u.first_name 
                FROM users u
                JOIN pending_notifications pn ON u.id = pn.user_id
                WHERE u.notification_frequency = ?
            `);
            const users = usersStmt.all(frequency);

            for (const user of users) {
                await this.sendSummaryEmail(user);
            }
        } catch (err) {
            console.error(`[CronService] Error processing ${frequency} summaries:`, err);
        }
    }

    async sendSummaryEmail(user) {
        try {
            // Fetch all pending responses for this user
            const pendingStmt = db.prepare(`
                SELECT pn.id as pending_id, c.title as campaign_title, r.answers_json, r.created_at
                FROM pending_notifications pn
                JOIN campaigns c ON pn.campaign_id = c.id
                JOIN responses r ON pn.response_id = r.id
                WHERE pn.user_id = ?
            `);
            const pendingNotifs = pendingStmt.all(user.id);

            if (pendingNotifs.length === 0) return;

            let htmlContent = `<h2>Hello ${user.first_name}, here is your feedback summary!</h2>`;
            htmlContent += `<p>You have received ${pendingNotifs.length} new response(s).</p>`;
            
            pendingNotifs.forEach(notif => {
                const answers = JSON.parse(notif.answers_json);
                htmlContent += `<h3>Campaign: ${notif.campaign_title} (${new Date(notif.created_at).toLocaleDateString()})</h3><ul>`;
                
                if (Array.isArray(answers)) {
                    answers.forEach((ans, idx) => {
                        htmlContent += `<li><strong>Q${idx + 1}:</strong> ${ans.value}</li>`;
                    });
                } else {
                    htmlContent += `<li><strong>Rating:</strong> ${answers.rating}/5</li>`;
                    htmlContent += `<li><strong>Feedback:</strong> ${answers.text}</li>`;
                }
                htmlContent += `</ul><hr/>`;
            });

            // Send the email
            await transporter.sendMail({
                from: FROM_EMAIL,
                to: user.email,
                subject: `Your Loopy Feedback Summary`,
                html: htmlContent
            });

            console.log(`[CronService] Sent summary email to ${user.email}`);

            // Delete processed notifications
            const pendingIds = pendingNotifs.map(pn => pn.pending_id);
            if (pendingIds.length > 0) {
                const placeholders = pendingIds.map(() => '?').join(',');
                const deleteStmt = db.prepare(`DELETE FROM pending_notifications WHERE id IN (${placeholders})`);
                deleteStmt.run(...pendingIds);
            }
        } catch (err) {
            console.error(`[CronService] Error sending summary to user ${user.id}:`, err);
        }
    }

    async sendReceiptEmail(user, amount, planName) {
        await transporter.sendMail({
            from: FROM_EMAIL,
            to: user.email,
            subject: `Loopy Subscription Receipt - ${planName}`,
            html: `<p>Hi ${user.first_name},</p><p>Your ${planName} subscription has been successfully renewed for ₦${amount.toLocaleString()}. Thank you for using Loopy!</p>`
        }).catch(err => console.error(err));
    }

    async sendFailedRenewalEmail(user, attempts) {
        const remaining = 3 - attempts;
        await transporter.sendMail({
            from: FROM_EMAIL,
            to: user.email,
            subject: `Action Required: Loopy Subscription Renewal Failed`,
            html: `<p>Hi ${user.first_name},</p><p>We couldn't process your subscription renewal. We will try again tomorrow. You have ${remaining} day(s) of grace period left before your account is downgraded to the Free plan. Please ensure you have sufficient funds.</p>`
        }).catch(err => console.error(err));
    }

    async sendDowngradeEmail(user) {
        await transporter.sendMail({
            from: FROM_EMAIL,
            to: user.email,
            subject: `Loopy Subscription Downgraded`,
            html: `<p>Hi ${user.first_name},</p><p>After 3 unsuccessful renewal attempts, your account has been downgraded to the Free plan. You can upgrade again at any time from your dashboard.</p>`
        }).catch(err => console.error(err));
    }
}

module.exports = new CronService();
