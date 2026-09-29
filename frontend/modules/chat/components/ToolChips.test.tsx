import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { ChatToolCall } from "../lib/chat-client";
import { ToolChips } from "./ToolChips";

const TOOLS: ChatToolCall[] = [
  {
    name: "calculate_experience",
    arguments: { skill_or_company: "Python" },
    result: "Experiência profissional com 'Python': 3 anos e 8 meses",
  },
  { name: "search_web", arguments: { query: "SDD" }, result: "Resultado web" },
];

describe("ToolChips", () => {
  afterEach(cleanup);

  it("não renderiza nada quando não há tools", () => {
    const { container } = render(<ToolChips tools={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("mostra um chip com rótulo amigável para cada tool", () => {
    render(<ToolChips tools={TOOLS} />);

    expect(
      screen.getByRole("button", { name: "Calculou experiência" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("button", { name: "Pesquisou na web" }),
    ).toBeInTheDocument();
  });

  it("expande o detalhe técnico com nome, argumentos e resultado e recolhe no segundo clique", () => {
    render(<ToolChips tools={TOOLS} />);
    const chip = screen.getByRole("button", { name: "Calculou experiência" });

    fireEvent.click(chip);

    expect(chip).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("calculate_experience")).toBeInTheDocument();
    expect(screen.getByText(/"skill_or_company":"Python"/)).toBeInTheDocument();
    expect(
      screen.getByLabelText("Resultado de calculate_experience"),
    ).toHaveTextContent("3 anos e 8 meses");

    fireEvent.click(chip);

    expect(chip).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("calculate_experience")).not.toBeInTheDocument();
  });

  it("troca o detalhe aberto ao clicar em outro chip", () => {
    render(<ToolChips tools={TOOLS} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Calculou experiência" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Pesquisou na web" }));

    expect(screen.queryByText("calculate_experience")).not.toBeInTheDocument();
    expect(screen.getByText("search_web")).toBeInTheDocument();
  });

  it("usa rótulo genérico para tool desconhecida", () => {
    render(
      <ToolChips tools={[{ name: "tool_nova", arguments: {}, result: "x" }]} />,
    );

    expect(
      screen.getByRole("button", { name: "Usou uma ferramenta" }),
    ).toBeInTheDocument();
  });
});
