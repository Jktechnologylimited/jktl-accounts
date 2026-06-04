import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserOrganisations } from "@/lib/db";
import Link from "next/link";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let orgs: unknown[] = [];
  try { orgs = await getUserOrganisations(session.user.id); } catch {}

  return (
    <div className="min-h-screen px-4 py-10" style={{ background:"#080F25" }}>
      <div className="max-w-[700px] mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-xs no-underline" style={{ color:"rgba(226,232,240,0.4)" }}>Dashboard</Link>
          <span style={{ color:"rgba(226,232,240,0.2)" }}>/</span>
          <p className="text-xs" style={{ color:"rgba(226,232,240,0.6)" }}>Billing</p>
        </div>
        <h1 className="font-bold text-2xl text-white mb-1">Billing</h1>
        <p className="text-sm mb-8" style={{ color:"rgba(226,232,240,0.45)" }}>Manage your subscriptions and payment history.</p>

        {orgs.length === 0 ? (
          <div className="glass p-10 text-center rounded-xl">
            <p className="font-bold text-white mb-2">No active subscriptions</p>
            <p className="text-sm mb-6" style={{ color:"rgba(226,232,240,0.4)" }}>Get started with a Desk product to see your billing here.</p>
            <Link href="/dashboard" className="btn-gold px-8 py-3">View Products</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {(orgs as Record<string,unknown>[]).map(org => (
              <div key={org.id as string} className="glass p-5 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div className="flex-1">
                    <p className="font-bold text-white mb-0.5">{org.org_name as string}</p>
                    <p className="text-xs" style={{ color:"rgba(226,232,240,0.4)" }}>
                      {(org.product as string)?.charAt(0).toUpperCase() + (org.product as string)?.slice(1)} -- {org.plan as string} plan
                    </p>
                  </div>
                  <span className={`badge ${org.status === "active" ? "badge-active" : "badge-pending"}`}>{org.status as string}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-lg" style={{ background:"rgba(255,255,255,0.04)" }}>
                    <p className="text-xs mb-1" style={{ color:"rgba(226,232,240,0.35)" }}>Setup fee paid</p>
                    <p className="font-bold text-sm text-white">N{Number(org.setup_fee).toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background:"rgba(255,255,255,0.04)" }}>
                    <p className="text-xs mb-1" style={{ color:"rgba(226,232,240,0.35)" }}>Monthly</p>
                    <p className="font-bold text-sm text-white">N{Number(org.monthly_fee).toLocaleString()}/mo</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background:"rgba(255,255,255,0.04)" }}>
                    <p className="text-xs mb-1" style={{ color:"rgba(226,232,240,0.35)" }}>Subdomain</p>
                    <p className="font-mono text-xs text-white">{org.subdomain as string}.jktl.com.ng</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <a href={`mailto:info@jktl.com.ng?subject=Upgrade ${org.org_name} subscription`} className="btn-ghost text-xs py-2 px-4">Upgrade Plan</a>
                  <a href={`mailto:info@jktl.com.ng?subject=Cancel ${org.org_name} subscription`} className="text-xs py-2 px-4 rounded-lg border cursor-pointer no-underline" style={{ color:"rgba(248,113,113,0.6)", borderColor:"rgba(248,113,113,0.15)", background:"transparent" }}>Cancel</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
