"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

function SignUpContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnUrl = params.get("return") || "/dashboard";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthColors = ["transparent", "#EF4444", "#F59E0B", "#10B981"];
  const strengthLabels = ["", "Too short", "Good", "Strong"];

  async function handleSignUp() {
    if (!name || !email || !password || !confirm) { setError("All fields required"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return; }
      setLoading(false);
      // Redirect to verify page -- they need to confirm email first
      router.push("/verify");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: "#060E2A" }}>
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="https://jktl.com.ng">
            <Image src="/logo.png" alt="JK Technology Limited" width={60} height={60} className="object-contain mx-auto mb-4" />
          </a>
          <h1 className="font-bold text-[1.2rem] text-white mb-1">Create your JKTL account</h1>
          <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "0.85rem" }}>
            One account for all JK Technology products
          </p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Adeyemi"
                autoComplete="name" />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password" />
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, transition: "all 0.2s",
                      width: `${(strength / 3) * 100}%`, background: strengthColors[strength] }} />
                  </div>
                  <p style={{ fontSize: "0.68rem", marginTop: 4, color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input className="input" type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignUp()}
                placeholder="Repeat your password"
                autoComplete="new-password" />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "12px 16px" }}>
                <p style={{ color: "#F87171", fontSize: "0.82rem" }}>{error}</p>
              </div>
            )}

            <button onClick={handleSignUp} disabled={loading} className="btn-gold"
              style={{ marginTop: 4 }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: "0.75rem", marginTop: 16, color: "rgba(226,232,240,0.3)" }}>
            By signing up you agree to our{" "}
            <a href="https://jktl.com.ng/terms" style={{ color: "#C9A84C", textDecoration: "none" }}>Terms</a>
            {" "}and{" "}
            <a href="https://jktl.com.ng/privacy" style={{ color: "#C9A84C", textDecoration: "none" }}>Privacy Policy</a>.
          </p>

          <p style={{ textAlign: "center", fontSize: "0.8rem", marginTop: 20, color: "rgba(226,232,240,0.4)" }}>
            Already have an account?{" "}
            <Link href={`/sign-in?return=${encodeURIComponent(returnUrl)}`}
              style={{ color: "#C9A84C", fontWeight: 700, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.68rem", marginTop: 24, color: "rgba(226,232,240,0.2)" }}>
          accounts.jktl.com.ng -- JK Technology Limited (CAC RC-8754824)
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return <Suspense><SignUpContent /></Suspense>;
}
