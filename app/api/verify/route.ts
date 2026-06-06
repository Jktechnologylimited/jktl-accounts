import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "missing", message: "No token provided" }, { status: 400 });
  }

  try {
    const email = await verifyEmailToken(token);
    if (!email) {
      return NextResponse.json({ error: "invalid", message: "Token is invalid or has expired" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, email });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: "server", message: String(err) }, { status: 500 });
  }
}
