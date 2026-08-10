import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SummarySection } from "./SummarySection";

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

describe("SummarySection", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("exibe assistente no perfil e about sem passion inventada", () => {
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
    expect(
      screen.getByRole("region", { name: /assistente rag/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^assistente rag$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sua pergunta/i)).toBeInTheDocument();
    expect(screen.getByText("Texto sobre o autor.")).toBeInTheDocument();
    expect(
      screen.queryByText(/building great software/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/developer\.ts/i)).not.toBeInTheDocument();
  });

  it("destaca a lead e extrai ênfases entre travessões para chips", () => {
    render(
      <SummarySection
        name="Lucas"
        title="Tech Lead"
        about="Primeira frase do perfil. Segunda frase com práticas de AI Engineering — Context Engineering, Agentic AI — na construção de agents."
      />,
    );

    expect(screen.getByText("Primeira frase do perfil.")).toBeInTheDocument();
    expect(screen.getByText("Context Engineering")).toBeInTheDocument();
    expect(screen.getByText("Agentic AI")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Segunda frase com práticas de AI Engineering na construção de agents\./i,
      ),
    ).toBeInTheDocument();
  });
});
