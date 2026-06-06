"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

const NAV = [
  { href: "/dashboard",         label: "My Products" },
  { href: "/dashboard/billing", label: "Billing"     },
  { href: "/dashboard/profile", label: "Profile"     },
];

const S = {
  shell:   { minHeight: "100vh", background: "#080F25", fontFamily: "'Plus Jakarta Sans', sans-serif" } as React.CSSProperties,
  header:  { position: "fixed" as const, top: 0, left: 0, right: 0, zIndex: 50, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "#060E2A", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  logo:    { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" },
  nav:     { display: "flex", alignItems: "center", gap: 4 },
  navLink: (active: boolean): React.CSSProperties => ({ display: "flex", alignItems: "center", padding: "8px 16px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, textDecoration: "none", background: active ? "rgba(201,168,76,0.1)" : "transparent", color: active ? "#C9A84C" : "rgba(226,232,240,0.5)", border: active ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent", transition: "all 0.15s" }),
  right:   { display: "flex", alignItems: "center", gap: 16 },
  avatar:  { width: 34, height: 34, borderRadius: "50%", background: "rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color: "#C9A84C" },
  signout: { display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 600, background: "rgba(239,68,68,0.08)", color: "#F87171", border: "1px solid rgba(239,68,68,0.15)", cursor: "pointer" },
  main:    { paddingTop: 64 },

  // Mobile
  burger:  { background: "none", border: "none", cursor: "pointer", color: "rgba(226,232,240,0.6)", padding: 4 },
  overlay: { position: "fixed" as const, top: 64, left: 0, right: 0, bottom: 0, zIndex: 40, background: "#060E2A", padding: "24px 20px" },
  mnavLink:(active: boolean): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 8, fontSize: "0.9rem", fontWeight: 600, textDecoration: "none", background: active ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.04)", color: active ? "#C9A84C" : "rgba(226,232,240,0.7)", marginBottom: 6 }),
};

export default function DashboardShell({ children, session }: { children: React.ReactNode; session: Session }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = session.user;
  const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : user?.email?.[0]?.toUpperCase() || "JK";

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/sign-in");
  }

  return (
    <div style={S.shell}>
      <header style={S.header}>
        {/* Logo */}
        <a href="https://jktl.com.ng" style={S.logo}>
          <Image src="/logo.png" alt="JK Technology Limited" width={38} height={38} style={{ objectFit: "contain" }} />
        </a>

        {/* Desktop nav — hidden on small screens via inline conditional */}
        <nav style={S.nav} className="hidden md:flex">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} style={S.navLink(pathname === item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div style={S.right}>
          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user?.image
              ? <img src={user.image} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
              : <div style={S.avatar}>{initials}</div>
            }
            <div className="hidden sm:block">
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff", lineHeight: 1 }}>{user?.name || "Account"}</p>
              <p style={{ fontSize: "0.65rem", color: "rgba(226,232,240,0.35)", marginTop: 2 }}>{user?.email}</p>
            </div>
          </div>

          {/* Sign out — desktop */}
          <button onClick={handleSignOut} style={S.signout} className="hidden md:flex">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>

          {/* Hamburger — mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={S.burger} className="md:hidden">
            {menuOpen
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={S.overlay} onClick={() => setMenuOpen(false)}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} style={S.mnavLink(pathname === item.href)}>
              {item.label}
            </Link>
          ))}
          <button onClick={handleSignOut}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 8, fontSize: "0.9rem", fontWeight: 600, background: "rgba(239,68,68,0.08)", color: "#F87171", border: "none", cursor: "pointer", width: "100%", marginTop: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      )}

      <main style={S.main}>{children}</main>
    </div>
  );
}
