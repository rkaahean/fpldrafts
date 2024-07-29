export async function fetchGameweekData(gameweek: number, token: string) {
  return await fetch(`/api/edge/gameweek?gameweek=${gameweek}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}
