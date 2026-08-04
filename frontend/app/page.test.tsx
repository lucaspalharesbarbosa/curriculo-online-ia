import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home page", () => {
  it("renders the resume hero and main sections", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /lucas palhares barbosa/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /experiência profissional/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /formação acadêmica/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /habilidades técnicas/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /contato/i }),
    ).toBeInTheDocument();
  });
});
