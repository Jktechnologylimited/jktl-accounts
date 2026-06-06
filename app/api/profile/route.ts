import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAccountByEmail, sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "No database" }, { status: 503 });

  const { name, currentPassword, newPassword } = await req.json();

  try {
    if (name) {
      await sql`UPDATE jktl_accounts SET name = ${name.trim()}, updated_at = NOW() WHERE email = ${session.user.email}`;
    }

    if (currentPassword && newPassword) {
      const account = await getAccountByEmail(session.user.email);
      if (!account?.password_hash) return NextResponse.json({ error: "No password set on this account (OAuth login)" }, { status: 400 });
      const valid = await bcrypt.compare(currentPassword, account.password_hash);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      const hash = await bcrypt.hash(newPassword, 12);
      await sql`UPDATE jktl_accounts SET password_hash = ${hash}, updated_at = NOW() WHERE email = ${session.user.email}`;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
