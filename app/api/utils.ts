export async function fetchGameweekData(gameweek: number, token: string) {
  return await fetch(`/api/gameweek?gameweek=${gameweek}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-cache",
  });
}

export async function fetchPlayerData(player_id: number) {
  return await fetch(`/api/player?id=${player_id}`, {
    method: "GET",
  });
}
