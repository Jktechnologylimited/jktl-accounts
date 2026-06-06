import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/sign-in");

  // Gate unverified users
  const emailVerified = (session.user as { emailVerified?: boolean })?.emailVerified;
  if (emailVerified === false) redirect("/verify");

  return <DashboardShell session={session}>{children}</DashboardShell>;
}
