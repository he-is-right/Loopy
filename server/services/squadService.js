const crypto = require('crypto');

const SQUAD_SECRET_KEY = process.env.SQUAD_SECRET_KEY || 'sandbox_sk_dummy_test_key';
const SQUAD_BASE_URL = process.env.SQUAD_BASE_URL || 'https://api-d.squadco.com';

const PLAN_PRICES = {
    free: {
        id: 'free',
        name: 'FREE',
        monthlyAmount: 0,
        annualAmount: 0,
        amountInKobo: 0,
        campaignLimit: 1
    },
    starter: {
        id: 'starter',
        name: 'STARTER',
        monthlyAmount: 4000, // 4,000 NGN
        annualAmount: 40000,
        amountInKobo: 4000 * 100,
        campaignLimit: 5
    },
    growth: {
        id: 'growth',
        name: 'GROWTH (PRO)',
        monthlyAmount: 15000, // 15,000 NGN
        annualAmount: 150000,
        amountInKobo: 15000 * 100,
        campaignLimit: Infinity
    },
    enterprise: {
        id: 'enterprise',
        name: 'ENTERPRISE',
        monthlyAmount: 35000, // 35,000 NGN
        annualAmount: 350000,
        amountInKobo: 35000 * 100,
        campaignLimit: Infinity
    }
};

class SquadService {
    getPlanDetails(planType) {
        return PLAN_PRICES[planType?.toLowerCase()] || null;
    }

    getAllPlans() {
        return Object.values(PLAN_PRICES);
    }

    generateTransactionRef(prefix = 'LP') {
        return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    async initiateTransaction({ email, amountInKobo, transactionRef, callbackUrl, metadata, isRecurring }) {
        try {
            const body = {
                email,
                amount: amountInKobo,
                currency: 'NGN',
                initiate_type: 'inline',
                transaction_ref: transactionRef,
                callback_url: callbackUrl,
                metadata
            };

            if (isRecurring) {
                body.is_recurring = true;
            }

            const response = await fetch(`${SQUAD_BASE_URL}/transaction/initiate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SQUAD_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (!response.ok || data.status !== 200) {
                console.error('[SquadService] Raw API Failure Response:', data);
            }
            return {
                status: response.ok && data.status === 200,
                data: data.data,
                message: data.message || data.error || data.error_message || JSON.stringify(data)
            };
        } catch (error) {
            console.error('[SquadService] Error initiating payment:', error);
            throw error;
        }
    }

    async verifyTransaction(transactionRef) {
        try {
            const response = await fetch(`${SQUAD_BASE_URL}/transaction/verify/${transactionRef}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${SQUAD_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            return {
                status: response.ok && data.status === 200,
                data: data.data,
                message: data.message
            };
        } catch (error) {
            console.error(`[SquadService] Error verifying transaction ${transactionRef}:`, error);
            throw error;
        }
    }

    verifyWebhookSignature(signature, body) {
        if (!signature || !SQUAD_SECRET_KEY) return false;
        try {
            const hash = crypto
                .createHmac('sha512', SQUAD_SECRET_KEY)
                .update(JSON.stringify(body))
                .digest('hex');
            return hash === signature || hash === signature.toLowerCase();
        } catch (err) {
            return false;
        }
    }

    async chargeCard({ amountInKobo, tokenId, transactionRef }) {
        try {
            const response = await fetch(`${SQUAD_BASE_URL}/transaction/charge_card`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SQUAD_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amountInKobo,
                    token_id: tokenId,
                    transaction_ref: transactionRef
                })
            });

            const data = await response.json();
            return {
                status: response.ok && data.status === 200,
                data: data.data,
                message: data.message || 'Card charged'
            };
        } catch (error) {
            console.error('[SquadService] Error charging card:', error);
            throw error;
        }
    }
}

module.exports = new SquadService();
