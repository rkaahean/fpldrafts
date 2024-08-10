import { auth } from "@/auth/main";
import Drafts from "@/components/drafts/table/overview";
import Fixtures from "@/components/fixtures/server";
import DeviceWrapper from "@/components/home/main";
import Navbar from "@/components/navbar/main";
import Team from "@/components/pitch/team";
import Selector from "@/components/transfers/server";

import { jwtDecode } from "jwt-decode";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLatestGameweek, getUserTeamFromEmail } from "./api";

export const metadata: Metadata = {
  title: "Home",
  description: "An overview of your FPL team.",
};

export default async function Home() {
  const session = await auth();

  // if there's no session, or there's no access token
  if (!session || (session && !session.accessToken)) {
    redirect("/landing");
  } else if (!session.hasTeam) {
    redirect("/link");
  }

  // current gameweek
  const decoded = jwtDecode<{ email: string }>(session.accessToken);
  const { teamId } = await getUserTeamFromEmail(
    decoded.email,
    process.env.FPL_SEASON_ID!
  );
  const maxGameweek = await getLatestGameweek(teamId);

  const mobileContent = (
    <div className="flex flex-col bg-grainy px-4 gap-4">
      <div>
        <Navbar image={session.user!.image!} />
      </div>

      <div className="flex flex-col gap-8">
        <Team gameweek={maxGameweek._max ? 1 : maxGameweek._max + 1} />
        <Selector />
        <Drafts />
        <Fixtures />
      </div>
    </div>
  );

  const desktopContent = (
    <div className="flex flex-col">
      <div className="flex flex-row h-screen bg-grainy w-screen">
        <Navbar image={session.user!.image!} />
        <div className="flex flex-row w-full h-full">
          <div className="w-[27wh] min-h-full gap-1 py-2 pl-1 pr-2">
            <Selector />
            {/* <div className="h-fit lg:h-full relative lg:overflow-scroll">
              <Selector />
            </div> */}
            {/* <PlayerComparison /> */}
          </div>
          <div className="w-[23wh] h-full py-2">
            <div className="flex flex-col h-full 2xl:h-[95vh] gap-2">
              <div className="h-1/3">
                <Drafts />
              </div>
              <div className="h-2/3">
                <Fixtures />
              </div>
            </div>
          </div>
          <div className="w-1/2 py-2 px-2 pr-2 min-h-full">
            <Team gameweek={maxGameweek._max ? 1 : maxGameweek._max + 1} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DeviceWrapper
      mobileContent={mobileContent}
      desktopContent={desktopContent}
    />
  );
}
