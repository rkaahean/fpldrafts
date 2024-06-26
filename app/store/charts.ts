import { create } from "zustand";

interface State {
  player1: number;
  player2: number;
  setPlayer1: (player: number) => void;
  setPlayer2: (player: number) => void;
}
export const chartsStore = create<State>()((set, get) => ({
  player1: 0,
  player2: 1,
  setPlayer1: (player) => set({ player1: player }),
  setPlayer2: (player) => set({ player2: player }),
}));
