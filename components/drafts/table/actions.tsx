"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { toast } from "../../ui/use-toast";

export function DraftActions({ draftId, draftName }: { draftId: string; draftName: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.accessToken}`,
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        title={`Duplicate ${draftName}`}
        disabled={duplicating}
        onClick={async (event) => {
          event.stopPropagation();
          setDuplicating(true);
          const response = await fetch("/api/drafts/duplicate", {
            method: "POST",
            headers,
            body: JSON.stringify({ draftId }),
          });
          setDuplicating(false);

          if (!response.ok) {
            toast({ title: "Could not duplicate draft.", variant: "destructive" });
            return;
          }

          await queryClient.invalidateQueries({ queryKey: ["draftsget"] });
          toast({ title: "Draft duplicated.", description: `${draftName} copy is ready to edit.`, variant: "success" });
        }}
      >
        {duplicating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 hover:bg-destructive"
        title={`Delete ${draftName}`}
        disabled={deleting}
        onClick={async (event) => {
          event.stopPropagation();
          if (!window.confirm(`Delete “${draftName}”? This cannot be undone.`)) {
            return;
          }

          setDeleting(true);
          const response = await fetch("/api/drafts/delete", {
            method: "POST",
            headers,
            body: JSON.stringify({ draftId }),
          });
          setDeleting(false);

          if (!response.ok) {
            toast({ title: "Could not delete draft.", variant: "destructive" });
            return;
          }

          await queryClient.invalidateQueries({ queryKey: ["draftsget"] });
          toast({ title: "Draft deleted.", variant: "success" });
        }}
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
