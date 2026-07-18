export function teamSessionFields(teamId: string | undefined) {
  return teamId
    ? { hasTeam: true, team_id: teamId }
    : { hasTeam: false as const };
}

export function verifiedTeamId(
  requestedTeamId: string,
  verifiedTeam: { id: string } | null
): string | undefined {
  return verifiedTeam?.id === requestedTeamId ? verifiedTeam.id : undefined;
}
