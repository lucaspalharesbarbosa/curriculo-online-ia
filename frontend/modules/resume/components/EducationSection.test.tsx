import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EducationSection } from "./EducationSection";

describe("EducationSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("renderiza formação sem localização inventada", () => {
    render(
      <EducationSection
        items={[
          {
            institution: "FATEC São José do Rio Preto",
            degree: "Graduação em Análise e Desenvolvimento de Sistemas",
            startDate: "2013",
            endDate: "2015",
            logoUrl: "/fatec_rio_preto_logo.jpg",
            websiteUrl: "https://fatecriopreto.cps.sp.gov.br/",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /^educação$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("FATEC São José do Rio Preto")).toBeInTheDocument();
    expect(
      screen.getByText("Graduação em Análise e Desenvolvimento de Sistemas"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /logo fatec são josé do rio preto/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/ho chi minh/i)).not.toBeInTheDocument();
  });

  it("mostra link para o site oficial quando websiteUrl está preenchido", () => {
    render(
      <EducationSection
        items={[
          {
            institution: "FATEC São José do Rio Preto",
            degree: "Graduação em Análise e Desenvolvimento de Sistemas",
            startDate: "2013",
            endDate: "2015",
            logoUrl: null,
            websiteUrl: "https://fatecriopreto.cps.sp.gov.br/",
          },
        ]}
      />,
    );

    const link = screen.getByRole("link", {
      name: /site oficial de fatec são josé do rio preto/i,
    });
    expect(link).toHaveAttribute(
      "href",
      "https://fatecriopreto.cps.sp.gov.br/",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("não mostra link de site quando websiteUrl é null", () => {
    render(
      <EducationSection
        items={[
          {
            institution: "Etec Philadelpho Gouvêa Netto",
            degree: "Técnico em Informática",
            startDate: "2011",
            endDate: "2012",
            logoUrl: null,
            websiteUrl: null,
          },
        ]}
      />,
    );

    expect(
      screen.queryByRole("link", { name: /site oficial/i }),
    ).not.toBeInTheDocument();
  });
});
