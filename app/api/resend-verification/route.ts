import { NextRequest, NextResponse } from "next/server";
import { getAccountByEmail, createVerificationToken } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const account = await getAccountByEmail(email);
    if (!account) return NextResponse.json({ error: "No account found" }, { status: 404 });
    if (account.email_verified) return NextResponse.json({ error: "Already verified" }, { status: 400 });

    const token = await createVerificationToken(email);
    const resendKey = process.env.RESEND_API_KEY;
    const verifyUrl = `${process.env.NEXTAUTH_URL || "https://accounts.jktl.com.ng"}/verify?token=${token}`;

    if (!resendKey) {
      console.log(`[DEV] Resend verification link: ${verifyUrl}`);
      return NextResponse.json({ ok: true });
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "JK Technology Limited <verify-accounts-jktl@mail.ibiz.name.ng>",
        to: [email],
        subject: "Verify your JKTL account",
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;">
          <h2 style="color:#060E2A;">Verify your email</h2>
          <p>Click below to verify your JKTL account. This link expires in 24 hours.</p>
          <a href="${verifyUrl}" style="display:inline-block;background:#C9A84C;color:#060E2A;font-weight:700;padding:14px 28px;text-decoration:none;border-radius:6px;margin:16px 0;">Verify Account</a>
          <p style="font-size:12px;color:#999;">${verifyUrl}</p>
        </div>`,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
