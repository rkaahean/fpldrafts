import { getNumPlayersByType } from "./squad";
import type { FPLGameweekPicksData, PlayerData, ValidationResult } from "./types";

export function validateSubstitution(
  subIn: PlayerData,
  subOut: PlayerData,
  picks: FPLGameweekPicksData
): ValidationResult {
  const subInType = subIn.element_type;
  const subOutType = subOut.element_type;

  if (subInType == subOutType) {
    return { valid: true, reason: "OK" };
  }

  if (subInType == 1 || subOutType == 1) {
    return {
      valid: false,
      reason: "A goalkeeper can be substituted only for another goalkeeper.",
    };
  }

  const numDef = getNumPlayersByType(2, picks);
  const numMid = getNumPlayersByType(3, picks);
  const numFwd = getNumPlayersByType(4, picks);

  if (subOutType == 2 && numDef == 3) {
    return {
      valid: false,
      reason: "Need a minimum of 3 defenders in playing team.",
    };
  }

  if (subOutType == 3 && numMid == 2) {
    return {
      valid: false,
      reason: "Need a minimum of 2 midfielders in playing team.",
    };
  }

  if (subOutType == 4 && numFwd == 1) {
    return {
      valid: false,
      reason: "Need a minimum of 1 forward in playing team.",
    };
  }

  return { valid: true, reason: "OK" };
}
