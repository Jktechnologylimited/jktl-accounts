"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading"|"success"|"error"|"idle">("loading");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    // Read token directly from window.location — no useSearchParams needed
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setStatus("idle");
      return;
    }

    fetch(`/api/verify?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setVerifiedEmail(data.email || "");
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  async function handleResend() {
    if (!resendEmail) return;
    setResending(true); setResendMsg("");
    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      setResendMsg(data.ok ? "Sent! Check your inbox." : data.error || "Failed to send");
    } catch {
      setResendMsg("Network error. Try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#060E2A", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <a href="https://jktl.com.ng">
            <Image src="/logo.png" alt="JK Technology Limited" width={60} height={60} style={{ objectFit: "contain", margin: "0 auto 12px", display: "block" }} />
          </a>
        </div>

        {/* LOADING */}
        {status === "loading" && (
          <div className="card" style={{ padding: "48px 32px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, border: "3px solid rgba(201,168,76,0.2)", borderTop: "3px solid #C9A84C", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
            <p style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: 6 }}>Verifying your email...</p>
            <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "0.85rem" }}>Just a moment.</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <div className="card" style={{ padding: "40px 32px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: 8 }}>Email verified!</h1>
            <p style={{ fontSize: "0.88rem", color: "rgba(226,232,240,0.5)", lineHeight: 1.6, marginBottom: 28 }}>
              Your account is active.{verifiedEmail && <> Signed up as <strong style={{ color: "rgba(226,232,240,0.8)" }}>{verifiedEmail}</strong>.</>}
            </p>
            <Link href="/sign-in" className="btn-gold">Sign In Now</Link>
          </div>
        )}

        {/* ERROR */}
        {status === "error" && (
          <div className="card" style={{ padding: "40px 32px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: 8 }}>Link expired or already used</h1>
            <p style={{ fontSize: "0.88rem", color: "rgba(226,232,240,0.5)", lineHeight: 1.6, marginBottom: 24 }}>
              Links expire after 24 hours and can only be used once. Get a new one below.
            </p>
            <div style={{ textAlign: "left", marginBottom: 12 }}>
              <label className="label">Your Email Address</label>
              <input className="input" type="email" value={resendEmail}
                onChange={e => setResendEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleResend()}
                placeholder="your@email.com" />
            </div>
            {resendMsg && (
              <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: "0.82rem",
                background: resendMsg.includes("Sent") ? "rgba(5,150,105,0.1)" : "rgba(239,68,68,0.1)",
                border: resendMsg.includes("Sent") ? "1px solid rgba(5,150,105,0.2)" : "1px solid rgba(239,68,68,0.2)",
                color: resendMsg.includes("Sent") ? "#34D399" : "#F87171" }}>
                {resendMsg}
              </div>
            )}
            <button onClick={handleResend} disabled={resending || !resendEmail} className="btn-gold disabled:opacity-60">
              {resending ? "Sending..." : "Send New Link"}
            </button>
            <p style={{ marginTop: 20, fontSize: "0.78rem" }}>
              <Link href="/sign-in" style={{ color: "#C9A84C", textDecoration: "none" }}>Back to sign in</Link>
            </p>
          </div>
        )}

        {/* IDLE -- just arrived, no token */}
        {status === "idle" && (
          <div className="card" style={{ padding: "40px 32px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(201,168,76,0.12)", border: "2px solid rgba(201,168,76,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: 8 }}>Check your email</h1>
            <p style={{ fontSize: "0.88rem", color: "rgba(226,232,240,0.5)", lineHeight: 1.6, marginBottom: 8 }}>
              We sent a verification link to your email. Click it to activate your account.
            </p>
            <p style={{ fontSize: "0.78rem", color: "rgba(226,232,240,0.3)", marginBottom: 24 }}>
              Link expires in 24 hours. Check spam if you do not see it.
            </p>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24 }}>
              <p style={{ fontSize: "0.78rem", color: "rgba(226,232,240,0.35)", marginBottom: 14 }}>Did not receive it?</p>
              <div style={{ textAlign: "left", marginBottom: 12 }}>
                <label className="label">Your Email Address</label>
                <input className="input" type="email" value={resendEmail}
                  onChange={e => setResendEmail(e.target.value)}
                  placeholder="your@email.com" />
              </div>
              {resendMsg && (
                <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: "0.82rem",
                  background: resendMsg.includes("Sent") ? "rgba(5,150,105,0.1)" : "rgba(239,68,68,0.1)",
                  border: resendMsg.includes("Sent") ? "1px solid rgba(5,150,105,0.2)" : "1px solid rgba(239,68,68,0.2)",
                  color: resendMsg.includes("Sent") ? "#34D399" : "#F87171" }}>
                  {resendMsg}
                </div>
              )}
              <button onClick={handleResend} disabled={resending || !resendEmail} className="btn-ghost disabled:opacity-60">
                {resending ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "0.68rem", marginTop: 24, color: "rgba(226,232,240,0.2)" }}>
          accounts.jktl.com.ng -- JK Technology Limited (CAC RC-8754824)
        </p>
      </div>
    </div>
  );
}
