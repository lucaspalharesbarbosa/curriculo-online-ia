import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectsSection } from "./ProjectsSection";

describe("ProjectsSection", () => {
  it("renderiza projeto com link do repositório", () => {
    render(
      <ProjectsSection
        projects={[
          {
            title: "Currículo Online com IA",
            description: "Site pessoal com assistente RAG.",
            technologies: ["Next.js", "FastAPI"],
            repositoryUrl:
              "https://github.com/lucaspalharesbarbosa/curriculo-online-ia",
          },
        ]}
      />,
    );

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
});
