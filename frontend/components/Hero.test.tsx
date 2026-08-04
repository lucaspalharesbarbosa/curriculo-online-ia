import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Hero } from "./Hero";

const mockHero = {
  name: "Lucas Palhares Barbosa",
  title: "Tech Lead",
  location: "São José do Rio Preto, SP",
  summary: "Resumo curto de posicionamento profissional.",
};

describe("Hero", () => {
  it("renders hero and about content", () => {
    render(
      <Hero hero={mockHero} about="Parágrafo longo sobre a trajetória." />,
    );

    expect(screen.getByText(mockHero.name)).toBeInTheDocument();
    expect(screen.getByText(mockHero.title)).toBeInTheDocument();
    expect(screen.getByText(mockHero.summary)).toBeInTheDocument();
    expect(
      screen.getByText("Parágrafo longo sobre a trajetória."),
    ).toBeInTheDocument();
  });
});
