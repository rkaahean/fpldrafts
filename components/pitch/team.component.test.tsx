// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import Team from "./team";

vi.mock("react-device-detect", () => ({ isMobile: false }));
vi.mock("../drafts/remove", () => ({
  RemoveAll: () => <button aria-label="Remove all">×</button>,
}));
vi.mock("../drafts/table/changes", () => ({
  default: () => <button aria-label="View changes">↻</button>,
}));
vi.mock("../drafts/table/save", () => ({
  default: () => <button aria-label="Save draft">↓</button>,
}));
vi.mock("../drafts/update", () => ({
  default: () => <button aria-label="Update draft">↻</button>,
}));
vi.mock("../transfers/player-pane", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <button aria-label="Browse players">{children}</button>
  ),
}));
vi.mock("./Gameweek", () => ({
  default: ({ toolbar }: { toolbar?: ReactNode }) => (
    <div>
      Gameweek
      {toolbar}
    </div>
  ),
}));

describe("Team draft toolbar", () => {
  it("passes a single overlay toolbar into Gameweek with action icons grouped together", () => {
    render(<Team gameweek={5} />);

    const toolbar = screen.getByLabelText("Draft actions");
    expect(toolbar).toHaveClass(
      "rounded-full",
      "border",
      "bg-card/80",
      "backdrop-blur"
    );
    expect(toolbar).toHaveClass("text-foreground", "[&_svg]:block");
  });

  it("puts the player selector behind an action-rail icon", () => {
    render(<Team gameweek={5} playerSelector={<span>Selector</span>} />);

    expect(screen.getByLabelText("Browse players")).toHaveTextContent(
      "Selector"
    );
  });
});
