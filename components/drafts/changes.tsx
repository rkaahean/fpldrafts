import { picksStore } from "@/app/store";
import { DraftTransfer } from "@/app/store/utils";
import { LoopIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
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
          {drafts.changes.map((transfer) => {
            return (
              <DraftCard key={transfer.in.data.player_id} data={transfer} />
            );
          })}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

function DraftCard(props: { data: DraftTransfer }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{`Gameweek ${props.data.gameweek} Transfer`}</CardTitle>
      </CardHeader>
      <CardContent>{props.data.in.data.web_name}</CardContent>
      <CardContent>{props.data.out.data.web_name}</CardContent>
      <CardFooter>
        {`${props.data.out.price - props.data.in.price} made from Transfer`}
      </CardFooter>
    </Card>
  );
}
