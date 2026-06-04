import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, generateReferralCode, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, referredBy } = await req.json();

    if (!name?.trim() || !email?.includes("@") || !password || password.length < 8) {
      return NextResponse.json({ error: "Invalid input. Name, valid email, and password (min 8 chars) required." }, { status: 400 });
    }

    if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const rows = await sql`
      INSERT INTO users (email, name, password_hash, email_verified, last_login_at)
      VALUES (${email.toLowerCase().trim()}, ${name.trim()}, ${passwordHash}, FALSE, NOW())
      RETURNING id, email, name
    `;

    const user = rows[0];

    // Track referral if came via affiliate link
    if (referredBy) {
      await sql`
        INSERT INTO referral_leads (user_id, ref_email, status)
        SELECT u.id, ${email}, 'new'
        FROM users u WHERE u.referral_code = ${referredBy}
      `.catch(() => {});
    }

    // Send verification email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await sql`
        INSERT INTO email_verifications (user_id, token, expires_at)
        VALUES (${user.id}, ${token}, ${expires.toISOString()})
      `;
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "JK Technology <noreply@jktl.com.ng>",
          to: [email],
          subject: "Verify your JKTL account",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
              <h2 style="color:#060E2A;">Welcome to JKTL, ${name}!</h2>
              <p>Click the button below to verify your email and access your account.</p>
              <p style="margin:24px 0;">
                <a href="${verifyUrl}" style="display:inline-block;background:#C9A84C;color:#060E2A;padding:12px 28px;text-decoration:none;font-weight:700;border-radius:4px;">
                  Verify Email
                </a>
              </p>
              <p style="color:#999;font-size:13px;">This link expires in 24 hours.</p>
              <p style="color:#999;font-size:12px;">JK Technology Limited &mdash; accounts.jktl.com.ng</p>
            </div>
          `,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
