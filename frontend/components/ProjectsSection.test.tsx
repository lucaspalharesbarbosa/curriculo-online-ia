import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProjectsSection } from "./ProjectsSection";

// Projeto não usa `globals: true` no vitest.config.ts, então a limpeza
// automática do Testing Library entre testes não é acionada (mesmo padrão
// de ChatWidget.test.tsx).
afterEach(() => {
  cleanup();
});

const project = {
  title: "Currículo Online com IA",
  description: "Site pessoal com assistente RAG.",
  technologies: ["Next.js", "FastAPI"],
  repositoryUrl: "https://github.com/lucaspalharesbarbosa/curriculo-online-ia",
};

const article = {
  title: "Introdução aos conceitos de refatoração",
  description: "Artigo autoral sobre refatoração de software.",
  url: "https://desenvolvimento.shift.com.br/introducao-refatoracao",
  source: "Shift Desenvolvimento",
  publishedAt: null,
};

describe("ProjectsSection", () => {
  it("renderiza projeto com link do repositório", () => {
    render(<ProjectsSection projects={[project]} articles={[]} />);

    expect(
      screen.getByRole("heading", { name: /^destaques$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Currículo Online com IA")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /repositório de currículo online com ia/i,
      }),
    ).toHaveAttribute(
      "href",
      "https://github.com/lucaspalharesbarbosa/curriculo-online-ia",
    );
  });

  it("renderiza artigo com link externo e rótulo de leitura, distinto de repositório", () => {
    render(<ProjectsSection projects={[]} articles={[article]} />);

    expect(
      screen.getByText("Introdução aos conceitos de refatoração"),
    ).toBeInTheDocument();
    expect(screen.getByText("Shift Desenvolvimento")).toBeInTheDocument();

    const articleLink = screen.getByRole("link", {
      name: /ler artigo introdução aos conceitos de refatoração/i,
    });
    expect(articleLink).toHaveAttribute(
      "href",
      "https://desenvolvimento.shift.com.br/introducao-refatoracao",
    );
    expect(articleLink).toHaveAttribute("target", "_blank");
    expect(articleLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(
      screen.queryByRole("link", { name: /^repositório de/i }),
    ).not.toBeInTheDocument();
  });

  it("renderiza a seção quando só há artigos e nenhum projeto", () => {
    render(<ProjectsSection projects={[]} articles={[article]} />);

    expect(
      screen.getByRole("heading", { name: /^destaques$/i }),
    ).toBeInTheDocument();
  });

  it("renderiza a seção quando só há projetos e nenhum artigo", () => {
    render(<ProjectsSection projects={[project]} articles={[]} />);

    expect(
      screen.getByRole("heading", { name: /^destaques$/i }),
    ).toBeInTheDocument();
  });

  it("não renderiza nada quando projetos e artigos estão vazios", () => {
    const { container } = render(
      <ProjectsSection projects={[]} articles={[]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
