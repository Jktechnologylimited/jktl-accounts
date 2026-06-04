import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAffiliateStats } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ stats:{} });
  try {
    const stats = await getAffiliateStats(session.user.id);
    return NextResponse.json({ stats });
  } catch (err) {
    return NextResponse.json({ error:String(err) }, { status:500 });
  }
}
