import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL || "";
export const sql = DATABASE_URL ? neon(DATABASE_URL) : null as any;

export const ACCOUNTS_SCHEMA = `
CREATE TABLE IF NOT EXISTS jktl_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  avatar_url    TEXT,
  provider      TEXT DEFAULT 'email',
  provider_id   TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jktl_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    UUID REFERENCES jktl_accounts(id) ON DELETE CASCADE,
  token         TEXT UNIQUE NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jktl_accounts_email   ON jktl_accounts(email);
CREATE INDEX IF NOT EXISTS idx_jktl_sessions_token   ON jktl_sessions(token);
CREATE INDEX IF NOT EXISTS idx_jktl_sessions_account ON jktl_sessions(account_id);

CREATE TABLE IF NOT EXISTS jktl_verification_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jktl_verify_token ON jktl_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_jktl_verify_email ON jktl_verification_tokens(email);
`;

export async function getAccountByEmail(email: string) {
  if (!sql) return null;
  const rows = await sql`SELECT * FROM jktl_accounts WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
  return rows[0] || null;
}

export async function getAccountById(id: string) {
  if (!sql) return null;
  const rows = await sql`SELECT * FROM jktl_accounts WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}

export async function getOrganisationsByEmail(email: string) {
  if (!sql) return [];
  try {
    return await sql`
      SELECT id, product, plan, org_name, subdomain, status, brand_color, logo_url,
             setup_fee, monthly_fee, activated_at, created_at
      FROM organisations
      WHERE owner_email = ${email.toLowerCase()}
      ORDER BY created_at DESC
    `;
  } catch {
    return [];
  }
}

export async function getBillingByEmail(email: string) {
  if (!sql) return [];
  try {
    return await sql`
      SELECT o.*, pr.amount as last_payment, pr.created_at as last_payment_date
      FROM organisations o
      LEFT JOIN payout_requests pr ON pr.affiliate_id = o.id
      WHERE o.owner_email = ${email.toLowerCase()}
      ORDER BY o.created_at DESC
    `;
  } catch {
    return [];
  }
}

export async function createVerificationToken(email: string): Promise<string> {
  const token = crypto.randomUUID() + "-" + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await sql`DELETE FROM jktl_verification_tokens WHERE email = ${email}`;
  await sql`
    INSERT INTO jktl_verification_tokens (email, token, expires_at)
    VALUES (${email.toLowerCase()}, ${token}, ${expiresAt.toISOString()})
  `;
  return token;
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  const rows = await sql`
    SELECT * FROM jktl_verification_tokens
    WHERE token = ${token} AND expires_at > NOW()
    LIMIT 1
  `;
  if (!rows[0]) return null;
  const email = rows[0].email as string;
  await sql`UPDATE jktl_accounts SET email_verified = TRUE, updated_at = NOW() WHERE email = ${email}`;
  await sql`DELETE FROM jktl_verification_tokens WHERE token = ${token}`;
  return email;
}
