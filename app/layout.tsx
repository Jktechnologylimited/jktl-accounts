import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JKTL Accounts — Sign in to your products",
  description: "One JKTL account. Access FaithDesk, DetailDesk, SchoolDesk, and the affiliate program.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
