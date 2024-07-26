import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
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
          </SessionProvider>
          <Toaster />
          <SpeedInsights />
        </body>
      </html>
    </ReactQueryProvider>
  );
}
