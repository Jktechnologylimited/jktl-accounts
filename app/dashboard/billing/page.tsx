import { auth } from "@/auth";
import { getOrganisationsByEmail } from "@/lib/db";

const PRODUCTS: Record<string, { name: string; color: string; icon: string }> = {
  faithdesk:  { name: "FaithDesk",  color: "#8B5CF6", icon: "FD" },
  detaildesk: { name: "DetailDesk", color: "#F59E0B", icon: "DD" },
  schooldesk: { name: "SchoolDesk", color: "#10B981", icon: "SD" },
};

function fmtN(n: number) { return "N" + Number(n).toLocaleString("en-NG"); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }); }
function nextBilling(activatedAt: string) {
  const d = new Date(activatedAt);
  const now = new Date();
  d.setMonth(now.getMonth() + 1);
  d.setFullYear(now.getFullYear());
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

const T = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const mono = "'JetBrains Mono', monospace";

export default async function BillingPage() {
  const session = await auth();
  const orgs = await getOrganisationsByEmail(session?.user?.email || "");

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 32px", ...T }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: mono, fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(226,232,240,0.3)", marginBottom: 8 }}>Billing</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>Billing & Payments</h1>
        <p style={{ fontSize: "0.85rem", color: "rgba(226,232,240,0.4)" }}>Your subscriptions, invoices, and payment history.</p>
      </div>

      {orgs.length === 0 ? (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "48px 32px", textAlign: "center" as const }}>
          <p style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>No active subscriptions</p>
          <p style={{ fontSize: "0.85rem", color: "rgba(226,232,240,0.4)", marginBottom: 24 }}>Get a Desk product to see billing here.</p>
          <a href="http://localhost:3000/get-started"
            style={{ display: "inline-flex", padding: "11px 28px", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase" as const, letterSpacing: "0.08em", background: "#C9A84C", color: "#060E2A", textDecoration: "none" }}>
            Get a Product
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
          {orgs.map((org: Record<string, unknown>) => {
            const meta = PRODUCTS[org.product as string] || { name: String(org.product), color: "#666", icon: "?" };
            const active = org.status === "active";
            return (
              <div key={org.id as string} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", borderLeft: `4px solid ${meta.color}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: meta.color + "20", border: `1px solid ${meta.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: mono, fontSize: "0.68rem", fontWeight: 700, color: meta.color }}>{meta.icon}</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{org.org_name as string}</p>
                      <p style={{ fontSize: "0.75rem", color: "rgba(226,232,240,0.4)" }}>{meta.name} -- {org.plan as string} plan</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "#fff", lineHeight: 1 }}>
                      {fmtN(Number(org.monthly_fee))}<span style={{ fontWeight: 400, fontSize: "0.75rem", color: "rgba(226,232,240,0.35)" }}>/mo</span>
                    </p>
                    <span style={{ fontFamily: mono, fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: active ? "rgba(5,150,105,0.15)" : "rgba(245,158,11,0.15)", color: active ? "#34D399" : "#FCD34D" }}>
                      {(org.status as string).replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: "20px 24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 20, marginBottom: 20 }}>
                    {[
                      { l: "Setup Fee Paid", v: fmtN(Number(org.setup_fee)), s: org.activated_at ? fmtDate(org.activated_at as string) : "Pending" },
                      { l: "Monthly",        v: fmtN(Number(org.monthly_fee)), s: "billed via Paystack" },
                      { l: "Next Payment",   v: active && org.activated_at ? fmtN(Number(org.monthly_fee)) : "--", s: active && org.activated_at ? nextBilling(org.activated_at as string) : "Pending activation" },
                    ].map(d => (
                      <div key={d.l}>
                        <p style={{ fontFamily: mono, fontSize: "0.58rem", textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "rgba(226,232,240,0.25)", marginBottom: 4 }}>{d.l}</p>
                        <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>{d.v}</p>
                        <p style={{ fontSize: "0.72rem", color: "rgba(226,232,240,0.35)" }}>{d.s}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {[
                      { label: "Upgrade Plan",    href: "https://jktl.com.ng/contact" },
                      { label: "Contact Support", href: "https://jktl.com.ng/contact" },
                    ].map(btn => (
                      <a key={btn.label} href={btn.href}
                        style={{ display: "inline-flex", padding: "8px 16px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, background: "rgba(255,255,255,0.06)", color: "rgba(226,232,240,0.65)", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none" }}>
                        {btn.label}
                      </a>
                    ))}
                    <a href={`https://wa.me/2347036580994?text=Hi, I need help with my ${meta.name} subscription`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, background: "rgba(37,211,102,0.08)", color: "#16a34a", border: "1px solid rgba(37,211,102,0.2)", textDecoration: "none" }}>
                      WhatsApp Support
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Paystack note */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#fff", marginBottom: 4 }}>Payments processed by Paystack</p>
              <p style={{ fontSize: "0.78rem", color: "rgba(226,232,240,0.45)", lineHeight: 1.6 }}>
                Your card details are never stored by JK Technology Limited. For refund requests, WhatsApp +234 703 658 0994 or email info@jktl.com.ng.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
