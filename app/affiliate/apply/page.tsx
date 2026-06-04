"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AffiliatApplyPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [howPromote, setHowPromote] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function apply() {
    if (!howPromote.trim()) { setErr("Please describe how you will promote JKTL"); return; }
    setLoading(true); setErr("");
    const res = await fetch("/api/affiliate/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, howPromote }),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error || "Error"); setLoading(false); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background:"#080F25" }}>
      <div className="w-full max-w-[480px]">
        <Link href="/dashboard" className="text-xs no-underline block mb-6" style={{ color:"rgba(226,232,240,0.4)" }}>
          Back to dashboard
        </Link>
        <h1 className="font-bold text-2xl text-white mb-1">Join the Affiliate Program</h1>
        <p className="text-sm mb-6" style={{ color:"rgba(226,232,240,0.45)" }}>
          Tell us a bit about yourself and how you plan to promote JKTL. We review all applications within 24-48 hours.
        </p>

        <div className="flex gap-4 mb-8 flex-wrap">
          {[{ v:"N10,000", l:"Welcome bonus" },{ v:"5%", l:"Setup fee" },{ v:"2%x3", l:"Monthly" }].map(s => (
            <div key={s.l} className="flex-1 min-w-[100px] p-3 rounded-lg text-center" style={{ background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.15)" }}>
              <p className="font-bold text-lg" style={{ color:"#34D399" }}>{s.v}</p>
              <p className="text-xs" style={{ color:"rgba(226,232,240,0.4)" }}>{s.l}</p>
            </div>
          ))}
        </div>

        <div className="glass p-7 rounded-xl flex flex-col gap-4">
          <div>
            <label className="field-label">Business / Brand Name (optional)</label>
            <input className="field" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your business name if applicable" />
          </div>
          <div>
            <label className="field-label">How will you promote JKTL? *</label>
            <textarea className="field" rows={4} value={howPromote} onChange={e => setHowPromote(e.target.value)}
              placeholder="e.g. I manage a WhatsApp group of 500+ business owners. I run a LinkedIn page about digital tools for Nigerian businesses. I work as a business consultant..." style={{ resize:"none" }} />
          </div>
          {err && <p className="text-sm" style={{ color:"#F87171" }}>{err}</p>}
          <button onClick={apply} disabled={loading} className="btn-gold w-full py-3 disabled:opacity-60">
            {loading ? "Submitting..." : "Submit Application"}
          </button>
          <p className="text-xs text-center" style={{ color:"rgba(226,232,240,0.3)" }}>
            You will receive an email when your application is reviewed.
          </p>
        </div>
      </div>
    </div>
  );
}
