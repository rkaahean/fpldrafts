import type {
  DraftTransfer,
  FPLGameweekPicksData,
  ValidationResult,
} from "./types";

export const BUDGET = 1000;
export const MAX_PER_CLUB = 3;
export const SQUAD_COMPOSITION: { [element_type: number]: number } = {
  1: 2,
  2: 5,
  3: 5,
  4: 3,
};
const SQUAD_SIZE = 15;

export function getNumPlayersByType(
  element_type: number,
  picks: FPLGameweekPicksData
): number {
  return picks.data.filter(
    (player) =>
      player.fpl_player.element_type == element_type && player.position <= 11
  ).length;
}

export function getSquadCountByType(
  element_type: number,
  picks: FPLGameweekPicksData
): number {
  return picks.data.filter(
    (player) => player.fpl_player.element_type == element_type
  ).length;
}

export function bankAfterTransfer(
  currentBank: number,
  transfer: DraftTransfer
): number {
  return currentBank + transfer.out.price - transfer.in.price;
}

export function checkBudget(bankAfter: number): ValidationResult {
  if (bankAfter >= 0) {
    return { valid: true, reason: "OK" };
  }
  return {
    valid: false,
    reason: `Over budget by ${Math.abs(bankAfter)}.`,
  };
}

export function validateSquadComposition(
  picks: FPLGameweekPicksData
): ValidationResult {
  if (picks.data.length !== SQUAD_SIZE) {
    return {
      valid: false,
      reason: `Squad must have ${SQUAD_SIZE} players, found ${picks.data.length}.`,
    };
  }

  for (const element_type of Object.keys(SQUAD_COMPOSITION).map(Number)) {
    const expected = SQUAD_COMPOSITION[element_type];
    const actual = getSquadCountByType(element_type, picks);
    if (actual !== expected) {
      return {
        valid: false,
        reason: `Squad must have ${expected} of position ${element_type}, found ${actual}.`,
      };
    }
  }

  return { valid: true, reason: "OK" };
}

export function validateMaxPerClub(
  picks: FPLGameweekPicksData
): ValidationResult {
  const countByClub = new Map<number, number>();
  for (const player of picks.data) {
    const teamCode = player.fpl_player.team_code;
    countByClub.set(teamCode, (countByClub.get(teamCode) ?? 0) + 1);
  }

  for (const [teamCode, count] of countByClub) {
    if (count > MAX_PER_CLUB) {
      return {
        valid: false,
        reason: `Too many players from club ${teamCode}: ${count} (max ${MAX_PER_CLUB}).`,
      };
    }
  }

  return { valid: true, reason: "OK" };
}
