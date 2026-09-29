import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FIXTURES } from "../lib/tool-results.fixtures";
import ToolCards from "./ToolCards";

describe("ToolCards", () => {
  afterEach(cleanup);

  it("desenha o card de experiência com o número grande e os cargos", () => {
    render(
      <ToolCards
        tools={[
          {
            name: "calculate_experience",
            arguments: { skill_or_company: "Python" },
            result: FIXTURES.calculate,
          },
        ]}
      />,
    );

    expect(screen.getByText("3 anos e 8 meses")).toBeInTheDocument();
    expect(screen.getByText(/44 meses/)).toBeInTheDocument();
    expect(screen.getByText("Engineering Brasil")).toBeInTheDocument();
    expect(screen.getByText("Itaú Unibanco")).toBeInTheDocument();
    expect(screen.getByText(/mar\/2026 → atual/)).toBeInTheDocument();
  });

  it("desenha o card de tecnologia com uso e cargos", () => {
    render(
      <ToolCards
        tools={[
          {
            name: "find_technology",
            arguments: { name: "Kubernetes" },
            result: FIXTURES.technology,
          },
        ]}
      />,
    );

    expect(screen.getByText("Onde aparece Kubernetes")).toBeInTheDocument();
    expect(screen.getByText("9 meses")).toBeInTheDocument();
    expect(screen.getByText(/2 cargos/)).toBeInTheDocument();
    expect(screen.getByText("Banco BV")).toBeInTheDocument();
  });

  it("avisa quando nenhum cargo lista a tecnologia e mostra as notas", () => {
    render(
      <ToolCards
        tools={[
          {
            name: "find_technology",
            arguments: { name: "Docker" },
            result: [
              "Tecnologia 'Docker':",
              "- Uso profissional: nenhum cargo lista essa tecnologia.",
              "- Projetos: Currículo online.",
            ].join("\n"),
          },
        ]}
      />,
    );

    expect(
      screen.getByText("Nenhum cargo lista essa tecnologia."),
    ).toBeInTheDocument();
    expect(screen.getByText("Projetos: Currículo online.")).toBeInTheDocument();
  });

  it("desenha o card da empresa com cargo, período, local e tecnologias", () => {
    render(
      <ToolCards
        tools={[
          {
            name: "get_experience",
            arguments: { company: "Banco BV" },
            result: FIXTURES.company,
          },
        ]}
      />,
    );

    expect(screen.getByText("Banco BV")).toBeInTheDocument();
    expect(
      screen.getByText("Senior Software Engineer (Outsourcing)"),
    ).toBeInTheDocument();
    expect(screen.getByText("São Paulo, SP (Remoto)")).toBeInTheDocument();
    const techs = screen.getByRole("list", { name: "Tecnologias" });
    expect(within(techs).getByText("Kubernetes")).toBeInTheDocument();
    expect(within(techs).queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it("resume tecnologias além do limite em um contador", () => {
    const many = Array.from({ length: 12 }, (_, i) => `Tech${i}`).join(", ");
    render(
      <ToolCards
        tools={[
          {
            name: "get_experience",
            arguments: { company: "X" },
            result: [
              "Empresa: X",
              "  Cargo: Dev",
              "  Período: 2020-01 a 2021-01",
              `  Tecnologias usadas: ${many}`,
            ].join("\n"),
          },
        ]}
      />,
    );

    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.queryByText("Tech11")).not.toBeInTheDocument();
  });

  it("desenha a linha do tempo agrupando cargos da mesma empresa e destacando o around", () => {
    render(
      <ToolCards
        tools={[
          {
            name: "career_timeline",
            arguments: { around: "Itaú" },
            result: `${FIXTURES.timeline}\n${FIXTURES.around}`,
          },
        ]}
      />,
    );

    const items = screen.getAllByRole("listitem", { hidden: false });
    expect(items.length).toBeGreaterThan(6);
    expect(screen.getAllByText("WebPic")).toHaveLength(1);
    expect(
      screen.getByText(/Junior Web Developer · nov\/2016/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Antes de Itaú Unibanco:/)).toBeInTheDocument();
    expect(
      screen.getAllByText("Itaú Unibanco")[0].closest("[aria-current]"),
    ).not.toBeNull();
  });

  it("ignora tools sem card ou com formato desconhecido", () => {
    const { container } = render(
      <ToolCards
        tools={[
          { name: "search_resume", arguments: {}, result: "- [skills] texto" },
          {
            name: "calculate_experience",
            arguments: {},
            result: "formato novo",
          },
        ]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
