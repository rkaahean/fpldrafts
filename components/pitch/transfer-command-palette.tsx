"use client";

import { picksStore } from "@/app/store";
import { PlayerData } from "@/app/store/utils";
import { elementTypeToPosition } from "@/scripts/lib/utils";
import { Check, Command, CornerDownLeft, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

export default function TransferCommandPalette({
  players,
}: {
  players: PlayerData[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const markOut = picksStore((state) => state.markOut);
  const transferSlots = picksStore((state) => state.transferSlots);

  const squad = useMemo(
    () => players.filter((player) => player.position <= 11),
    [players]
  );
  const filteredPlayers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return squad;
    return squad.filter(
      (player) =>
        player.web_name.toLowerCase().includes(normalized) ||
        player.team_name.toLowerCase().includes(normalized) ||
        elementTypeToPosition(player.element_type).toLowerCase().includes(normalized)
    );
  }, [query, squad]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlighted(0);
      setSelectedIds([]);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setHighlighted((index) =>
      filteredPlayers.length ? Math.min(index, filteredPlayers.length - 1) : 0
    );
  }, [filteredPlayers.length]);

  const togglePlayer = (player: PlayerData) => {
    setSelectedIds((ids) =>
      ids.includes(player.player_id)
        ? ids.filter((id) => id !== player.player_id)
        : [...ids, player.player_id]
    );
  };

  const confirmSelection = () => {
    const selected = squad.filter((player) => selectedIds.includes(player.player_id));
    if (!selected.length) return;
    const alreadyMarked = new Set(transferSlots.map((slot) => slot.out.player_id));
    selected.forEach((player) => {
      if (!alreadyMarked.has(player.player_id)) markOut(player);
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-6 gap-1 rounded-sm px-1.5 text-xs 2xl:h-8 2xl:px-2"
          title="Transfer out (⌘K)"
          aria-label="Transfer out (Command K)"
        >
          <Command className="h-4 w-4 2xl:h-6 2xl:w-6" />
          <span className="hidden xl:inline">Transfer out</span>
          <kbd className="hidden rounded border border-border/70 px-1 font-mono text-[10px] text-muted-foreground 2xl:inline">
            ⌘K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle>Transfer out</DialogTitle>
          <DialogDescription>
            Search your squad, use ↑ ↓ to navigate, Space to select, then press Enter to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setHighlighted((index) =>
                  filteredPlayers.length ? (index + 1) % filteredPlayers.length : 0
                );
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setHighlighted((index) =>
                  filteredPlayers.length
                    ? (index - 1 + filteredPlayers.length) % filteredPlayers.length
                    : 0
                );
              } else if (event.key === " " && filteredPlayers[highlighted]) {
                event.preventDefault();
                togglePlayer(filteredPlayers[highlighted]);
              } else if (event.key === "Enter" && selectedIds.length) {
                event.preventDefault();
                confirmSelection();
              }
            }}
            placeholder="Search players or teams..."
            aria-label="Search players"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="hidden items-center gap-1 sm:flex">
            <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ↵ Continue
            </kbd>
            <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>
        </div>
        <div className="max-h-[min(60vh,30rem)] overflow-y-auto p-2">
          {filteredPlayers.length ? (
            filteredPlayers.map((player, index) => (
              <button
                key={player.player_id}
                type="button"
                aria-pressed={selectedIds.includes(player.player_id)}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => togglePlayer(player)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                  index === highlighted ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-semibold">
                  {elementTypeToPosition(player.element_type)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{player.web_name}</span>
                  <span className="block text-xs text-muted-foreground">{player.team_name}</span>
                </span>
                {selectedIds.includes(player.player_id) && (
                  <span className="flex items-center gap-1 text-xs text-primary">
                    <Check className="h-3.5 w-3.5" /> Selected
                  </span>
                )}
                {index === highlighted && <CornerDownLeft className="h-4 w-4 text-muted-foreground" />}
              </button>
            ))
          ) : (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No squad players found.</p>
          )}
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-xs text-muted-foreground">
            {selectedIds.length} player{selectedIds.length === 1 ? "" : "s"} selected · Space to toggle
          </span>
          <Button size="sm" disabled={!selectedIds.length} onClick={confirmSelection}>
            Continue to replacements
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
