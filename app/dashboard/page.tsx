import { auth } from "@/auth";
import { getOrganisationsByEmail } from "@/lib/db";
import Link from "next/link";

const PRODUCTS: Record<string, { name: string; color: string; icon: string }> = {
  faithdesk:  { name: "FaithDesk",  color: "#8B5CF6", icon: "FD" },
  detaildesk: { name: "DetailDesk", color: "#F59E0B", icon: "DD" },
  schooldesk: { name: "SchoolDesk", color: "#10B981", icon: "SD" },
};

function fmtN(n: number) { return "N" + Number(n).toLocaleString("en-NG"); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }); }

export default async function DashboardPage() {
  const session = await auth();
  const email = session?.user?.email || "";
  const orgs = await getOrganisationsByEmail(email);
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 32px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(226,232,240,0.3)", marginBottom: 8 }}>
          JKTL Identity Hub
        </p>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2rem)", fontWeight: 700, color: "#fff", marginBottom: 4 }}>
          Hello, {firstName}.
        </h1>
        <p style={{ fontSize: "0.88rem", color: "rgba(226,232,240,0.45)" }}>
          Your JK Technology Limited products and subscriptions.
        </p>
      </div>

      {/* No products */}
      {orgs.length === 0 && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "48px 32px", textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <span style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: "#C9A84C" }}>JK</span>
          </div>
          <p style={{ fontWeight: 700, color: "#fff", fontSize: "1rem", marginBottom: 8 }}>No products yet</p>
          <p style={{ fontSize: "0.85rem", color: "rgba(226,232,240,0.4)", marginBottom: 28, maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.6 }}>
            You do not have any active Desk products. Choose one below -- self-service onboarding takes less than 10 minutes.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`${process.env.NEXT_PUBLIC_MAIN_SITE || "https://jktl.com.ng"}/get-started/faithdesk`}
              style={{ display: "inline-flex", alignItems: "center", padding: "11px 24px", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", background: "#8B5CF6", color: "#fff", textDecoration: "none" }}>
              Get FaithDesk
            </a>
            <a href={`${process.env.NEXT_PUBLIC_MAIN_SITE || "https://jktl.com.ng"}/get-started/detaildesk`}
              style={{ display: "inline-flex", alignItems: "center", padding: "11px 24px", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", background: "#F59E0B", color: "#060E2A", textDecoration: "none" }}>
              Get DetailDesk
            </a>
            <a href={`${process.env.NEXT_PUBLIC_MAIN_SITE || "https://jktl.com.ng"}/get-started`}
              style={{ display: "inline-flex", alignItems: "center", padding: "11px 24px", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", background: "rgba(255,255,255,0.06)", color: "rgba(226,232,240,0.7)", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none" }}>
              View All
            </a>
          </div>
        </div>
      )}

      {/* Products list */}
      {orgs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
          <p style={{ fontFamily: "monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(226,232,240,0.3)" }}>Your Products</p>
          {orgs.map((org: Record<string, unknown>) => {
            const meta = PRODUCTS[org.product as string] || { name: org.product as string, color: "#666", icon: "?" };
            const active = org.status === "active";
            return (
              <div key={org.id as string} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ borderLeft: `4px solid ${meta.color}`, padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: meta.color + "20", border: `1px solid ${meta.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.72rem", fontWeight: 700, color: meta.color }}>{meta.icon}</span>
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>{meta.name}</p>
                          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: active ? "rgba(5,150,105,0.15)" : "rgba(245,158,11,0.15)", color: active ? "#34D399" : "#FCD34D" }}>
                            {(org.status as string).replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "rgba(226,232,240,0.5)" }}>{org.org_name as string}</p>
                        <p style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "rgba(226,232,240,0.3)", marginTop: 2 }}>{org.subdomain as string}.jktl.com.ng</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "#fff", lineHeight: 1 }}>
                        {fmtN(Number(org.monthly_fee))}<span style={{ fontWeight: 400, fontSize: "0.75rem", color: "rgba(226,232,240,0.3)" }}>/mo</span>
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "rgba(226,232,240,0.35)", marginBottom: 10, textTransform: "capitalize" }}>{org.plan as string} plan</p>
                      {active && (
                        <a href={`https://${org.subdomain as string}.jktl.com.ng`} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", background: meta.color, color: meta.color === "#F59E0B" ? "#060E2A" : "#fff", textDecoration: "none" }}>
                          Open
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {[
                      { l: "Setup Fee Paid", v: fmtN(Number(org.setup_fee)) },
                      { l: "Monthly",        v: fmtN(Number(org.monthly_fee)) },
                      { l: "Activated",      v: org.activated_at ? fmtDate(org.activated_at as string) : "Pending" },
                    ].map(d => (
                      <div key={d.l}>
                        <p style={{ fontFamily: "monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(226,232,240,0.25)", marginBottom: 4 }}>{d.l}</p>
                        <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff" }}>{d.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <a href={`${process.env.NEXT_PUBLIC_MAIN_SITE || "https://jktl.com.ng"}/get-started`}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 10, border: "1.5px dashed rgba(255,255,255,0.1)", color: "rgba(226,232,240,0.35)", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add another product
          </a>
        </div>
      )}

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {[
          { href: "/dashboard/billing", icon: "BL", label: "Billing & Payments",   desc: "Invoices, subscriptions, payment history" },
          { href: "/dashboard/profile", icon: "PR", label: "Account Settings",      desc: "Update your name, email, and password" },
          { href: `${process.env.NEXT_PUBLIC_MAIN_SITE || "https://jktl.com.ng"}/faithdesk#learn`, icon: "LN", label: "Training Videos", desc: "Step-by-step video guides for FaithDesk and DetailDesk" },
          { href: `${process.env.NEXT_PUBLIC_MAIN_SITE || "https://jktl.com.ng"}/affiliates`, icon: "AF", label: "Affiliate Programme", desc: "Earn by referring businesses to Desk" },
        ].map(item => (
          <a key={item.href} href={item.href}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "20px", textDecoration: "none", display: "block", transition: "background 0.15s" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <span style={{ fontFamily: "monospace", fontSize: "0.62rem", fontWeight: 700, color: "#C9A84C" }}>{item.icon}</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff", marginBottom: 4 }}>{item.label}</p>
            <p style={{ fontSize: "0.75rem", color: "rgba(226,232,240,0.4)", lineHeight: 1.5 }}>{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
