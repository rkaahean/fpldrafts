// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { picksStore } from "@/app/store";
import FixturesClient from "./table";

describe("FixturesClient gameweek controls", () => {
  beforeEach(() => {
    picksStore.setState({ currentGameweek: 38 });
  });

  it("moves the fixture window backward and forward within the season", () => {
    render(<FixturesClient fixtures={[]} />);

    expect(screen.getByText("Fixture planner")).toBeInTheDocument();
    expect(screen.getByText("GW 38")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next gameweek" })
    ).toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", { name: "Previous gameweek" })
    );

    expect(screen.getByText("GW 37")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next gameweek" })
    ).not.toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", { name: "Next gameweek" })
    );

    expect(screen.getByText("GW 38")).toBeInTheDocument();
  });
});
