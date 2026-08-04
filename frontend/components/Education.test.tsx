import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EducationSection } from "./Education";

describe("EducationSection", () => {
  it("renders education items", () => {
    render(
      <EducationSection
        items={[
          {
            institution: "Fatec Rio Preto",
            degree: "Tecnólogo em Análise e Desenvolvimento de Sistemas",
            startDate: "2013",
            endDate: "2015",
          },
        ]}
      />,
    );

    expect(screen.getByText("Fatec Rio Preto")).toBeInTheDocument();
    expect(
      screen.getByText("Tecnólogo em Análise e Desenvolvimento de Sistemas"),
    ).toBeInTheDocument();
  });
});
