"use client";

import { createContext, useContext } from "react";

const PlayerDrawerCloseContext = createContext<(() => void) | null>(null);

export const PlayerDrawerCloseProvider = PlayerDrawerCloseContext.Provider;

export function usePlayerDrawerClose() {
  return useContext(PlayerDrawerCloseContext);
}
