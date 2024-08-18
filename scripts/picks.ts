import prisma from "./lib/db";
import { updateFPLTeamData } from "./utils";

try {
  prisma.fPLTeam
    .findMany({
      where: {
        fpl_season_id: process.env.FPL_SEASON_ID!,
      },
    })
    .then((teams) => {
      teams.map((team) => {
        try {
          console.log("Updating team...", team.id);

          updateFPLTeamData(team.id, team.team_id).then(() =>
            console.log("Completed upload...")
          );
        } catch (e) {
          console.log("Ran into an error updating team. Skipping...", e);
        }
      });
    });

  prisma.$disconnect();
} catch (e) {
  console.error(e);
  prisma.$disconnect();
}
