"use client";

import { picksStore } from "@/app/store";
import { ReactNode, useRef } from "react";

export default function GameweekSeed({
  gameweek,
  children,
}: {
  gameweek: number;
  children: ReactNode;
}) {
  const currentGameweek = picksStore((state) => state.currentGameweek);
  const setCurrentGameweek = picksStore((state) => state.setCurrentGameweek);

  const seededGameweekRef = useRef<number | null>(null);
  if (seededGameweekRef.current !== gameweek) {
    seededGameweekRef.current = gameweek;
    if (currentGameweek !== gameweek) {
      setCurrentGameweek(gameweek);
    }
  }

  return <>{children}</>;
}
