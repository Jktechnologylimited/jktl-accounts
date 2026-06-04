import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OnboardingPage({ params }: { params: Promise<{ product: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  const { product } = await params;
  const productName = product.charAt(0).toUpperCase() + product.slice(1);
  const onboardingUrl = `https://jktl.com.ng/get-started/${product}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background:"#080F25" }}>
      <div className="w-full max-w-md text-center">
        <div className="glass p-10 rounded-xl">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background:"rgba(201,168,76,0.15)", border:"2px solid rgba(201,168,76,0.25)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <p className="font-bold text-white text-xl mb-2">You are signed in</p>
          <p className="text-sm mb-6" style={{ color:"rgba(226,232,240,0.5)" }}>
            Continue setting up your {productName}. Your account is linked automatically.
          </p>
          <a href={onboardingUrl} className="btn-gold w-full py-3 flex items-center justify-center gap-2">
            Continue {productName} Setup
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <Link href="/dashboard" className="btn-ghost w-full py-3 mt-3 flex items-center justify-center">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
