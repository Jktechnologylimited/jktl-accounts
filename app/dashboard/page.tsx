import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserById, getUserOrganisations, getAffiliateStats } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let user = null;
  let orgs: unknown[] = [];
  let affStats = null;

  try {
    [user, orgs, affStats] = await Promise.all([
      getUserById(session.user.id),
      getUserOrganisations(session.user.id),
      getAffiliateStats(session.user.id),
    ]);
  } catch {
    // DB not configured -- show empty state
  }

  return (
    <DashboardClient
      user={{
        id: session.user.id,
        name: session.user.name || user?.name || "User",
        email: session.user.email || user?.email || "",
        avatar: session.user.image || user?.avatar || null,
        affiliateStatus: user?.affiliate_status || null,
        referralCode: user?.referral_code || null,
        affiliateTier: user?.affiliate_tier || "standard",
      }}
      organisations={orgs as Record<string,unknown>[]}
      affStats={affStats}
    />
  );
}
