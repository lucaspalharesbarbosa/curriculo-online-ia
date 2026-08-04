import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectCard } from "./ProjectCard";

describe("ProjectCard", () => {
  it("renders project title and repository link", () => {
    render(
      <ProjectCard
        project={{
          title: "Currículo Online com IA",
          description: "Site pessoal com assistente RAG.",
          technologies: ["Next.js", "FastAPI"],
          repositoryUrl:
            "https://github.com/lucaspalharesbarbosa/curriculo-online-ia",
        }}
      />,
    );

    const link = screen.getByRole("link", { name: /currículo online com ia/i });
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/lucaspalharesbarbosa/curriculo-online-ia",
    );
    expect(screen.getByText("Next.js")).toBeInTheDocument();
  });
});
