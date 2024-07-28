import { auth } from "@/auth/main";
import Drafts from "@/components/drafts/table/overview";
import Fixtures from "@/components/fixtures/table";
import Navbar from "@/components/navbar/main";
import Team from "@/components/pitch/team";
import Selector from "@/components/transfers/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/landing");
  } else if (!session.hasTeam) {
    redirect("/link");
  }
  return (
    <div className="flex flex-row min-h-screen max-h-screen">
      <Navbar image={session.user!.image!} />
      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col col-span-1 max-h-screen gap-1 pl-1 py-2">
          <div className="h-3/4 relative overflow-scroll">
            <Selector />
          </div>
          {/* <PlayerComparison /> */}
        </div>
        <div className="col-span-1 h-full py-2">
          <div className="flex flex-col h-full gap-2">
            <div className="h-1/3">
              <Drafts teamId={session.team_id} />
            </div>
            <div className="h-2/3">
              <Fixtures />
            </div>
          </div>
        </div>
        <div className="col-span-2 py-2 pr-2">
          <Team teamId={session.team_id} />
        </div>
      </div>
    </div>
  );
}
