import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExperienceSection } from "./ExperienceSection";

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
});
