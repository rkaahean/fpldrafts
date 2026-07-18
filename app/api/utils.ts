export async function fetchGameweekData(
  gameweek: number,
  token: string,
  signal?: AbortSignal
) {
  return await fetch(`/api/gameweek?gameweek=${gameweek}`, {
    method: "GET",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}
