import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skills } from "./SkillBadge";

describe("Skills", () => {
  it("renders at least one skill group", () => {
    render(
      <Skills
        groups={[
          {
            category: "Linguagens",
            items: ["Java", "Python"],
          },
        ]}
      />,
    );

    expect(screen.getByText("Linguagens")).toBeInTheDocument();
    expect(screen.getByText("Java")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
  });
});
