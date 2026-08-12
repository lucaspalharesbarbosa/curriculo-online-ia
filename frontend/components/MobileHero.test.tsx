import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MobileHero } from "./MobileHero";

afterEach(() => {
  cleanup();
});

const hero = {
  name: "Lucas Palhares Barbosa",
  title: "Tech Lead | Senior Software Engineer — AI Engineering",
  location: "São José do Rio Preto, SP",
  summary: "Resumo",
  photoUrl: "/foto-lucas-palhares-2026.png",
};

const contact = {
  linkedin: "https://www.linkedin.com/in/lucas-palhares-barbosa/",
  email: "lucasp.b@hotmail.com",
  github: "https://github.com/lucaspalharesbarbosa",
  whatsapp: "https://wa.me/5517991123547",
  resumePdfUrl: "/curriculo.pdf",
};

const skills = [
  {
    category: "Linguagens",
    items: [{ name: "Java", level: 5 }],
  },
];

describe("MobileHero", () => {
  it("mostra identidade e CTAs sem listar skills no first paint", () => {
    render(<MobileHero hero={hero} contact={contact} skills={skills} />);

    expect(
      screen.getByRole("heading", { name: /lucas palhares barbosa/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /assistente rag/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /baixar cv em pdf/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ver habilidades técnicas/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Java")).not.toBeInTheDocument();
  });

  it("abre o sheet de habilidades ao tocar no CTA", () => {
    render(<MobileHero hero={hero} contact={contact} skills={skills} />);

    fireEvent.click(
      screen.getByRole("button", { name: /ver habilidades técnicas/i }),
    );

    expect(
      screen.getByRole("dialog", { name: /habilidades/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Java")).toBeInTheDocument();
  });
});
