import Drafts from "@/components/drafts/Drafts";
import Pitch from "@/components/ui/Pitch";

export default function Home() {
  return (
    <div className="grid grid-cols-4 min-h-screen">
      <div className="col-span-1">Test 1</div>
      <div className="col-span-1 h-full">
        <div className="flex flex-col h-full">
          <div className="h-1/3">
            <Drafts />
          </div>
          <div className="h-1/3">Players</div>
          <div className="h-1/3">Price Changes</div>
        </div>
      </div>
      <div className="col-span-2">
        <Pitch />
      </div>
    </div>
  );
}
