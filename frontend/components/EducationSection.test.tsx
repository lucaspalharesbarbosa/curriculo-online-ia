import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EducationSection } from "./EducationSection";

describe("EducationSection", () => {
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
});
