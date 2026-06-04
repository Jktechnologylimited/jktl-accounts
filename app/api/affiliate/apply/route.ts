import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateReferralCode, getUserById } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok:true });
  const { businessName, howPromote } = await req.json();
  if (!howPromote?.trim()) return NextResponse.json({ error:"How promote is required" }, { status:400 });
  const { sql } = await import("@/lib/db");
  const user = await getUserById(session.user.id);
  if (user?.affiliate_status) return NextResponse.json({ error:"Already applied" }, { status:409 });
  let code = generateReferralCode(user?.name || "User");
  // Ensure unique
  for (let i=0; i<5; i++) {
    const exists = await sql`SELECT id FROM users WHERE referral_code=${code} LIMIT 1`;
    if (!exists.length) break;
    code = generateReferralCode(user?.name || "User");
  }
  await sql`
    UPDATE users SET
      affiliate_status='pending', referral_code=${code},
      business_name=${businessName||null}, how_promote=${howPromote},
      signup_bonus=10000, bonus_expires_at=NOW() + INTERVAL '90 days',
      updated_at=NOW()
    WHERE id=${session.user.id}
  `;
  // Notify JKTL
  const resend = process.env.RESEND_API_KEY;
  if (resend) {
    await fetch("https://api.resend.com/emails", {
      method:"POST", headers:{ Authorization:`Bearer ${resend}`, "Content-Type":"application/json" },
      body: JSON.stringify({ from:"JKTL System <noreply@jktl.com.ng>", to:["info@jktl.com.ng"],
        subject:`New Affiliate Application: ${user?.name}`,
        html:`<p><b>Name:</b> ${user?.name}<br><b>Email:</b> ${user?.email}<br><b>Plan:</b> ${howPromote}</p>`
      })
    }).catch(()=>{});
  }
  return NextResponse.json({ ok:true });
}
