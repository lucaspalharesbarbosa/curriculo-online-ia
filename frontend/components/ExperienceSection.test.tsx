import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ExperienceSection } from "./ExperienceSection";

// Projeto não usa `globals: true` no vitest.config.ts, então a limpeza
// automática do Testing Library entre testes não é acionada (mesmo padrão
// de ChatWidget.test.tsx).
afterEach(() => {
  cleanup();
});

describe("ExperienceSection", () => {
  it("renderiza experiência profissional a partir das props", () => {
    render(
      <ExperienceSection
        experiences={[
          {
            company: "Engineering Brasil",
            role: "Tech Lead",
            startDate: "2026-03",
            endDate: null,
            location: "São José do Rio Preto, SP",
            modality: "Remoto",
            highlights: ["Liderança técnica da squad"],
            technologies: ["Python", "Java"],
            logoUrl: "/engineeringbr_logo.jpg",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /^experiência$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tech Lead")).toBeInTheDocument();
    expect(screen.getByText("Engineering Brasil")).toBeInTheDocument();
    expect(screen.getByText(/2026-03 – Atual/)).toBeInTheDocument();
    expect(screen.getByText("Liderança técnica da squad")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /logo engineering brasil/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^atual$/i)).toBeInTheDocument();
  });

  it("não mostra o selo 'Atual' quando a experiência já terminou", () => {
    render(
      <ExperienceSection
        experiences={[
          {
            company: "Banco BV",
            role: "Senior Software Engineer",
            startDate: "2025-10",
            endDate: "2026-01",
            location: "São Paulo, SP",
            modality: "Remoto",
            highlights: ["Correções de vulnerabilidades"],
            technologies: ["Java"],
            logoUrl: null,
          },
        ]}
      />,
    );

    expect(screen.queryByText(/^atual$/i)).not.toBeInTheDocument();
  });

  it("usa ícone decorativo quando a empresa não tem logo", () => {
    render(
      <ExperienceSection
        experiences={[
          {
            company: "Grupo WDG",
            role: "Junior Web Developer",
            startDate: "2015-11",
            endDate: "2016-08",
            location: "São José do Rio Preto, SP",
            modality: "Presencial",
            highlights: ["Desenvolvimento de funcionalidades"],
            technologies: ["C#"],
            logoUrl: null,
          },
        ]}
      />,
    );

    expect(
      screen.queryByRole("img", { name: /logo grupo wdg/i }),
    ).not.toBeInTheDocument();
  });

  it("agrupa promoções na mesma empresa sob um único ícone/logo", () => {
    render(
      <ExperienceSection
        experiences={[
          {
            company: "WebPic",
            role: "Web Developer",
            startDate: "2018-05",
            endDate: "2020-09",
            location: "São José do Rio Preto, SP",
            modality: "Presencial",
            highlights: ["Atuei em ERP para indústria de confecção e moda"],
            technologies: ["C#"],
            logoUrl: "/grupowebpic_logo.jpg",
          },
          {
            company: "WebPic",
            role: "Junior Web Developer",
            startDate: "2016-11",
            endDate: "2018-05",
            location: "São José do Rio Preto, SP",
            modality: "Presencial",
            highlights: ["Desenvolvi integração com TEF"],
            technologies: ["C#"],
            logoUrl: "/grupowebpic_logo.jpg",
          },
        ]}
      />,
    );

    expect(screen.getAllByRole("img", { name: /logo webpic/i })).toHaveLength(
      1,
    );
    expect(screen.getAllByText("WebPic")).toHaveLength(1);
    expect(screen.getByText(/promovido/i)).toBeInTheDocument();
    expect(screen.getByText("Web Developer")).toBeInTheDocument();
    expect(screen.getByText("Junior Web Developer")).toBeInTheDocument();
  });
});
