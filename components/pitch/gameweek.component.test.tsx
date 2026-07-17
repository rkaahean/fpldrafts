// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { picksStore } from "@/app/store";
import { gameweekPayload } from "@/test/msw/handlers";
import Gameweek from "./Gameweek";

vi.mock("./PitchRow", () => ({
  default: ({ position }: { position: string }) => (
    <div data-testid={`pitchrow-${position}`}>{position}</div>
  ),
}));

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("Gameweek component (integration)", () => {
  beforeEach(() => {
    picksStore.setState({
      picks: undefined,
      base: undefined,
      committedBank: undefined,
      drafts: { changes: [] },
      currentGameweek: 1,
    });
  });

  it("fetches gameweek data, resolves picks, and populates the store", async () => {
    renderWithClient(<Gameweek gameweek={2} />);

    await waitFor(() => {
      expect(picksStore.getState().picks).toBeDefined();
    });

    const state = picksStore.getState();
    expect(state.picks!.data.length).toBe(gameweekPayload.data.length);
    expect(state.picks!.overall.bank).toBe(gameweekPayload.overall.bank);
  });

  it("renders the pitch stats once data has loaded", async () => {
    renderWithClient(<Gameweek gameweek={2} />);

    await waitFor(
      () => {
        expect(screen.getByText("Gameweek")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("Transfers")).toBeInTheDocument();
    expect(screen.getByText("ITB")).toBeInTheDocument();
  });
});
