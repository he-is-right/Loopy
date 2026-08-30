const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// Create or open the database file in the server directory
const dbPath = path.join(__dirname, 'loopy.db');
const db = new DatabaseSync(dbPath);

// Initialize tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        plan_type TEXT DEFAULT 'free',
        notification_frequency TEXT DEFAULT 'immediate',
        xp INTEGER DEFAULT 0,
        streak_days INTEGER DEFAULT 1,
        last_login_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        squad_token TEXT,
        plan_is_annual BOOLEAN DEFAULT 0,
        renewal_failed_attempts INTEGER DEFAULT 0
    );
`);

// Automatically add plan_type column if upgrading from an older schema version
try {
    db.exec("ALTER TABLE users ADD COLUMN plan_type TEXT DEFAULT 'free'");
} catch (err) {}

// Automatically add notification_frequency column if upgrading from an older schema version
try {
    db.exec("ALTER TABLE users ADD COLUMN notification_frequency TEXT DEFAULT 'immediate'");
} catch (err) {}

// Automatically add gamification columns if upgrading from an older schema version
try {
    db.exec("ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0");
    db.exec("ALTER TABLE users ADD COLUMN streak_days INTEGER DEFAULT 1");
    db.exec("ALTER TABLE users ADD COLUMN last_login_date DATE");
} catch (err) {}

// Automatically add plan_expires_at column if upgrading from an older schema version
try {
    db.exec("ALTER TABLE users ADD COLUMN plan_expires_at DATETIME");
} catch (err) {}

// Automatically add subscription columns if upgrading from an older schema version
try {
    db.exec("ALTER TABLE users ADD COLUMN squad_token TEXT");
    db.exec("ALTER TABLE users ADD COLUMN plan_is_annual BOOLEAN DEFAULT 0");
    db.exec("ALTER TABLE users ADD COLUMN renewal_failed_attempts INTEGER DEFAULT 0");
} catch (err) {}

// Automatically add webhook_url column if upgrading from an older schema version
try {
    db.exec("ALTER TABLE campaigns ADD COLUMN webhook_url TEXT");
} catch (err) {}

// Automatically add logo_data column to campaigns if upgrading from an older schema version
try {
    db.exec("ALTER TABLE campaigns ADD COLUMN logo_data TEXT");
} catch (err) {}

// Automatically add status column to responses if upgrading from an older schema version
try {
    db.exec("ALTER TABLE responses ADD COLUMN status TEXT DEFAULT 'new'");
} catch (err) {}

db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        brand_color TEXT DEFAULT '#000000',
        logo_data TEXT,
        webhook_url TEXT,
        questions_json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        answers_json TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
    );

    CREATE TABLE IF NOT EXISTS pending_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        campaign_id INTEGER NOT NULL,
        response_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (response_id) REFERENCES responses(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        transaction_ref TEXT UNIQUE NOT NULL,
        plan_type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT DEFAULT 'NGN',
        status TEXT DEFAULT 'pending',
        squad_response_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);

module.exports = db;
