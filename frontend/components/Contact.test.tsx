import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContactSection } from "./Contact";

describe("ContactSection", () => {
  it("renders contact channels and pdf download link", () => {
    render(
      <ContactSection
        contact={{
          linkedin: "https://www.linkedin.com/in/lucas-palhares-barbosa/",
          email: "lucasp.b@hotmail.com",
          github: "https://github.com/lucaspalharesbarbosa",
          resumePdfUrl: "/Lucas_Palhares_Barbosa_Engenheiro_De_Software.pdf",
        }}
      />,
    );

    expect(screen.getByText("lucasp.b@hotmail.com")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /baixar currículo em pdf/i }),
    ).toHaveAttribute(
      "href",
      "/Lucas_Palhares_Barbosa_Engenheiro_De_Software.pdf",
    );
  });
});
