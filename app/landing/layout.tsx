import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "FPL Drafts.",
  description: "Plan your FPL transfers.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main>
        <Header />

        {children}
        <Footer />
      </main>
    </>
  );
}
