"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface Props { user: { id:string; name:string; email:string; avatar:string|null; }; }

export default function ProfileClient({ user }: Props) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/user/profile", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name }) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background:"#080F25" }}>
      <div className="max-w-[500px] mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-xs no-underline" style={{ color:"rgba(226,232,240,0.4)" }}>Dashboard</Link>
          <span style={{ color:"rgba(226,232,240,0.2)" }}>/</span>
          <p className="text-xs" style={{ color:"rgba(226,232,240,0.6)" }}>Profile</p>
        </div>

        <h1 className="font-bold text-2xl text-white mb-8">Your Profile</h1>

        <div className="glass p-7 rounded-xl">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
              : <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl" style={{ background:"rgba(201,168,76,0.15)", color:"#C9A84C" }}>
                  {user.name.slice(0,1).toUpperCase()}
                </div>
            }
            <div>
              <p className="font-bold text-white">{user.name}</p>
              <p className="text-sm" style={{ color:"rgba(226,232,240,0.45)" }}>{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="field-label">Display Name</label>
              <input className="field" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="field-label">Email Address</label>
              <input className="field" value={user.email} disabled style={{ opacity:0.5, cursor:"not-allowed" }} />
              <p className="text-xs mt-1" style={{ color:"rgba(226,232,240,0.3)" }}>Contact support to change your email.</p>
            </div>
            {saved && <p className="text-sm" style={{ color:"#34D399" }}>Profile saved.</p>}
            <button onClick={save} disabled={saving} className="btn-gold py-3 disabled:opacity-60">{saving ? "Saving..." : "Save Changes"}</button>
          </div>

          <div className="mt-6 pt-6 border-t" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
            <button onClick={() => signOut({ callbackUrl:"/login" })} className="w-full py-3 rounded-lg text-sm font-semibold transition-colors" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#F87171" }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
