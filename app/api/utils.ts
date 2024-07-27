export default async function fetchGameweekData(
  gameweek: number,
  token: string
) {
  return await fetch(`/api/gameweek?gameweek=${gameweek}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-cache",
  });
}
