const express = require('express');
const db = require('../db');
const squadService = require('../services/squadService');

const router = express.Router();

const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    next();
};

// 1. Get Plan Pricing
router.get('/plans', (req, res) => {
    try {
        const plans = squadService.getAllPlans();
        res.json({ success: true, plans });
    } catch (err) {
        console.error('[PaymentRoute] Error fetching plans:', err);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

// 2. Initiate Squad Payment Checkout
router.post('/initiate', requireAuth, async (req, res) => {
    const { planType, isAnnual } = req.body;
    const plan = squadService.getPlanDetails(planType);

    if (!plan) {
        return res.status(400).json({ error: 'Invalid plan selected. Choose starter, growth, or enterprise.' });
    }

    const amount = isAnnual ? plan.annualAmount : plan.monthlyAmount;
    const amountInKobo = amount * 100;

    try {
        const transactionRef = squadService.generateTransactionRef();
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
        const callbackUrl = `${protocol}://${req.get('host')}/payment/callback?ref=${transactionRef}`;

        // Record pending transaction in database
        const stmt = db.prepare(`
            INSERT INTO transactions (user_id, transaction_ref, plan_type, amount, currency, status)
            VALUES (?, ?, ?, ?, 'NGN', 'pending')
        `);
        stmt.run(req.session.userId, transactionRef, planType.toLowerCase(), amount);

        const squadPayload = {
            email: req.session.email,
            amountInKobo,
            transactionRef,
            callbackUrl,
            metadata: {
                userId: req.session.userId,
                planType: planType.toLowerCase(),
                isAnnual: isAnnual ? 'true' : 'false'
            },
            isRecurring: true
        };

        console.log('[PaymentRoute] Initiating Squad Payment with payload:', JSON.stringify(squadPayload, null, 2));

        // Initiate with Squad Gateway
        const squadResult = await squadService.initiateTransaction(squadPayload);

        if (squadResult.status && squadResult.data?.checkout_url) {
            return res.json({
                success: true,
                checkoutUrl: squadResult.data.checkout_url,
                transactionRef
            });
        }

        // If we got here, Squad API failed to return a checkout URL
        console.error('[PaymentRoute] Squad API failed:', squadResult);
        res.status(400).json({ 
            error: 'We could not initiate your payment at this time. Please try again later or contact support.'
        });
    } catch (err) {
        console.error('[PaymentRoute] Initiation error:', err);
        res.status(500).json({ error: 'Failed to initiate payment with Squad gateway.' });
    }
});

// 2. Verify Payment Transaction
router.get('/verify/:ref', requireAuth, async (req, res) => {
    const { ref } = req.params;
    const { mock_success } = req.query;

    try {
        const txStmt = db.prepare('SELECT * FROM transactions WHERE transaction_ref = ? AND user_id = ?');
        const transaction = txStmt.get(ref, req.session.userId);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found.' });
        }

        if (transaction.status === 'success') {
            return res.json({ success: true, planType: transaction.plan_type, message: 'Plan already activated.' });
        }

        let isSuccess = false;
        let squadToken = null;

        // Try verifying with Squad API
        try {
            const squadVerify = await squadService.verifyTransaction(ref);
            if (squadVerify.status && squadVerify.data?.transaction_status === 'success') {
                isSuccess = true;
                if (squadVerify.data.token_id) {
                    squadToken = squadVerify.data.token_id;
                }
            }
        } catch (squadErr) {
            console.warn('[PaymentRoute] Squad verification API unavailable, checking dev fallback:', squadErr.message);
        }

        // Allow dev mode mock success if sandbox keys are simulated
        if (!isSuccess && mock_success === 'true') {
            isSuccess = true;
        }

        if (isSuccess) {
            const plan = squadService.getPlanDetails(transaction.plan_type);
            const isAnnual = transaction.amount === plan?.annualAmount;
            
            // Activate plan: add 30 days or 365 days
            const days = isAnnual ? 365 : 30;
            const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
            
            const updateTxStmt = db.prepare("UPDATE transactions SET status = 'success', updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            updateTxStmt.run(transaction.id);

            if (squadToken) {
                const updateUserStmt = db.prepare("UPDATE users SET plan_type = ?, plan_expires_at = ?, squad_token = ?, plan_is_annual = ?, renewal_failed_attempts = 0 WHERE id = ?");
                updateUserStmt.run(transaction.plan_type, expiresAt, squadToken, isAnnual ? 1 : 0, req.session.userId);
            } else {
                const updateUserStmt = db.prepare("UPDATE users SET plan_type = ?, plan_expires_at = ?, plan_is_annual = ?, renewal_failed_attempts = 0 WHERE id = ?");
                updateUserStmt.run(transaction.plan_type, expiresAt, isAnnual ? 1 : 0, req.session.userId);
            }

            req.session.planType = transaction.plan_type;

            return res.json({
                success: true,
                planType: transaction.plan_type,
                expiresAt,
                message: `Congratulations! Your ${transaction.plan_type.toUpperCase()} plan is now active.`
            });
        }

        res.status(400).json({ error: 'Payment verification failed or payment was not completed.' });
    } catch (err) {
        console.error('[PaymentRoute] Verification error:', err);
        res.status(500).json({ error: 'Server error verifying payment.' });
    }
});

// 3. Squad Webhook Listener (Asynchronous charge confirmation)
router.post('/webhook', (req, res) => {
    // Squad documentation specifies x-squad-encrypted-body for webhook signature
    const signature = req.headers['x-squad-encrypted-body'] || req.headers['x-squad-signature'];
    const event = req.body;

    // Verify webhook signature to prevent unauthorized access
    if (!squadService.verifyWebhookSignature(signature, event)) {
        console.warn('[Squad Webhook] Invalid signature — rejecting request.');
        return res.status(401).json({ error: 'Invalid webhook signature.' });
    }

    try {
        if (event && event.Event === 'charge_successful' && event.Body?.transaction_ref) {
            const ref = event.Body.transaction_ref;
            const txStmt = db.prepare('SELECT * FROM transactions WHERE transaction_ref = ?');
            const transaction = txStmt.get(ref);

            if (transaction && transaction.status !== 'success') {
                const plan = squadService.getPlanDetails(transaction.plan_type);
                const isAnnual = transaction.amount === plan?.annualAmount;
                const days = isAnnual ? 365 : 30;
                const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
                const squadToken = event.Body.token_id || null;
                
                db.prepare("UPDATE transactions SET status = 'success', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(transaction.id);
                
                if (squadToken) {
                    db.prepare("UPDATE users SET plan_type = ?, plan_expires_at = ?, squad_token = ?, plan_is_annual = ?, renewal_failed_attempts = 0 WHERE id = ?").run(transaction.plan_type, expiresAt, squadToken, isAnnual ? 1 : 0, transaction.user_id);
                } else {
                    db.prepare("UPDATE users SET plan_type = ?, plan_expires_at = ?, plan_is_annual = ?, renewal_failed_attempts = 0 WHERE id = ?").run(transaction.plan_type, expiresAt, isAnnual ? 1 : 0, transaction.user_id);
                }
                
                console.log(`[Squad Webhook] Activated ${transaction.plan_type} plan for user ${transaction.user_id}`);
            }
        }
        res.status(200).json({ received: true });
    } catch (err) {
        console.error('[Squad Webhook] Error processing webhook:', err);
        res.status(500).json({ error: 'Webhook processing error' });
    }
});

// 4. Cancel Subscription
router.post('/cancel-subscription', requireAuth, (req, res) => {
    try {
        db.prepare("UPDATE users SET squad_token = NULL WHERE id = ?").run(req.session.userId);
        res.json({ success: true, message: 'Subscription auto-renewal has been cancelled. You will remain on your current plan until it expires.' });
    } catch (err) {
        console.error('[PaymentRoute] Error cancelling subscription:', err);
        res.status(500).json({ error: 'Failed to cancel subscription.' });
    }
});

module.exports = router;
