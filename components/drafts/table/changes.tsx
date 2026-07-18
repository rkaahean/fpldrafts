import { picksStore } from "@/app/store";
import { DraftTransfer } from "@/app/store/utils";
import { Minus, Plus, Repeat } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardHeader, CardTitle } from "../../ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";

export default function DraftChanges() {
  const drafts = picksStore((store) => store.drafts);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="h-6 px-2 py-1 text-xs rounded-sm 2xl:h-10 2xl:px-4 2xl:py-2"
        >
          <Repeat className="w-4 h-4 2xl:w-6 2xl:h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-scroll">
        <SheetHeader>
          <SheetTitle>{drafts.name ? drafts.name : "Changes"}</SheetTitle>
          <SheetDescription>
            {drafts.description
              ? drafts.description
              : "Transfers made so far..."}
          </SheetDescription>
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
        <CardTitle>{`Gameweek ${props.data.gameweek}`}</CardTitle>
      </CardHeader>
      <div className="flex flex-row gap-3 px-6 items-center">
        <Plus className="w-4 h-4 rounded-full border border-foreground p-0.5" />
        <div className="text-sm">{props.data.in.data.web_name}</div>
      </div>
      <div className="flex flex-row gap-3 px-6 items-center">
        <Minus className="w-4 h-4 rounded-full border border-muted-foreground p-0.5 text-muted-foreground" />
        <div className="text-sm">{props.data.out.data.web_name}</div>
      </div>
      <div className="italic text-xs px-6 py-3">
        {`£${
          (props.data.out.price - props.data.in.price) / 10
        } made from Transfer`}
      </div>
    </Card>
  );
}
