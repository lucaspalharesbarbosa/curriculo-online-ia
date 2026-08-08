import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResumeSidebar } from "./ResumeSidebar";

describe("ResumeSidebar", () => {
  it("renderiza perfil, contato e skills a partir das props", () => {
    render(
      <ResumeSidebar
        hero={{
          name: "Lucas Palhares Barbosa",
          title: "Tech Lead | Engenheiro de Software Sênior",
          location: "São José do Rio Preto, SP",
          summary: "Resumo",
          photoUrl: "/foto-lucas-palhares.png",
        }}
        contact={{
          linkedin: "https://www.linkedin.com/in/lucas-palhares-barbosa/",
          email: "lucasp.b@hotmail.com",
          github: "https://github.com/lucaspalharesbarbosa",
          whatsapp: "https://wa.me/5517991123547",
          resumePdfUrl: "/curriculo.pdf",
        }}
        skills={[{ category: "Linguagens", items: ["Java", "Python"] }]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /lucas palhares barbosa/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("lucasp.b@hotmail.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute(
      "href",
      "https://wa.me/5517991123547",
    );
    expect(screen.getByText("Java")).toBeInTheDocument();
    expect(screen.getByText("Tech Lead")).toBeInTheDocument();
    expect(screen.queryByText(/languages/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/soft skills/i)).not.toBeInTheDocument();
  });
});
