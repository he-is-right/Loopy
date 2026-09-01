# LOOPY

## Product Requirements Document

**Product:** Loopy
**Product Category:** Customer Feedback & Experience Management
**Document Version:** 1.0
**Status:** Product Definition / MVP
**Primary Market:** Small and medium-sized businesses
**Initial Market:** Nigeria
**Platform:** Web Application

---

# 1. Executive Summary

Loopy is a customer feedback and experience management platform that enables businesses to easily collect, organize, understand, and act on customer feedback.

Businesses create branded feedback campaigns and distribute them through links, QR codes, receipts, WhatsApp, social media, email, or physical locations. Customers submit ratings and comments through a simple mobile-friendly feedback page.

Loopy then delivers the feedback to the business through dashboards, email alerts, and integrations while providing analytics that help businesses identify recurring customer experience problems.

The core product loop is:

**Collect → Understand → Alert → Act → Improve**

Loopy's gamification system will increase business-owner engagement with the platform, but gamification is a supporting feature rather than the primary product value proposition.

---

# 2. Problem Statement

Many businesses receive customer feedback every day but do not have a structured system for managing it.

Feedback is commonly scattered across:

* WhatsApp
* Instagram
* Google Reviews
* phone calls
* paper forms
* staff conversations
* social media comments
* direct messages

As a result, businesses often struggle to answer basic questions:

* What are customers complaining about?
* Which part of the customer experience is weakest?
* Are complaints increasing?
* Which products or services receive the most complaints?
* Are customers becoming more satisfied over time?
* Which issues require immediate attention?

Loopy centralizes this feedback into a single system and turns individual customer responses into actionable business information.

---

# 3. Product Vision

To become the simplest customer feedback and experience management platform for growing businesses.

Loopy should eventually become the feedback layer between businesses and their customers.

---

# 4. Product Mission

Make it extremely easy for businesses to:

**Listen to customers → understand what they are saying → respond quickly → improve the experience.**

---

# 5. Target Users

## 5.1 Primary Users

### Small Business Owner

Examples:

* restaurants
* hotels
* salons
* event businesses
* retail stores
* logistics companies
* service businesses

Needs:

* simple setup
* affordable pricing
* quick feedback
* actionable insights
* minimal technical knowledge

---

## 5.2 Secondary Users

### Operations Manager

Needs:

* real-time alerts
* analytics
* campaign management
* team notifications
* performance monitoring

### Customer Experience Manager

Needs:

* detailed feedback
* customer sentiment
* response tracking
* trend analysis
* exports

### Enterprise Administrator

Needs:

* multiple locations
* multiple team members
* permissions
* centralized reporting
* integrations

---

# 6. Core Value Proposition

Loopy provides businesses with one simple place to collect and understand customer feedback.

Instead of:

**Customer → WhatsApp → Staff → Manager → Spreadsheet**

Loopy creates:

**Customer → Loopy → Business → Action**

---

# 7. Core Product Principles

### 7.1 Simplicity

A business should be able to create its first feedback campaign in less than five minutes.

### 7.2 Mobile First

Most customers will submit feedback from mobile devices.

### 7.3 Action Over Data

Analytics should help businesses decide what to do, not simply display numbers.

### 7.4 Real-Time Where It Matters

Critical feedback should reach the business immediately.

### 7.5 Low Friction

Customers should be able to submit feedback without creating an account.

### 7.6 Trust

Loopy should not manipulate, hide, or selectively represent customer feedback.

---

# 8. MVP Scope

The MVP should focus on five core capabilities:

1. Business accounts
2. Feedback campaign creation
3. Customer feedback collection
4. Notifications
5. Basic analytics

Gamification, advanced integrations, AI analysis and enterprise features should be layered on top of this foundation.

---

# 9. User Journey

## Business Owner

### Step 1 — Sign Up

User provides:

* first name
* last name
* email
* password

Email validation is performed.

---

### Step 2 — Business Setup

User provides:

* business name
* business category
* logo
* brand color
* location

---

### Step 3 — Create Campaign

User selects:

**Campaign Name**

Example:

> Restaurant Customer Feedback

User then creates questions.

Supported MVP question types:

* Star Rating
* Text
* Multiple Choice

Optional:

* Customer email

---

### Step 4 — Publish

Loopy generates:

**Public URL**

Example:

`loopy.ng/f/restaurant-feedback`

and a corresponding:

**QR Code**

---

### Step 5 — Share

The business can place the QR code/link on:

* receipts
* tables
* packaging
* WhatsApp
* social media
* email
* website

---

### Step 6 — Customer Responds

Customer opens the feedback page.

They:

1. rate the experience
2. answer questions
3. optionally provide their email
4. submit

No customer account should be required.

---

### Step 7 — Business Receives Feedback

The business receives the response according to its notification settings.

Possible channels:

* dashboard
* email
* Slack
* Discord
* future WhatsApp integration

---

### Step 8 — Business Takes Action

The business reviews the feedback and addresses the issue.

---

# 10. Campaign Builder Requirements

The campaign builder must allow a business to:

* create a campaign
* name the campaign
* add questions
* remove questions
* reorder questions
* mark questions required/optional
* choose question type
* configure rating scale
* customize brand color
* upload logo
* preview campaign
* publish campaign
* pause campaign
* resume campaign
* edit campaign

Each campaign receives a unique public slug.

---

# 11. Customer Feedback Page

The public page must:

* load quickly
* work on mobile
* display business branding
* display campaign title
* display questions
* validate required fields
* prevent invalid submissions
* provide a clear submit action
* show confirmation after submission

After submission, the customer should receive a simple confirmation such as:

> **Thank you for helping us improve.**

Gamified visual effects such as confetti can be used, but they should not interfere with usability.

---

# 12. Feedback Management Dashboard

The dashboard is one of the most important parts of Loopy.

Businesses should see:

### Overview

* total responses
* average rating
* response trend
* campaign performance
* recent feedback

### Feedback Feed

Each response should show:

* rating
* answers
* campaign
* timestamp
* customer email, if provided
* status

Possible statuses:

* New
* Reviewing
* Resolved

---

# 13. Feedback Analytics

MVP analytics should include:

### Response Volume

Number of responses over:

* today
* this week
* this month

### Average Rating

Example:

**4.3 / 5**

### Rating Distribution

Example:

5 ⭐ — 62%
4 ⭐ — 20%
3 ⭐ — 10%
2 ⭐ — 5%
1 ⭐ — 3%

### Trend

Businesses should be able to see whether satisfaction is:

* increasing
* decreasing
* stable

### Campaign Performance

Show which campaigns generate the most feedback.

---

# 14. Feedback Alerts

Businesses can configure notification preferences.

### Immediate

Send an alert immediately after submission.

### Daily Digest

Send a summary at the configured time.

### Weekly Digest

Send a weekly summary.

### Monthly Digest

Send a monthly summary.

The system should allow businesses to configure their timezone.

The current specification's fixed 6 PM schedule should therefore be replaced with a configurable business-local schedule.

---

# 15. Critical Feedback Alerts

Loopy should eventually support rules such as:

> If rating ≤ 2, notify manager immediately.

Example:

**⚠️ Critical Customer Feedback**

> Customer rated their experience 2/5.

> “The food arrived 45 minutes late.”

This feature has significantly more business value than generic notification delivery.

---

# 16. Integrations

## MVP

* Email

## Growth

* Slack
* Discord
* CSV export

## Future

* WhatsApp
* Google Sheets
* Zapier/Make
* CRM integrations
* POS systems
* API

Webhook integrations should support multiple destinations rather than storing only one webhook URL.

---

# 17. Gamification

Gamification should encourage business owners to consistently engage with their feedback.

It should **not** become the core value proposition.

Possible mechanics:

### XP

Users earn XP for:

* creating campaigns
* reviewing feedback
* resolving feedback
* maintaining activity
* improving customer satisfaction

### Streaks

Encourage users to check and respond to customer feedback consistently.

### Levels

Example:

**Starter → Listener → Customer Champion → Experience Expert**

The gamification system should eventually reward meaningful business actions rather than simply logging in.

---

# 18. Subscription Model

Recommended initial pricing structure:

| Plan       |          Price | Target                    |
| ---------- | -------------: | ------------------------- |
| Free       |             ₦0 | Individuals / trial users |
| Starter    |   ₦5,000/month | Small businesses          |
| Growth     |  ₦15,000/month | Growing businesses        |
| Enterprise | ₦35,000+/month | Multi-location businesses |

## Free

* 1 campaign
* limited monthly responses
* basic analytics
* Loopy branding

## Starter

* up to 5 campaigns
* higher response limits
* custom branding
* email alerts
* basic analytics

## Growth

* unlimited campaigns
* unlimited responses
* advanced analytics
* Slack/Discord
* CSV export
* custom alert schedules
* remove Loopy branding

## Enterprise

* multiple locations
* multiple users
* team permissions
* multiple webhooks
* advanced reporting
* API access
* priority support
* enterprise controls

Exact response limits should be validated through customer research rather than arbitrarily defined.

---

# 19. Subscription Lifecycle

The system must support:

* trial
* active subscription
* renewal
* failed payment
* grace period
* expired subscription
* cancellation
* upgrade
* downgrade
* payment history
* refunds

Subscription status should be separated from the user's plan.

Recommended model:

**Plan**

`starter / growth / enterprise`

**Subscription Status**

`trialing / active / past_due / canceled / expired`

---

# 20. Data Model

The MVP should use a relational structure.

### users

* id
* first_name
* last_name
* email
* password_hash
* created_at

### businesses

* id
* owner_id
* name
* category
* logo
* brand_color
* created_at

### campaigns

* id
* business_id
* title
* slug
* status
* created_at
* updated_at

### campaign_questions

* id
* campaign_id
* type
* question
* required
* position

### responses

* id
* campaign_id
* customer_email
* created_at
* status

### response_answers

* id
* response_id
* question_id
* answer

### subscriptions

* id
* business_id
* plan
* status
* starts_at
* expires_at
* canceled_at

### transactions

* id
* subscription_id
* provider_reference
* amount
* currency
* status
* provider_response
* created_at

### notifications

* id
* response_id
* channel
* status
* sent_at
* error_message

### webhooks

* id
* business_id
* provider
* webhook_url
* active
* created_at

### xp_events

* id
* user_id
* action
* xp
* created_at

This structure will make future analytics significantly easier.

---

# 21. Authentication & Security

The platform must support:

* secure password hashing
* authenticated sessions
* secure cookies
* session expiration
* logout
* rate limiting
* input validation
* CSRF protection where applicable
* authorization checks
* webhook signature verification
* payment webhook idempotency
* environment-based secrets

Customer feedback endpoints must be protected against:

* spam
* automated submissions
* abuse
* duplicate submissions
* malicious input

Rate limiting and CAPTCHA/Turnstile-style protection should be considered for public campaigns.

---

# 22. Payment Integration

Squad will be used for Nigerian payment processing.

Payment architecture should follow:

**Create checkout → Redirect customer → Gateway processes payment → Webhook received → Verify transaction → Update subscription → Record transaction**

The webhook should be treated as the primary asynchronous payment event.

Payment processing must be idempotent so that the same payment notification cannot activate a subscription multiple times.

---

# 23. API Requirements

## Authentication

`POST /api/auth/signup`

`POST /api/auth/login`

`POST /api/auth/logout`

`GET /api/auth/me`

---

## Businesses

`GET /api/business`

`PUT /api/business`

---

## Campaigns

`GET /api/campaigns`

`POST /api/campaigns`

`GET /api/campaigns/:id`

`PUT /api/campaigns/:id`

`DELETE /api/campaigns/:id`

`POST /api/campaigns/:id/publish`

`POST /api/campaigns/:id/pause`

---

## Public Campaign

`GET /api/public/campaigns/:slug`

`POST /api/public/campaigns/:slug/responses`

---

## Feedback

`GET /api/responses`

`GET /api/responses/:id`

`PATCH /api/responses/:id/status`

---

## Analytics

`GET /api/analytics/overview`

`GET /api/analytics/campaign/:id`

---

## Notifications

`GET /api/notifications/settings`

`PUT /api/notifications/settings`

---

## Payments

`POST /api/payment/initiate`

`GET /api/payment/verify/:reference`

`POST /api/payment/webhook`

---

# 24. Technical Architecture

## MVP

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

Use SQLite during early prototyping if required.

Production architecture should be designed to migrate to PostgreSQL.

### Email

Nodemailer can be used during MVP development, but production email delivery should use a reliable transactional email provider.

### Scheduler

node-cron can support the initial implementation.

As scale increases, scheduled notification processing should move toward a persistent job queue.

### Payments

Squad.

### Email validation

Relaybase or another validation provider.

---

# 25. MVP Non-Goals

The MVP should NOT attempt to build:

* full CRM
* full customer support system
* complex marketing automation
* advanced AI analytics
* loyalty program
* POS system
* complete reputation-management suite
* native mobile applications
* complicated enterprise permissions

These can come later.

---

# 26. Success Metrics

The most important metric should not be:

**Number of campaigns created.**

The core metric should be:

### Weekly Active Feedback Businesses

Businesses that receive and engage with customer feedback during a week.

Supporting metrics:

### Activation

Percentage of new businesses that create and publish their first campaign.

### Time to First Feedback

Time between campaign creation and first customer response.

### Response Rate

Responses per campaign/customer interaction.

### Feedback Engagement

Percentage of businesses that view received feedback.

### Action Rate

Percentage of feedback marked as reviewed/resolved.

### Retention

30-day and 90-day business retention.

### Paid Conversion

Percentage of active businesses converting to paid plans.

### MRR

Monthly recurring revenue.

### Churn

Monthly subscription churn.

---

# 27. North Star Metric

## **Feedback Actions Taken**

The number of meaningful customer feedback items that businesses review and act upon.

This aligns the product with its actual purpose.

Loopy should not simply help businesses collect more feedback.

It should help them **do something with it.**

---

# 28. Product Roadmap

## Phase 1 — MVP

**Collect**

* authentication
* business profile
* campaign builder
* branded feedback pages
* QR/link sharing
* ratings
* text responses
* email alerts
* basic dashboard
* basic analytics
* subscriptions

---

## Phase 2 — Feedback Intelligence

**Understand**

* rating trends
* category analysis
* feedback search
* sentiment analysis
* recurring complaint detection
* critical feedback detection
* improved analytics

---

## Phase 3 — Action

**Act**

* response status
* assign feedback to team member
* internal notes
* resolution tracking
* escalation rules
* Slack/Discord
* WhatsApp notifications

---

## Phase 4 — Business Intelligence

**Improve**

* branch comparison
* customer experience score
* campaign comparison
* historical trends
* automated reports
* benchmarking
* AI-generated insights

---

# 29. Future Product Opportunity

The long-term opportunity is much larger than a feedback form.

Loopy can evolve into:

## Customer Experience OS for SMEs

A business could eventually see:

> **Customer Experience Score: 82/100**

### This month

⭐ Average rating: **4.4**

📈 Satisfaction: **+8%**

⚠️ Delivery complaints: **+21%**

💬 Most common issue: **Late delivery**

🏆 Best performing area: **Staff friendliness**

### Loopy Recommendation

> “Delivery-related complaints increased significantly this month. Consider reviewing peak-hour delivery capacity.”

This is where Loopy becomes substantially more valuable than Google Forms, Typeform, or a basic review widget.

---

# 30. Key Product Risks

| Risk                               | Impact | Mitigation                      |
| ---------------------------------- | ------ | ------------------------------- |
| Businesses don't see enough value  | High   | Focus on actionable insights    |
| Low customer response rate         | High   | QR codes + simple mobile forms  |
| Gamification becomes a distraction | Medium | Keep it secondary               |
| Subscription friction              | High   | Free/trial entry point          |
| Spam feedback                      | High   | Rate limiting + abuse detection |
| Weak analytics                     | High   | Structured database             |
| Payment failures                   | High   | Robust subscription lifecycle   |
| Email deliverability               | Medium | Production-grade email provider |
| SQLite scaling                     | Medium | PostgreSQL migration path       |
| Product becomes too broad          | High   | Focus MVP on feedback loop      |

---

# 31. Competitive Positioning

Loopy should NOT attempt to compete simply on:

> “We have prettier forms.”

Instead:

### Forms

Collect information.

### Review platforms

Collect public reviews.

### Loopy

**Helps businesses continuously understand and act on customer experience.**

The differentiation should therefore become:

**Feedback + alerts + analytics + action**

rather than:

**Forms + gamification.**

---

# 32. Final Product Definition

### Loopy is:

> **A customer feedback and experience platform that helps businesses collect customer feedback, identify problems quickly, and take action to improve the customer experience.**

### The fundamental loop is:

**Collect → Understand → Alert → Act → Improve**

### The customer's experience:

**Scan → Rate → Tell us → Submit**

### The business experience:

**Create → Share → Receive → Understand → Act**

### The long-term vision:

**Turn customer feedback into a continuous improvement system for businesses.**

---

# 33. MVP Product Priority

The development team should prioritize features in this order:

### P0 — Must Have

* Authentication
* Business profile
* Campaign creation
* Questions
* Public feedback page
* Ratings
* Text feedback
* Response storage
* Dashboard
* Email notification
* Basic analytics
* Subscription/payment
* QR code generation

### P1 — Important

* Campaign editing
* Pause/resume campaigns
* Feedback status
* Critical feedback alerts
* CSV export
* Custom branding
* Slack/Discord
* Notification schedules

### P2 — Later

* XP
* Streaks
* Levels
* Sentiment analysis
* AI insights
* WhatsApp
* Team accounts
* Multiple locations
* Advanced reporting
* API

---

# 34. Product Principle

**Loopy should never become a place where businesses simply collect feedback and forget about it.**

Every major feature should answer one question:

> **Does this help the business understand the customer better or take action faster?**

If the answer is no, the feature should probably not be part of the core product.
