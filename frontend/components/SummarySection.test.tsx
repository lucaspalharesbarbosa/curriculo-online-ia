import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SummarySection } from "./SummarySection";

describe("SummarySection", () => {
  it("exibe name, role e about sem passion inventada", () => {
    render(
      <SummarySection
        name="Lucas Palhares Barbosa"
        title="Tech Lead"
        about="Texto sobre o autor."
      />,
    );

    expect(
      screen.getByRole("heading", { name: /^perfil$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/lucas palhares barbosa/i)).toBeInTheDocument();
    expect(screen.getByText(/tech lead/i)).toBeInTheDocument();
    expect(screen.getByText("Texto sobre o autor.")).toBeInTheDocument();
    expect(
      screen.queryByText(/building great software/i),
    ).not.toBeInTheDocument();
  });
});
