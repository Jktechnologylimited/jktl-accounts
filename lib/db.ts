import { neon } from "@neondatabase/serverless";

const DB = process.env.DATABASE_URL || "";
export const sql = DB ? neon(DB) : (null as any);

// ── SCHEMA ────────────────────────────────────────────────────────────────────
// Run GET /api/setup to initialise
export const SCHEMA = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT UNIQUE NOT NULL,
  name                TEXT,
  avatar              TEXT,
  google_id           TEXT UNIQUE,
  microsoft_id        TEXT UNIQUE,
  password_hash       TEXT,
  email_verified      BOOLEAN DEFAULT FALSE,
  verify_token        TEXT,

  -- Affiliate fields (null = not an affiliate yet)
  referral_code       TEXT UNIQUE,
  affiliate_status    TEXT DEFAULT NULL,
  affiliate_tier      TEXT DEFAULT 'standard',
  how_promote         TEXT,
  business_name       TEXT,
  signup_bonus        NUMERIC(12,2) DEFAULT 10000,
  bonus_unlocked      BOOLEAN DEFAULT FALSE,
  bonus_expires_at    TIMESTAMPTZ,
  bank_name           TEXT,
  bank_account        TEXT,
  bank_holder         TEXT,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  last_login_at       TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organisations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  product          TEXT NOT NULL,
  plan             TEXT NOT NULL,
  setup_fee        NUMERIC(12,2) NOT NULL DEFAULT 0,
  monthly_fee      NUMERIC(12,2) NOT NULL DEFAULT 0,
  org_name         TEXT NOT NULL,
  owner_name       TEXT NOT NULL,
  owner_email      TEXT NOT NULL,
  owner_phone      TEXT,
  address          TEXT,
  org_size         TEXT,
  subdomain        TEXT UNIQUE NOT NULL,
  custom_domain    TEXT,
  logo_url         TEXT,
  brand_color      TEXT DEFAULT '#8B5CF6',
  status           TEXT NOT NULL DEFAULT 'pending_payment',
  paystack_ref     TEXT,
  paystack_sub_id  TEXT,
  affiliate_code   TEXT,
  activated_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_clicks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address   TEXT,
  user_agent   TEXT,
  landing_page TEXT,
  campaign     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  ref_name     TEXT,
  ref_email    TEXT,
  service      TEXT,
  status       TEXT DEFAULT 'new',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  lead_id      UUID REFERENCES referral_leads(id),
  service_name TEXT NOT NULL,
  deal_value   NUMERIC(12,2) DEFAULT 0,
  rate         NUMERIC(5,2)  DEFAULT 5,
  amount       NUMERIC(12,2) DEFAULT 0,
  type         TEXT DEFAULT 'one-time',
  status       TEXT DEFAULT 'pending',
  paid_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payout_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  amount       NUMERIC(12,2) NOT NULL,
  status       TEXT DEFAULT 'requested',
  bank_name    TEXT,
  bank_account TEXT,
  bank_holder  TEXT,
  paid_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_verifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_resets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google       ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_microsoft    ON users(microsoft_id);
CREATE INDEX IF NOT EXISTS idx_users_ref_code     ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_orgs_user          ON organisations(user_id);
CREATE INDEX IF NOT EXISTS idx_orgs_subdomain     ON organisations(subdomain);
CREATE INDEX IF NOT EXISTS idx_commissions_user   ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_clicks_user        ON referral_clicks(user_id);
`;

// ── HELPERS ───────────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string) {
  if (!sql) return null;
  const rows = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
  return rows[0] || null;
}

export async function getUserById(id: string) {
  if (!sql) return null;
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}

export async function getUserByGoogleId(googleId: string) {
  if (!sql) return null;
  const rows = await sql`SELECT * FROM users WHERE google_id = ${googleId} LIMIT 1`;
  return rows[0] || null;
}

export async function getUserByMicrosoftId(microsoftId: string) {
  if (!sql) return null;
  const rows = await sql`SELECT * FROM users WHERE microsoft_id = ${microsoftId} LIMIT 1`;
  return rows[0] || null;
}

export async function getUserOrganisations(userId: string) {
  if (!sql) return [];
  return sql`SELECT * FROM organisations WHERE user_id = ${userId} ORDER BY created_at DESC`;
}

export async function getAffiliateStats(userId: string) {
  if (!sql) return { clicks: 0, leads: 0, pending: 0, approved: 0, paid: 0, total: 0, availableForPayout: 0 };
  const [clicks, leads, commissions, user] = await Promise.all([
    sql`SELECT COUNT(*) as total FROM referral_clicks WHERE user_id = ${userId}`,
    sql`SELECT COUNT(*) as total FROM referral_leads WHERE user_id = ${userId}`,
    sql`
      SELECT
        COALESCE(SUM(CASE WHEN status='pending'  THEN amount ELSE 0 END),0) as pending,
        COALESCE(SUM(CASE WHEN status='approved' THEN amount ELSE 0 END),0) as approved,
        COALESCE(SUM(CASE WHEN status='paid'     THEN amount ELSE 0 END),0) as paid,
        COALESCE(SUM(amount),0) as total
      FROM commissions WHERE user_id = ${userId}
    `,
    sql`SELECT signup_bonus, bonus_unlocked, bonus_expires_at FROM users WHERE id = ${userId} LIMIT 1`,
  ]);
  const u = user[0] || {};
  const bonusExpired = u.bonus_expires_at ? new Date(u.bonus_expires_at) < new Date() : false;
  const bonusAmount = u.bonus_unlocked ? Number(u.signup_bonus || 10000) : 0;
  const approved = Number(commissions[0]?.approved || 0);
  return {
    clicks:             Number(clicks[0]?.total || 0),
    leads:              Number(leads[0]?.total || 0),
    pending:            Number(commissions[0]?.pending || 0),
    approved,
    paid:               Number(commissions[0]?.paid || 0),
    total:              Number(commissions[0]?.total || 0),
    signupBonus:        Number(u.signup_bonus || 10000),
    bonusUnlocked:      Boolean(u.bonus_unlocked),
    bonusExpired,
    availableForPayout: approved + bonusAmount,
  };
}

export function generateReferralCode(name: string): string {
  const base = name.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "X").padEnd(4, "X");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${rand}`;
}
