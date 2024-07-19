import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "./provider";
const inter = Inter({ subsets: ["latin"] });

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
        <body className={inter.className}>
          <SessionProvider>
            <main>{children}</main>
          </SessionProvider>
          <Toaster />
        </body>
      </html>
    </ReactQueryProvider>
  );
}
