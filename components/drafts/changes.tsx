import { picksStore } from "@/app/store";
import { LoopIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

export default function DraftChanges() {
  const drafts = picksStore((store) => store.drafts);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="xs">
          <LoopIcon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Draft Changes</SheetTitle>
          <SheetDescription>Scenario 1 - GW 27 Draft changes</SheetDescription>
          {drafts.changes.map((tranfer) => {
            return <div key={tranfer.in}>{tranfer.in}</div>;
          })}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

function DraftCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
}
