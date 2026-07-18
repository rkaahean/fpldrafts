"use client";

import type {
  TransferActivity,
  TransferActivitySource,
} from "@/lib/fpl/transfer-activity";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

const DEFAULT_TRANSFERS_PER_PAGE = 5;
const DEFAULT_TRANSFER_ROW_HEIGHT = 34;
const TRANSFER_ROW_GAP = 8;

export default function TransferActivityStrip({
  source,
  transfers,
}: {
  source: TransferActivitySource;
  transfers: TransferActivity[];
}) {
  const railRef = useRef<HTMLElement>(null);
  const transferRowRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [transferRowHeight, setTransferRowHeight] = useState(
    DEFAULT_TRANSFER_ROW_HEIGHT
  );
  const [transfersPerPage, setTransfersPerPage] = useState(
    DEFAULT_TRANSFERS_PER_PAGE
  );
  const pageCount = Math.max(1, Math.ceil(transfers.length / transfersPerPage));
  const visibleTransfers = transfers.slice(
    page * transfersPerPage,
    (page + 1) * transfersPerPage
  );
  const title = source === "completed" ? "Completed transfers" : "Planned transfers";

  useEffect(() => {
    setPage(0);
  }, [source, transfers]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof ResizeObserver === "undefined") {
      return;
    }

    const updatePageSize = () => {
      const availableHeight = rail.clientHeight - 112;
      if (availableHeight <= 0) return;
      setTransfersPerPage(
        Math.max(
          1,
          Math.floor(
            (availableHeight + TRANSFER_ROW_GAP) /
              (transferRowHeight + TRANSFER_ROW_GAP)
          )
        )
      );
    };
    updatePageSize();
    const observer = new ResizeObserver(updatePageSize);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [transferRowHeight]);

  useEffect(() => {
    const row = transferRowRef.current;
    if (!row || typeof ResizeObserver === "undefined") {
      return;
    }

    const updateRowHeight = () => {
      if (row.clientHeight) {
        setTransferRowHeight(row.clientHeight);
      }
    };
    updateRowHeight();
    const observer = new ResizeObserver(updateRowHeight);
    observer.observe(row);
    return () => observer.disconnect();
  }, [visibleTransfers.length]);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  return (
    <section
      ref={railRef}
      aria-label={title}
      className="flex min-h-10 flex-col gap-3 rounded-md border bg-background/40 p-3 text-xs shadow-sm lg:h-full lg:overflow-hidden"
    >
      <span className="font-medium text-muted-foreground">{title}</span>
      {transfers.length ? (
        <>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            {visibleTransfers.map((transfer, index) => (
              <div
                key={`${transfer.out.id}-${transfer.in.id}`}
                ref={index === 0 ? transferRowRef : undefined}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 rounded-md border bg-muted/30 px-3 py-2"
              >
                <span className="flex min-w-0 items-center justify-end gap-1.5 text-right">
                  <span className="truncate font-medium text-foreground">{transfer.out.webName}</span>
                  <span className="shrink-0 text-muted-foreground">{transfer.out.team}</span>
                  <ArrowLeft aria-label="Transfer out" className="h-4 w-4 shrink-0 text-red-500" />
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <ArrowRight aria-label="Transfer in" className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="truncate font-medium text-foreground">{transfer.in.webName}</span>
                  <span className="shrink-0 text-muted-foreground">{transfer.in.team}</span>
                </span>
              </div>
            ))}
          </div>
          {pageCount > 1 && (
            <div className="flex items-center justify-between border-t pt-2">
              <Button
                aria-label="Previous transfers"
                variant="ghost"
                size="xs"
                disabled={page === 0}
                onClick={() => setPage((current) => current - 1)}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-muted-foreground">{page + 1} / {pageCount}</span>
              <Button
                aria-label="Next transfers"
                variant="ghost"
                size="xs"
                disabled={page === pageCount - 1}
                onClick={() => setPage((current) => current + 1)}
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <span className="text-muted-foreground">No transfers this GW</span>
      )}
    </section>
  );
}
