import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen px-4 py-10" style={{ background:"#080F25" }}>
      <div className="max-w-[800px] mx-auto">
        <Link href="/dashboard" className="text-xs no-underline block mb-6" style={{ color:"rgba(226,232,240,0.4)" }}>
          Back to dashboard
        </Link>
        <h1 className="font-bold text-2xl text-white mb-2">My Referrals</h1>
        <div className="glass p-10 rounded-xl text-center mt-8">
          <p className="font-bold text-white mb-2">Coming soon</p>
          <p className="text-sm" style={{ color:"rgba(226,232,240,0.4)" }}>This section will be available soon.</p>
        </div>
      </div>
    </div>
  );
}
