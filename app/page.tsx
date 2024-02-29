import Pitch from "@/components/ui/Pitch";

export default function Home() {
  return (
    <div className="grid grid-cols-4">
      <div className="col-span-1">Test 1</div>
      <div className="col-span-1">Test 2</div>
      <div className="col-span-2">
        <Pitch />
      </div>
    </div>
  );
}
