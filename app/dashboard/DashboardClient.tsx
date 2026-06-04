"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

const PRODUCTS = [
  {
    id: "faithdesk", name: "FaithDesk", icon: "FD", color: "#8B5CF6",
    tagline: "Ministry Management", status: "live",
    description: "Members, tithes, offerings, analytics, and ministry portal.",
    getStartedHref: "https://jktl.com.ng/get-started/faithdesk",
    learnMoreHref: "https://jktl.com.ng/faithdesk",
  },
  {
    id: "detaildesk", name: "DetailDesk", icon: "DD", color: "#F59E0B",
    tagline: "Auto Detailing Business", status: "live",
    description: "Online store, job assignment, roles, CRM, and analytics.",
    getStartedHref: "https://jktl.com.ng/get-started/detaildesk",
    learnMoreHref: "https://jktl.com.ng/detaildesk",
  },
  {
    id: "schooldesk", name: "SchoolDesk", icon: "SD", color: "#10B981",
    tagline: "School Administration", status: "coming-soon",
    description: "Fees, student portal, staff management, public website.",
    getStartedHref: "https://jktl.com.ng/schooldesk",
    learnMoreHref: "https://jktl.com.ng/schooldesk",
  },
];

interface Props {
  user: { id:string; name:string; email:string; avatar:string|null; affiliateStatus:string|null; referralCode:string|null; affiliateTier:string; };
  organisations: Record<string,unknown>[];
  affStats: { clicks:number; leads:number; availableForPayout:number; total:number; } | null;
}

function fmtN(n: number) { return "N" + Number(n).toLocaleString("en-NG"); }

const TIER_COLOR: Record<string,string> = { standard:"#60A5FA", silver:"#94A3B8", gold:"#C9A84C" };

export default function DashboardClient({ user, organisations, affStats }: Props) {
  const [tab, setTab] = useState<"products"|"affiliate">("products");

  const ownedProductIds = organisations.map(o => o.product as string);
  const isAffiliate = !!user.affiliateStatus;
  const APP_URL = "https://accounts.jktl.com.ng";

  return (
    <div className="min-h-screen" style={{ background:"#080F25" }}>
      {/* Top nav */}
      <nav className="h-16 flex items-center justify-between px-5 sm:px-8 border-b" style={{ borderColor:"rgba(255,255,255,0.07)", background:"rgba(6,14,42,0.8)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:50 }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"rgba(201,168,76,0.15)", border:"1px solid rgba(201,168,76,0.25)" }}>
            <span className="font-mono font-bold text-xs" style={{ color:"#C9A84C" }}>JK</span>
          </div>
          <span className="font-bold text-white text-sm hidden sm:block">JK Technology</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Avatar / email */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}>
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
              : <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold" style={{ background:"rgba(201,168,76,0.2)", color:"#C9A84C" }}>
                  {user.name.slice(0,1).toUpperCase()}
                </div>
            }
            <span className="text-[0.78rem] text-white/70 hidden sm:block">{user.name}</span>
          </div>
          <Link href="/profile" className="btn-ghost py-1.5 px-3 text-xs">Profile</Link>
          <button onClick={() => signOut({ callbackUrl:"/login" })} className="btn-ghost py-1.5 px-3 text-xs" style={{ color:"rgba(248,113,113,0.7)" }}>
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-bold text-2xl sm:text-3xl text-white mb-1">
            Hello, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm" style={{ color:"rgba(226,232,240,0.45)" }}>
            Your JKTL account dashboard. Access your products and affiliate program.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
          {(["products","affiliate"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 text-sm font-semibold rounded-lg capitalize transition-all"
              style={{ background: tab===t ? "rgba(255,255,255,0.1)" : "transparent", color: tab===t ? "#fff" : "rgba(226,232,240,0.45)" }}>
              {t === "affiliate" ? "Affiliate" : "My Products"}
            </button>
          ))}
        </div>

        {/* -- PRODUCTS TAB -- */}
        {tab === "products" && (
          <div>
            {/* Owned products */}
            {ownedProductIds.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color:"rgba(226,232,240,0.3)" }}>Your Products</p>
                <div className="flex flex-col gap-3">
                  {organisations.map(org => {
                    const p = PRODUCTS.find(p => p.id === org.product);
                    return (
                      <div key={org.id as string} className="product-card owned flex flex-col sm:flex-row sm:items-center gap-4"
                        style={{ borderColor:"rgba(52,211,153,0.2)", background:"rgba(52,211,153,0.04)" }}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background:(p?.color||"#666")+"20", border:`1px solid ${p?.color||"#666"}40` }}>
                            <span className="font-mono text-xs font-bold" style={{ color: p?.color||"#666" }}>{p?.icon||"??"}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-white text-sm">{org.org_name as string}</p>
                              <span className="badge badge-active">{org.status as string}</span>
                            </div>
                            <p className="text-xs truncate" style={{ color:"rgba(226,232,240,0.4)" }}>
                              {p?.name} -- {org.plan as string} -- {org.subdomain as string}.jktl.com.ng
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap">
                          <a href={`https://admin.${org.subdomain}.jktl.com.ng`} target="_blank" rel="noopener noreferrer"
                            className="btn-gold text-xs py-2 px-4">
                            Open Admin
                          </a>
                          <Link href="/billing" className="btn-ghost text-xs py-2 px-4">Billing</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All products */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color:"rgba(226,232,240,0.3)" }}>
                {ownedProductIds.length > 0 ? "Get Another Product" : "Available Products"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRODUCTS.map(p => {
                  const owned = ownedProductIds.includes(p.id);
                  return (
                    <div key={p.id} className={`product-card flex flex-col ${owned ? "opacity-60" : ""}`}
                      style={{ borderTop:`2px solid ${p.color}` }}>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ background:p.color+"20", border:`1px solid ${p.color}40` }}>
                          <span className="font-mono text-xs font-bold" style={{ color:p.color }}>{p.icon}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{p.name}</p>
                          <p className="font-mono text-[0.52rem] tracking-wider" style={{ color: p.status==="live" ? "#34D399" : "#F59E0B" }}>
                            {p.status === "live" ? "LIVE" : "COMING SOON"}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs flex-1 mb-4" style={{ color:"rgba(226,232,240,0.5)", lineHeight:1.6 }}>{p.description}</p>
                      {owned ? (
                        <span className="badge badge-active self-start">Already owned</span>
                      ) : p.status === "live" ? (
                        <a href={p.getStartedHref} className="btn-gold text-xs py-2.5 w-full" style={{ background:p.color, color:"#fff" }}>
                          Get Started
                        </a>
                      ) : (
                        <a href={p.learnMoreHref} className="btn-ghost text-xs py-2.5 w-full">Join Waitlist</a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom services */}
            <div className="mt-6 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.15)" }}>
              <div className="flex-1">
                <p className="font-bold text-sm text-white mb-1">Need a custom solution?</p>
                <p className="text-xs" style={{ color:"rgba(226,232,240,0.5)" }}>Website, SEO, CRM, AI chatbot, payment systems -- custom built for your business.</p>
              </div>
              <a href="https://jktl.com.ng/get-started/services" className="btn-gold text-xs py-2.5 px-5 shrink-0">
                Submit Inquiry
              </a>
            </div>
          </div>
        )}

        {/* -- AFFILIATE TAB -- */}
        {tab === "affiliate" && (
          <div>
            {!isAffiliate ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background:"rgba(52,211,153,0.1)", border:"2px solid rgba(52,211,153,0.2)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
                  </svg>
                </div>
                <h2 className="font-bold text-xl text-white mb-2">Join the Affiliate Program</h2>
                <p className="text-sm mb-2" style={{ color:"rgba(226,232,240,0.5)", maxWidth:380, margin:"0 auto 12px" }}>
                  Earn by referring businesses to JKTL products. N10,000 welcome bonus. 5% on setup fees. 2% recurring for 3 months.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 flex-wrap">
                  {[
                    { v:"N10,000", l:"Welcome bonus" },
                    { v:"5%",      l:"Setup fee commission" },
                    { v:"2% x3",   l:"Monthly recurring" },
                    { v:"N100k",   l:"Min. payout" },
                  ].map(s => (
                    <div key={s.l} className="px-5 py-3 rounded-lg text-center" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                      <p className="font-bold text-lg text-white">{s.v}</p>
                      <p className="text-xs" style={{ color:"rgba(226,232,240,0.4)" }}>{s.l}</p>
                    </div>
                  ))}
                </div>
                <Link href="/affiliate/apply" className="btn-gold px-8 py-3 inline-flex mt-8">
                  Apply to Become an Affiliate
                </Link>
              </div>
            ) : (
              <div>
                {/* Affiliate status banner */}
                {user.affiliateStatus === "pending" && (
                  <div className="p-4 rounded-xl mb-6" style={{ background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.2)" }}>
                    <p className="font-bold text-sm mb-1" style={{ color:"#C9A84C" }}>Application Under Review</p>
                    <p className="text-xs" style={{ color:"rgba(226,232,240,0.5)" }}>
                      We review all applications within 24-48 hours. You will receive an email when approved.
                    </p>
                  </div>
                )}

                {user.affiliateStatus === "active" && (
                  <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {[
                        { l:"Clicks",    v: affStats?.clicks || 0,                              c:"#60A5FA" },
                        { l:"Referrals", v: affStats?.leads  || 0,                              c:"#A78BFA" },
                        { l:"Earned",    v: fmtN(affStats?.total || 0),                         c:"#34D399" },
                        { l:"Available", v: fmtN(affStats?.availableForPayout || 0),            c:"#C9A84C" },
                      ].map(s => (
                        <div key={s.l} className="p-4 rounded-xl" style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${s.c}25`, borderTop:`2px solid ${s.c}` }}>
                          <p className="font-bold text-lg text-white leading-none mb-1">{s.v}</p>
                          <p className="text-xs font-semibold" style={{ color:s.c }}>{s.l}</p>
                        </div>
                      ))}
                    </div>

                    {/* Referral link */}
                    <div className="p-5 rounded-xl mb-5" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <p className="font-bold text-sm text-white">Your Referral Link</p>
                        <div className="flex items-center gap-1.5">
                          <span className="badge" style={{ background:`${TIER_COLOR[user.affiliateTier] || "#60A5FA"}15`, color: TIER_COLOR[user.affiliateTier] || "#60A5FA" }}>
                            {user.affiliateTier?.toUpperCase()} TIER
                          </span>
                        </div>
                      </div>
                      <div className="flex items-stretch gap-0 rounded-lg overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.1)" }}>
                        <span className="flex-1 px-3.5 py-2.5 font-mono text-xs truncate" style={{ background:"rgba(255,255,255,0.04)", color:"rgba(226,232,240,0.6)" }}>
                          https://jktl.com.ng?ref={user.referralCode || "XXXXXXXX"}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(`https://jktl.com.ng?ref=${user.referralCode}`)}
                          className="px-4 py-2.5 font-bold text-xs uppercase tracking-wide border-none cursor-pointer"
                          style={{ background:"#C9A84C", color:"#060E2A" }}>
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Links to full affiliate portal */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label:"View All Offers",    href:"/affiliate/offers" },
                        { label:"Earnings & Payouts", href:"/affiliate/earnings" },
                        { label:"All Referral Links", href:"/affiliate/links" },
                        { label:"My Referrals",       href:"/affiliate/referrals" },
                        { label:"Marketing Materials",href:"/affiliate/materials" },
                        { label:"Support",            href:"/affiliate/support" },
                      ].map(link => (
                        <Link key={link.href} href={link.href}
                          className="flex items-center gap-2 px-4 py-3 rounded-lg no-underline transition-colors"
                          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                          <span className="text-sm text-white/70 font-medium">{link.label}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
