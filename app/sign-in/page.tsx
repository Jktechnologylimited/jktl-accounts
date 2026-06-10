"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

function SignInContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnUrl = params.get("return") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) { setError("Email and password required"); return; }
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Incorrect email or password"); return; }

    // Always use window.location.href -- router.push() cannot cross domains
    let decoded = decodeURIComponent(returnUrl);

    // Strip www. -- cookie is on .jktl.com.ng not www.jktl.com.ng
    decoded = decoded.replace("://www.jktl.com.ng", "://jktl.com.ng");

    // Local dev: different ports need mock bypass since cookie can't cross ports
    const isLocalDev = decoded.includes("localhost") && !decoded.includes("localhost:3001");

    if (isLocalDev) {
      const url = new URL(decoded);
      url.searchParams.set("mock", "bypass");
      window.location.href = url.toString();
    } else {
      // Production: cookie is shared across .jktl.com.ng -- just redirect
      window.location.href = decoded;
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
          <h1 className="font-bold text-[1.2rem] text-white mb-1">Sign in to JKTL</h1>
          <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "0.85rem" }}>
            Access your Desk products and account
          </p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignIn()}
                placeholder="your@email.com"
                autoComplete="email" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignIn()}
                placeholder="Your password"
                autoComplete="current-password" />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "12px 16px" }}>
                <p style={{ color: "#F87171", fontSize: "0.82rem" }}>{error}</p>
              </div>
            )}

            <button onClick={handleSignIn} disabled={loading} className="btn-gold"
              style={{ marginTop: 4 }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: "0.8rem", marginTop: 24, color: "rgba(226,232,240,0.4)" }}>
            No account?{" "}
            <Link href={`/sign-up?return=${encodeURIComponent(returnUrl)}`}
              style={{ color: "#C9A84C", fontWeight: 700, textDecoration: "none" }}>
              Create one free
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

export default function SignInPage() {
  return <Suspense><SignInContent /></Suspense>;
}
