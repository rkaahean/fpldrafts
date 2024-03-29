import Drafts from "@/components/drafts/Drafts";
import Team from "@/components/pitch/Team";
import Selector from "@/components/player-selector/selector";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="text-white p-2 flex flex-row justify-end">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
      <div className="grid grid-cols-4 min-h-full px-5 gap-5">
        <div className="col-span-1 h-full">
          <Selector />
        </div>
        <div className="col-span-1 h-full">
          <div className="flex flex-col h-full gap-2">
            <div className="min-h-64">
              <Drafts />
            </div>
            <div className="text-md font-semibold">Fixtures</div>
          </div>
        </div>
        <div className="col-span-2">
          <Team />
        </div>
      </div>
    </div>
  );
}
