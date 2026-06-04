import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return (
    <ProfileClient user={{ id: session.user.id, name: session.user.name || "", email: session.user.email || "", avatar: session.user.image || null }} />
  );
}
