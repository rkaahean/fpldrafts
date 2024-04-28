import { getAllFixtures } from "@/app/api";

export default async function Fixtures() {
  const data = await getAllFixtures();

  const groupByHomeTeam = data.reduce<{
    [key: number]: { home: string; away: string }[];
  }>((acc, curr) => {
    const { event, team_h_id, team_a_id, ...rest } = curr;

    if (!acc[event]) {
      acc[event] = [];
    }
    acc[event].push({
      home: rest.fpl_team_h.short_name,
      away: rest.fpl_team_a.short_name,
    });
    return acc;
  }, {});
  console.log(groupByHomeTeam);
  return (
    <div>
      <div className="text-sm font-black">Fixtures</div>
      {data.map((fixuture) => {
        return <div key={fixuture.code}>{fixuture.code}</div>;
      })}
    </div>
  );
}
