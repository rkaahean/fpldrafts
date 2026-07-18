import Selector from "@/components/transfers/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Players",
  description: "Browse and transfer players.",
};

export default function PlayersPage() {
  return <Selector />;
}
