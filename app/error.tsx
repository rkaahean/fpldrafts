"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col h-full w-full items-center justify-center gap-4 p-8 text-center">
      <div className="text-lg font-semibold">Something went wrong</div>
      <div className="text-sm text-muted-foreground">
        Try again, and if this keeps happening let us know.
      </div>
      <Button onClick={() => reset()} variant="secondary">
        Try again
      </Button>
    </div>
  );
}
