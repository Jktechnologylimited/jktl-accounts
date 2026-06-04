"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21">
      <rect x="1"  y="1"  width="9" height="9" fill="#f25022"/>
      <rect x="11" y="1"  width="9" height="9" fill="#7fba00"/>
      <rect x="1"  y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const urlError = params.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [err, setErr] = useState(urlError ? "Invalid credentials. Please try again." : "");

  async function handleEmail() {
    if (!email || !password) { setErr("Email and password required"); return; }
    setLoading("email"); setErr("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) { setErr("Invalid email or password."); setLoading(null); return; }
    router.push(callbackUrl);
  }

  async function handleProvider(provider: "google" | "microsoft-entra-id") {
    setLoading(provider);
    await signIn(provider, { callbackUrl });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background:"linear-gradient(135deg,#060E2A,#0B1640)" }}>
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="https://jktl.com.ng" className="inline-flex items-center gap-2.5 no-underline mb-5 justify-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background:"rgba(201,168,76,0.15)", border:"1px solid rgba(201,168,76,0.25)" }}>
              <span className="font-mono font-bold text-sm" style={{ color:"#C9A84C" }}>JK</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-white text-[0.9rem] leading-none">JK Technology</p>
              <p className="font-mono text-[0.5rem] tracking-widest" style={{ color:"rgba(201,168,76,0.6)" }}>ACCOUNTS</p>
            </div>
          </Link>
          <h1 className="font-bold text-2xl text-white mb-1">Welcome back</h1>
          <p className="text-sm" style={{ color:"rgba(226,232,240,0.45)" }}>
            Sign in to access your products and affiliate dashboard
          </p>
        </div>

        <div className="glass p-7">
          <div className="flex flex-col gap-3 mb-5">
            <button onClick={() => handleProvider("google")} disabled={!!loading} className="provider-btn">
              {loading === "google" ? <span className="text-sm">Connecting...</span> : <><GoogleIcon />Continue with Google</>}
            </button>
            <button onClick={() => handleProvider("microsoft-entra-id")} disabled={!!loading} className="provider-btn">
              {loading === "microsoft-entra-id" ? <span className="text-sm">Connecting...</span> : <><MicrosoftIcon />Continue with Microsoft</>}
            </button>
          </div>

          <div className="divider mb-5">or use email</div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="field-label">Email address</label>
              <input className="field" type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleEmail()} placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="field-label" style={{ marginBottom:0 }}>Password</label>
                <Link href="/forgot-password" className="text-[0.65rem] no-underline" style={{ color:"#C9A84C" }}>Forgot?</Link>
              </div>
              <input className="field" type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleEmail()} placeholder="Your password" />
            </div>
            {err && (
              <div className="px-3.5 py-2.5 rounded-lg text-[0.8rem]" style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"#F87171" }}>{err}</div>
            )}
            <button onClick={handleEmail} disabled={!!loading} className="btn-gold w-full py-3 disabled:opacity-60">
              {loading === "email" ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <p className="text-center text-sm mt-5" style={{ color:"rgba(226,232,240,0.4)" }}>
            No account?{" "}
            <Link href="/signup" className="font-semibold no-underline" style={{ color:"#C9A84C" }}>Create one free</Link>
          </p>
        </div>

        <p className="text-center text-xs mt-5" style={{ color:"rgba(226,232,240,0.2)" }}>
          accounts.jktl.com.ng -- Secure login for all JKTL products
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
