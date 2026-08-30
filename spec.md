# Loopy Technical Specification

**Product:** Loopy (by QuickApron)  
**Category:** Customer Feedback & Experience Management  
**Status:** MVP / Production Preparation  
**Target Market:** Small and Medium-Sized Businesses (Primary: Nigeria)  
**Platform:** Web Application (React + Node.js/Express)  
**Reference Document:** `loopy-prd.md`

---

## 1. Executive Overview & Product Loop

Loopy is a customer feedback and experience management platform designed to help businesses collect, understand, alert, act on, and improve customer satisfaction.

```
Collect ───> Understand ───> Alert ───> Act ───> Improve
```

### Core Value Proposition
- Turn fragmented customer feedback (from WhatsApp, Instagram, Google, receipts, verbal complaints) into actionable business intelligence.
- **Customer Experience:** Scan QR / Click Link → Rate (1–5 Stars) → Answer Questions → Submit (No customer account needed).
- **Business Experience:** Create Campaign → Distribute via QR/Link → Real-Time/Digest Alerts → Analyze Trends → Resolve Customer Issues.
- **Gamification Layer:** Supporting engagement loop (XP, daily check-in streaks, milestones) that rewards businesses for listening and taking action.

---

## 2. Core Features & Capabilities

### 2.1 User Authentication & Business Profile
- **Registration & Validation:** Email validation powered by **Relaybase API** (`https://api.tryrelaybase.com/v1/email/single-validate`) to reject invalid/disposable emails.
- **Security:** Password hashing via `bcrypt` (10 rounds) and session management via `express-session` with 7-day cookie persistence.
- **Business Setup:** Business name, brand color, logo, and notification preferences.

### 2.2 Customer Review Campaign Builder
- **Dynamic Question Builder:**
  - 1–5 Star Rating scale
  - Free-form text feedback questions
  - Multiple-choice questions (planned)
  - Optional / Required customer email capture
- **Custom Brand Color Picker:** Preset brand palettes + fine-grained hex selection via `react-colorful`.
- **Unique Link & QR Distribution:** Auto-generated slug (e.g. `/f/:slug`) with QR code generation for packaging, receipts, tables, and social bios.
- **Webhook Integrations:** Instant forwarding to Slack / Discord channels (Growth & Enterprise tiers).

### 2.3 Mobile-First Public Feedback Pages (`/f/:slug`)
- Ultra-fast, responsive form styled with the campaign's custom brand color.
- Interactive star rating and required field validation.
- Gamified celebratory submission screen with confetti effects.
- Dynamic co-branding / watermark controls based on subscription tier.

### 2.4 Feedback Management Dashboard & Feed
- **Campaign Overview:** View and switch between active campaigns.
- **Response Feed:** Chronological list of customer feedback displaying timestamp, star rating, answers, customer email, and resolution status.
- **Response Status Tracking:** `New` → `Reviewing` → `Resolved` (enabling businesses to track actions taken).
- **CSV Data Export:** One-click structured export of all campaign responses for offline analysis.

### 2.5 Analytics Engine
- **Volume Metrics:** Total responses received across timeframes (today, this week, this month).
- **Rating Intelligence:** Average rating calculation and visual star breakdown (5⭐ to 1⭐).
- **Trend Detection:** Tracking satisfaction trajectory over time.

### 2.6 Notification & Alerting Engine
- **Transactional Email Alerts:** Powered by `nodemailer` for clean HTML notifications.
- **Configurable Frequencies:**
  - `immediate`: Real-time email dispatch upon submission.
  - `daily`: Batch summary delivered at user-configured local time (default: 6:00 PM via `node-cron`).
  - `weekly`: Weekly digest summary delivered every Friday at 6:00 PM.
  - `monthly`: Monthly summary delivered on the 28th of each month at 6:00 PM.
- **Critical Feedback Rules:** Immediate manager escalation when rating ≤ 2/5 (P1).
- **Webhooks:** Dispatched in real time regardless of email batching settings.

### 2.7 Gamification Engine
- **Daily Login Streaks (🔥):** Tracks consecutive daily check-ins (`streak_days`, `last_login_date`).
- **Daily Bonus:** Consecutive logins award **+20 XP**.
- **Action-Based XP Rewards (⚡):**
  - Launching a review campaign awards **+50 XP**.
  - Receiving customer feedback awards **+10 XP**.
  - Resolving customer complaints awards bonus XP.
- **Live Counter:** Top navigation bar displays real-time streak and XP metrics.

---

## 3. Subscription & Payment System (Squad Gateway)

Payment processing for the Nigerian market is powered by **Squad by HabariPay / GTCO**.

### 3.1 Pricing Tiers

| Tier | Price (NGN) | Target Audience | Key Features & Limits |
| :--- | :--- | :--- | :--- |
| **Starter** | **₦4,000** / month | Small businesses / Solo creators | Up to 5 Campaigns, Star & Text Questions, Immediate Email Alerts, Standard Branding |
| **Growth (Pro)** | **₦15,000** / month | Growing businesses | Unlimited Campaigns, Email Capture, Slack/Discord Webhooks, Analytics Hub, CSV Export, Custom Alert Schedules, Watermark Removed |
| **Enterprise** | **₦35,000** / month | Multi-location / Teams | Everything in Growth + Priority Processing, Multi-Webhook Support, Unlimited Responses, 24/7 Dedicated Support |

### 3.2 Subscription Lifecycle
- **Statuses:** `trialing`, `active`, `past_due`, `canceled`, `expired`.
- **Squad Workflow:**
  1. User selects plan in the gamified 3D **PlanSelectorModal**.
  2. Backend calls Squad `POST /transaction/initiate` with transaction reference and callback URL.
  3. User completes checkout on Squad gateway.
  4. User is redirected to `/payment/callback` which verifies status via `GET /transaction/verify/:ref`.
  5. Webhook listener (`POST /api/payment/webhook`) verifies HMAC-SHA512 signature for idempotent asynchronous confirmation (`charge_successful`).
  6. Account subscription is updated (`plan_type`, `plan_expires_at`).

---

## 4. Technical Architecture

### 4.1 Tech Stack
- **Frontend:** React 18, Vite 5, Tailwind CSS 3, Lucide Icons, `react-colorful`, `canvas-confetti`.
- **Backend:** Node.js, Express.js.
- **Database:** SQLite (using Node.js native `node:sqlite` DatabaseSync module) with a migration path to PostgreSQL for enterprise scale.
- **Job Scheduling:** `node-cron`.
- **Email Delivery:** `nodemailer`.
- **Payment Gateway:** Squad API (HabariPay / GTCO).
- **Email Validation:** Relaybase API.

---

## 5. Database Schema

### `users`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | User ID |
| `first_name` | `TEXT` | First name |
| `last_name` | `TEXT` | Last name |
| `email` | `TEXT UNIQUE NOT NULL` | Validated email address |
| `password_hash` | `TEXT NOT NULL` | Bcrypt password hash |
| `plan_type` | `TEXT DEFAULT 'none'` | Current plan (`none`, `starter`, `growth`, `enterprise`, `pro`) |
| `plan_expires_at` | `DATETIME` | Subscription expiration date |
| `notification_frequency` | `TEXT DEFAULT 'immediate'` | Email alert frequency (`immediate`, `daily`, `weekly`, `monthly`) |
| `xp` | `INTEGER DEFAULT 0` | Accumulated XP |
| `streak_days` | `INTEGER DEFAULT 1` | Consecutive login streak count |
| `last_login_date` | `DATE` | Last login date (YYYY-MM-DD) |
| `created_at` | `DATETIME DEFAULT CURRENT_TIMESTAMP` | Signup timestamp |

### `campaigns`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Campaign ID |
| `user_id` | `INTEGER NOT NULL` | References `users(id)` |
| `title` | `TEXT NOT NULL` | Campaign title |
| `slug` | `TEXT UNIQUE NOT NULL` | Public URL slug |
| `brand_color` | `TEXT DEFAULT '#000000'` | Brand hex color |
| `webhook_url` | `TEXT` | Slack/Discord webhook URL |
| `questions_json` | `TEXT NOT NULL` | Serialized JSON questions array |
| `created_at` | `DATETIME DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

### `responses`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Response ID |
| `campaign_id` | `INTEGER NOT NULL` | References `campaigns(id)` |
| `answers_json` | `TEXT NOT NULL` | Serialized JSON answers array |
| `status` | `TEXT DEFAULT 'new'` | `new`, `reviewing`, `resolved` |
| `created_at` | `DATETIME DEFAULT CURRENT_TIMESTAMP` | Submission timestamp |

### `pending_notifications`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Queue ID |
| `user_id` | `INTEGER NOT NULL` | References `users(id)` |
| `campaign_id` | `INTEGER NOT NULL` | References `campaigns(id)` |
| `response_id` | `INTEGER NOT NULL` | References `responses(id)` |
| `created_at` | `DATETIME DEFAULT CURRENT_TIMESTAMP` | Queued timestamp |

### `transactions`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Transaction ID |
| `user_id` | `INTEGER NOT NULL` | References `users(id)` |
| `transaction_ref` | `TEXT UNIQUE NOT NULL` | Squad transaction reference |
| `plan_type` | `TEXT NOT NULL` | Selected tier |
| `amount` | `INTEGER NOT NULL` | Amount in NGN |
| `currency` | `TEXT DEFAULT 'NGN'` | Currency |
| `status` | `TEXT DEFAULT 'pending'` | `pending`, `success`, `failed` |
| `squad_response_json` | `TEXT` | Gateway response payload |
| `created_at` | `DATETIME DEFAULT CURRENT_TIMESTAMP` | Initiation timestamp |
| `updated_at` | `DATETIME DEFAULT CURRENT_TIMESTAMP` | Status update timestamp |

---

## 6. API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/signup` — Validate email with Relaybase, hash password, create user session.
- `POST /api/auth/login` — Verify credentials, update login streak, award daily XP bonus.
- `POST /api/auth/logout` — Destroy session.
- `GET /api/auth/me` — Return session user data, XP, streak, and plan subscription details.
- `PUT /api/auth/me/frequency` — Update email alert digest frequency preference.

### Campaigns (`/api/campaigns`)
- `GET /api/campaigns` — Fetch authenticated user's campaigns.
- `POST /api/campaigns` — Enforce tier limits, create campaign, award +50 XP.
- `GET /api/campaigns/:slug` — Public route to fetch campaign configuration for public review page.

### Responses (`/api/responses`)
- `POST /api/responses/:slug` — Public route to submit customer feedback, fire webhooks/emails, award +10 XP.
- `GET /api/responses/campaign/:campaignId` — Protected route to fetch all responses for a campaign.
- `PATCH /api/responses/:id/status` — Update response status (`new`, `reviewing`, `resolved`).

### Payments (`/api/payment`)
- `POST /api/payment/initiate` — Initialize Squad checkout transaction, return checkout URL.
- `GET /api/payment/verify/:ref` — Verify transaction with Squad API, activate user subscription.
- `POST /api/payment/webhook` — Webhook listener for Squad `charge_successful` events.

---

## 7. Environment Configuration (`.env`)

```env
# Application Server
PORT=3000
NODE_ENV=production
SESSION_SECRET=your_secure_session_secret

# Squad Payment Gateway (HabariPay / GTCO)
SQUAD_BASE_URL=https://api-d.squadco.com
SQUAD_SECRET_KEY=sandbox_sk_your_squad_secret_key

# Relaybase Email Validation
RELAYBASE_API_KEY=your_relaybase_api_key

# Email Delivery (SMTP)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
FROM_EMAIL=noreply@loopy.com
```

---

## 8. Success Metrics & Product Priorities

### North Star Metric
> **Feedback Actions Taken:** The number of customer feedback items reviewed and acted upon by businesses.

### Development Priorities
- **P0 (Must Have - Active):** Auth, Relaybase validation, Campaign Builder, Public Review Pages, Star Ratings, Text Reviews, Response Storage, Dashboard, Email Alerts, Squad Payments, Gamification XP/Streaks.
- **P1 (Important - Next):** Feedback resolution status workflow, Critical Feedback escalation (rating ≤ 2 alert), QR code image downloads, Multiple webhook endpoints.
- **P2 (Growth / Later):** WhatsApp channel integration, Sentiment analysis, Team sub-accounts, Multi-location dashboards, AI-generated action summaries.
