import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExperienceCard } from "./ExperienceCard";

const mockExperience = {
  company: "Engineering Brasil",
  role: "Tech Lead | Senior Software Engineer",
  startDate: "2026-03",
  endDate: null,
  location: "São José do Rio Preto, SP",
  modality: "Remoto",
  highlights: ["Liderança técnica de squad de IA aplicada"],
  technologies: ["Python", "Java"],
};

describe("ExperienceCard", () => {
  it("renders company, role and highlights", () => {
    render(<ExperienceCard experience={mockExperience} />);

    expect(screen.getByText(mockExperience.company)).toBeInTheDocument();
    expect(screen.getByText(mockExperience.role)).toBeInTheDocument();
    expect(screen.getByText(mockExperience.highlights[0])).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
  });
});
