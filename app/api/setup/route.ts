import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "No DATABASE_URL" }, { status: 503 });
  }
  try {
    const { sql } = await import("@/lib/db");

    await sql`
      CREATE TABLE IF NOT EXISTS jktl_accounts (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name           TEXT NOT NULL,
        email          TEXT UNIQUE NOT NULL,
        password_hash  TEXT,
        avatar_url     TEXT,
        provider       TEXT DEFAULT 'email',
        provider_id    TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at     TIMESTAMPTZ DEFAULT NOW(),
        updated_at     TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS jktl_sessions (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id  UUID REFERENCES jktl_accounts(id) ON DELETE CASCADE,
        token       TEXT UNIQUE NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS jktl_verification_tokens (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email      TEXT NOT NULL,
        token      TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_jktl_accounts_email   ON jktl_accounts(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jktl_sessions_token   ON jktl_sessions(token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jktl_sessions_account ON jktl_sessions(account_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jktl_verify_token     ON jktl_verification_tokens(token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jktl_verify_email     ON jktl_verification_tokens(email)`;

    // Verify tables exist
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('jktl_accounts', 'jktl_sessions', 'jktl_verification_tokens')
      ORDER BY table_name
    `;

    return NextResponse.json({
      ok: true,
      message: "Tables created successfully",
      tables: tables.map((t: { table_name: string }) => t.table_name),
    });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
