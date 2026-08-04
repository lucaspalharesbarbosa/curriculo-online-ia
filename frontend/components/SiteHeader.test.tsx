import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("renders navigation links for all sections", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sobre" })).toHaveAttribute(
      "href",
      "#about",
    );
    expect(screen.getByRole("link", { name: "Experiência" })).toHaveAttribute(
      "href",
      "#experience",
    );
    expect(
      screen.getByRole("link", { name: "Certificações" }),
    ).toHaveAttribute("href", "#certifications");
    expect(screen.getByRole("link", { name: "Contato" })).toHaveAttribute(
      "href",
      "#contact",
    );
  });
});
