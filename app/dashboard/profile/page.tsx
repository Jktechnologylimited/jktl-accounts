"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const mono = "'JetBrains Mono', monospace";
const T = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: "rgba(255,255,255,0.06)",
  border: "1.5px solid rgba(255,255,255,0.1)",
  borderRadius: 8, color: "#fff", fontSize: "0.9rem",
  fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.68rem", fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase",
  color: "rgba(226,232,240,0.4)", marginBottom: 6,
};
const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12, padding: "28px",
};

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [name, setName] = useState(user?.name || "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok"|"err"; text: string } | null>(null);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "JK";

  async function saveProfile() {
    if (!name.trim()) { setMsg({ type: "err", text: "Name cannot be empty" }); return; }
    setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: "err", text: data.error || "Failed to save" }); return; }
      await update({ name });
      setMsg({ type: "ok", text: "Profile updated successfully" });
    } catch { setMsg({ type: "err", text: "Network error" }); }
    finally { setSaving(false); }
  }

  async function savePassword() {
    if (!currentPw || !newPw || !confirmPw) { setMsg({ type: "err", text: "All password fields required" }); return; }
    if (newPw.length < 8) { setMsg({ type: "err", text: "Password must be at least 8 characters" }); return; }
    if (newPw !== confirmPw) { setMsg({ type: "err", text: "Passwords do not match" }); return; }
    setPwSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }) });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: "err", text: data.error || "Failed to update" }); return; }
      setMsg({ type: "ok", text: "Password updated. Signing you out..." });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(async () => { await signOut({ redirect: false }); router.push("/sign-in"); }, 2000);
    } catch { setMsg({ type: "err", text: "Network error" }); }
    finally { setPwSaving(false); }
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 32px", ...T }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: mono, fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(226,232,240,0.3)", marginBottom: 8 }}>Profile</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>Account Settings</h1>
      </div>

      {/* Identity card */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          {user?.image
            ? <img src={user.image} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
            : <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", color: "#C9A84C", flexShrink: 0 }}>{initials}</div>
          }
          <div>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>{user?.name || "Your Account"}</p>
            <p style={{ fontSize: "0.82rem", color: "rgba(226,232,240,0.4)" }}>{user?.email}</p>
          </div>
        </div>

        {msg && (
          <div style={{ padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "0.82rem",
            background: msg.type === "ok" ? "rgba(5,150,105,0.1)" : "rgba(239,68,68,0.1)",
            border: msg.type === "ok" ? "1px solid rgba(5,150,105,0.2)" : "1px solid rgba(239,68,68,0.2)",
            color: msg.type === "ok" ? "#34D399" : "#F87171" }}>
            {msg.text}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Display Name</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={{ ...inputStyle, opacity: 0.6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{user?.email}</span>
              <span style={{ fontFamily: mono, fontSize: "0.6rem", color: "rgba(226,232,240,0.3)" }}>Cannot change</span>
            </div>
          </div>
        </div>

        <button onClick={saveProfile} disabled={saving}
          style={{ width: "100%", padding: "12px", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase" as const, letterSpacing: "0.08em", background: saving ? "rgba(201,168,76,0.5)" : "#C9A84C", color: "#060E2A", border: "none", cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Password */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", marginBottom: 4 }}>Change Password</h2>
        <p style={{ fontSize: "0.78rem", color: "rgba(226,232,240,0.4)", marginBottom: 20 }}>Leave blank if you signed up with a social provider.</p>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
          {[
            { label: "Current Password", val: currentPw, set: setCurrentPw, ph: "Your current password" },
            { label: "New Password",     val: newPw,     set: setNewPw,     ph: "At least 8 characters" },
            { label: "Confirm Password", val: confirmPw, set: setConfirmPw, ph: "Repeat new password" },
          ].map(f => (
            <div key={f.label}>
              <label style={labelStyle}>{f.label}</label>
              <input type="password" style={inputStyle} value={f.val}
                onChange={e => f.set(e.target.value)} placeholder={f.ph} />
            </div>
          ))}
          <button onClick={savePassword} disabled={pwSaving}
            style={{ width: "100%", padding: "12px", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase" as const, letterSpacing: "0.08em", background: "rgba(255,255,255,0.06)", color: "rgba(226,232,240,0.7)", border: "1px solid rgba(255,255,255,0.12)", cursor: pwSaving ? "not-allowed" : "pointer" }}>
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      {/* Sign out */}
      <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" as const }}>
        <div>
          <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.88rem", marginBottom: 2 }}>Sign out</p>
          <p style={{ fontSize: "0.75rem", color: "rgba(226,232,240,0.4)" }}>You will need to sign back in.</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/sign-in" })}
          style={{ padding: "9px 20px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600, background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer" }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
