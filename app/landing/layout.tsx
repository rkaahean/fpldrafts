import Header from "@/components/ui/header";
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import Script from "next/script";
import "../globals.css";

export const metadata: Metadata = {
  title: "FPL Drafts.",
  description: "Plan your FPL transfers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={GeistSans.className}>
        <SessionProvider>
          <Header />
          <main>{children}</main>
        </SessionProvider>
        <Toaster />
        <SpeedInsights />
      </body>
      <Script
        async
        src="https://umami-production-3192.up.railway.app/script.js"
        data-website-id="edb62029-4db9-4fb7-9aaa-425e3a21579f"
      />
    </html>
  );
}
