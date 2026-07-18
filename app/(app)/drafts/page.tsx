import Drafts from "@/components/drafts/table/overview";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drafts",
  description: "Your saved transfer drafts.",
};

export default function DraftsPage() {
  return <Drafts />;
}
