import PlayerComparison from "@/components/charts/player";
import Drafts from "@/components/drafts/overview";
import Fixtures from "@/components/fixtures/overview";
import Team from "@/components/pitch/team";
import Selector from "@/components/transfers/server";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen max-h-screen">
      <div className="grid grid-cols-4 px-5 gap-5">
        <div className="flex flex-col col-span-1 max-h-screen gap-1">
          <div className="h-3/4 relative overflow-scroll">
            <Selector />
          </div>
          <PlayerComparison />
        </div>
        <div className="col-span-1 h-full">
          <div className="flex flex-col h-full gap-2">
            <Drafts />
            <Fixtures />
          </div>
        </div>
        <div className="col-span-2">
          <Team />
        </div>
      </div>
    </div>
  );
}
