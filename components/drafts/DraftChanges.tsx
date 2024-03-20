import { LoopIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

export default function DraftChanges() {
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
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
