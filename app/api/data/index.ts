export async function getPlayerData(ids: number[]) {
  const res = await fetch(
    `https://fantasy.premierleague.com/api/bootstrap-static/`
  );
  return res.json().then((data) =>
    data["elements"]
      .filter((player: any) => ids.includes(player.id))
      .map((player: any) => {
        // console.log(player);
        return {
          id: player.id,
          web_name: player.web_name,
          team: player.team,
          element_type: player.element_type,
          team_code: player.team_code,
        };
      })
  );
}

export async function getGameweekData(gameWeek: number) {
  const res = await fetch(
    `https://fantasy.premierleague.com/api/entry/44421/event/${gameWeek}/picks/`
  );
  return res.json();
}
