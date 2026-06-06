import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAccountByEmail, sql, createVerificationToken } from "@/lib/db";

export const dynamic = "force-dynamic";

async function sendVerificationEmail(email: string, name: string, token: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("\n========================================");
    console.log("[JKTL DEV] No RESEND_API_KEY set.");
    console.log("[JKTL DEV] Copy this link to verify:");
    console.log(`[JKTL DEV] ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify?token=${token}`);
    console.log("========================================\n");
    return;
  }

  const verifyUrl = `${process.env.NEXTAUTH_URL || "https://accounts.jktl.com.ng"}/verify?token=${token}`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "JK Technology Limited <verify-accounts-jktl@mail.ibiz.name.ng>",
      to: [email],
      subject: "Verify your JKTL account",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#060E2A;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
          <div style="max-width:520px;margin:40px auto;padding:0 20px;">
            <div style="background:#0B1640;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
              <!-- Header -->
              <div style="background:#060E2A;padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:center;">
                <p style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#C9A84C;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 6px;">JK Technology Limited</p>
                <p style="font-size:13px;color:rgba(226,232,240,0.4);margin:0;">accounts.jktl.com.ng</p>
              </div>
              <!-- Body -->
              <div style="padding:36px 32px;">
                <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 10px;">Verify your email address</h1>
                <p style="font-size:15px;color:rgba(226,232,240,0.6);margin:0 0 28px;line-height:1.6;">
                  Hi ${name.split(" ")[0]}, welcome to JK Technology Limited. Click the button below to verify your email and activate your account.
                </p>
                <a href="${verifyUrl}"
                  style="display:inline-block;background:#C9A84C;color:#060E2A;font-weight:700;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:6px;">
                  Verify My Account
                </a>
                <p style="font-size:12px;color:rgba(226,232,240,0.3);margin:24px 0 0;line-height:1.6;">
                  This link expires in 24 hours. If you did not create a JKTL account, you can ignore this email.
                </p>
                <p style="font-size:11px;color:rgba(226,232,240,0.2);margin:16px 0 0;word-break:break-all;">
                  ${verifyUrl}
                </p>
              </div>
              <!-- Footer -->
              <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                <p style="font-size:11px;color:rgba(226,232,240,0.2);margin:0;">
                  JK Technology Limited &mdash; CAC RC-8754824 &mdash; jktl.com.ng
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
    if (!email?.includes("@")) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    if (!sql) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

    const existing = await getAccountByEmail(email);
    if (existing) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

    const hash = await bcrypt.hash(password, 12);
    await sql`
      INSERT INTO jktl_accounts (name, email, password_hash, provider, email_verified)
      VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${hash}, 'email', FALSE)
    `;

    // Create verification token and send email
    const token = await createVerificationToken(email.toLowerCase().trim());
    await sendVerificationEmail(email.toLowerCase().trim(), name.trim(), token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Sign-up error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
