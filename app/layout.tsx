import Footer from "@/components/ui/footer";
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import Script from "next/script";
import "./globals.css";
import ReactQueryProvider from "./provider";

export const metadata: Metadata = {
  title: "FPL Planner",
  description: "Plan your FPL transfers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <html lang="en" className="dark">
        <body className={GeistSans.className}>
          <SessionProvider>
            <main>{children}</main>
            <Footer />
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
    </ReactQueryProvider>
  );
}
