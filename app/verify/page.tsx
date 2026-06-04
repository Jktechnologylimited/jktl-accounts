"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"checking"|"success"|"error">("checking");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    fetch(`/api/auth/verify?token=${token}`)
      .then(r => r.json())
      .then(d => setStatus(d.ok ? "success" : "error"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background:"linear-gradient(135deg,#060E2A,#0B1640)" }}>
      <div className="w-full max-w-md text-center">
        {status === "checking" && (
          <>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background:"rgba(201,168,76,0.15)", border:"1px solid rgba(201,168,76,0.25)" }}>
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor:"#C9A84C", borderTopColor:"transparent" }} />
            </div>
            <p className="font-bold text-white text-xl mb-2">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background:"rgba(52,211,153,0.15)", border:"2px solid rgba(52,211,153,0.3)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="font-bold text-white text-xl mb-2">Email verified!</p>
            <p className="text-sm mb-6" style={{ color:"rgba(226,232,240,0.5)" }}>Your account is ready. Sign in to access your products.</p>
            <Link href="/login" className="btn-gold px-8 py-3">Go to Sign In</Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background:"rgba(239,68,68,0.12)", border:"2px solid rgba(239,68,68,0.25)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <p className="font-bold text-white text-xl mb-2">Link invalid or expired</p>
            <p className="text-sm mb-6" style={{ color:"rgba(226,232,240,0.5)" }}>This verification link has expired. Sign in and we will send a new one.</p>
            <Link href="/login" className="btn-gold px-8 py-3">Back to Sign In</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return <Suspense><VerifyForm /></Suspense>;
}
