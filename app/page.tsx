import Drafts from "@/components/drafts/overview";
import Fixtures from "@/components/fixtures/overview";
import Team from "@/components/pitch/team";
import Selector from "@/components/transfers/table";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="grid grid-cols-4 min-h-full px-5 gap-5">
        <div className="col-span-1 h-full">
          <Selector />
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
