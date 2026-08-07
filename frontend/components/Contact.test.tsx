import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ContactSection } from "./Contact";

describe("ContactSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders contact channels and pdf download link", () => {
    render(
      <ContactSection
        contact={{
          linkedin: "https://www.linkedin.com/in/lucas-palhares-barbosa/",
          email: "lucasp.b@hotmail.com",
          github: "https://github.com/lucaspalharesbarbosa",
          whatsapp: "https://wa.me/5517991123547",
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

  it("renders whatsapp link when present", () => {
    render(
      <ContactSection
        contact={{
          linkedin: "https://www.linkedin.com/in/lucas-palhares-barbosa/",
          email: null,
          github: null,
          whatsapp: "https://wa.me/5517991123547",
          resumePdfUrl: null,
        }}
      />,
    );

    const whatsappLink = screen.getByRole("link", { name: /wa\.me/i });
    expect(whatsappLink).toHaveAttribute("href", "https://wa.me/5517991123547");
    expect(whatsappLink).toHaveAttribute("target", "_blank");
    expect(whatsappLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not render whatsapp item when absent", () => {
    render(
      <ContactSection
        contact={{
          linkedin: "https://www.linkedin.com/in/lucas-palhares-barbosa/",
          email: null,
          github: null,
          whatsapp: null,
          resumePdfUrl: null,
        }}
      />,
    );

    expect(screen.queryByText("WhatsApp:")).not.toBeInTheDocument();
  });
});
