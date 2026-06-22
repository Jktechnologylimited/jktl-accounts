import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

// The accounts app is the auth authority: it validates the JKTL SSO session with
// its own auth() (no cross-app cookie decryption needed) and returns whether the
// signed-in user is an affiliate. The affiliate dashboard (on the main site)
// calls this cross-subdomain with credentials.

function withCors(res: NextResponse, origin: string | null): NextResponse {
  if (origin && (origin === "https://jktl.com.ng" || origin.endsWith(".jktl.com.ng") || origin.startsWith("http://localhost"))) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Vary", "Origin");
  }
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS(req: NextRequest) {
  return withCors(new NextResponse(null, { status: 204 }), req.headers.get("origin"));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");

  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) {
    return withCors(NextResponse.json({ authenticated: false }), origin);
  }
  if (!sql) {
    return withCors(NextResponse.json({ authenticated: true, email, isAffiliate: false, error: "no-db" }), origin);
  }

  try {
    const rows = await sql`
      SELECT id, first_name, last_name, email, referral_code, tier, status
      FROM affiliates WHERE email = ${email} LIMIT 1`;
    const aff = rows[0];
    if (!aff) {
      return withCors(NextResponse.json({ authenticated: true, email, isAffiliate: false }), origin);
    }
    return withCors(NextResponse.json({
      authenticated: true,
      email,
      isAffiliate: true,
      status: aff.status,
      firstName: aff.first_name,
      lastName: aff.last_name,
      referralCode: aff.referral_code,
      tier: aff.tier,
    }), origin);
  } catch (err) {
    return withCors(NextResponse.json({ authenticated: true, email, error: String(err) }), origin);
  }
}
