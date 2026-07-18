"use client";

import { picksStore } from "@/app/store";
import { ReactNode, useEffect } from "react";

export default function GameweekSeed({
  gameweek,
  children,
}: {
  gameweek: number;
  children: ReactNode;
}) {
  const setCurrentGameweek = picksStore((state) => state.setCurrentGameweek);

  useEffect(() => {
    setCurrentGameweek(gameweek);
  }, [gameweek, setCurrentGameweek]);

  return <>{children}</>;
}
