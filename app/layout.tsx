import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mythical Insider API",
  description: "API for Mythical Insider DM Fyzz to retreive access",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[rgb(15,15,15)] min-h-screen">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
