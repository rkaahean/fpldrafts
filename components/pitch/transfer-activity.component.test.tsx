// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import TransferActivityStrip from "./transfer-activity";

afterEach(cleanup);

describe("TransferActivityStrip", () => {
  it("shows labelled player-out and player-in pairs", () => {
    render(
      <TransferActivityStrip
        source="completed"
        transfers={[
          {
            out: { id: "out-1", webName: "Salah", team: "LIV" },
            in: { id: "in-1", webName: "Saka", team: "ARS" },
          },
        ]}
      />
    );

    expect(screen.getByText("Completed transfers")).toBeInTheDocument();
    expect(screen.getByText("Salah")).toBeInTheDocument();
    expect(screen.getByText("Saka")).toBeInTheDocument();
    expect(screen.getByLabelText("Transfer out")).toBeInTheDocument();
    expect(screen.getByLabelText("Transfer in")).toBeInTheDocument();
  });

  it("keeps a compact empty state for gameweeks without transfers", () => {
    render(<TransferActivityStrip source="planned" transfers={[]} />);

    expect(screen.getByText("Planned transfers")).toBeInTheDocument();
    expect(screen.getByText("No transfers this GW")).toBeInTheDocument();
  });

  it("shows a chip badge when completed transfers were made under a wildcard", () => {
    render(
      <TransferActivityStrip
        source="completed"
        transfers={[
          {
            out: { id: "out-1", webName: "Salah", team: "LIV" },
            in: { id: "in-1", webName: "Saka", team: "ARS" },
          },
        ]}
        activeChip="wildcard"
      />
    );

    expect(screen.getByText("Wildcard")).toBeInTheDocument();
  });

  it("shows no badge when there is no active chip", () => {
    render(
      <TransferActivityStrip
        source="completed"
        transfers={[
          {
            out: { id: "out-1", webName: "Salah", team: "LIV" },
            in: { id: "in-1", webName: "Saka", team: "ARS" },
          },
        ]}
        activeChip={null}
      />
    );

    expect(screen.queryByText("Wildcard")).not.toBeInTheDocument();
  });

  it("shows no badge for planned transfers even if an active chip is passed in", () => {
    render(
      <TransferActivityStrip
        source="planned"
        transfers={[]}
        activeChip="freehit"
      />
    );

    expect(screen.queryByText("Free Hit")).not.toBeInTheDocument();
  });

  it("paginates a long transfer list instead of growing beyond its container", async () => {
    const user = userEvent.setup();
    const transfers = Array.from({ length: 6 }, (_, index) => ({
      out: { id: `out-${index}`, webName: `Out ${index + 1}`, team: "OUT" },
      in: { id: `in-${index}`, webName: `In ${index + 1}`, team: "IN" },
    }));
    render(<TransferActivityStrip source="completed" transfers={transfers} />);

    expect(screen.getByText("Out 1")).toBeInTheDocument();
    expect(screen.queryByText("Out 6")).not.toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next transfers" }));
    expect(screen.queryByText("Out 1")).not.toBeInTheDocument();
    expect(screen.getByText("Out 6")).toBeInTheDocument();
  });
});
