import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok:true });
  const { name } = await req.json();
  const { sql } = await import("@/lib/db");
  await sql`UPDATE users SET name=${name||null}, updated_at=NOW() WHERE id=${session.user.id}`;
  return NextResponse.json({ ok:true });
}
