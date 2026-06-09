"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function SignOutPage() {
  useEffect(() => {
    // Clear any cached session flags
    try { sessionStorage.removeItem("jktl_session"); } catch {}
    try { localStorage.removeItem("jktl_session"); } catch {}
    // Sign out and redirect to sign-in
    signOut({ callbackUrl: "/sign-in" });
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060E2A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,0.2)", borderTop: "2px solid #C9A84C", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "0.88rem" }}>Signing you out...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
