export type {
  DraftState,
  DraftTransfer,
  PlayerData,
} from "@/app/store/utils";
export type { FPLGameweekPicksData, FPLPlayerData } from "@/app/api";

export interface ValidationResult {
  valid: boolean;
  reason: string;
}
