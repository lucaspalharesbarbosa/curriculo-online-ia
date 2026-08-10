import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ResumeSidebar } from "./ResumeSidebar";

// Projeto não usa `globals: true` no vitest.config.ts, então a limpeza
// automática do Testing Library entre testes não é acionada (mesmo padrão
// de ExperienceSection.test.tsx/ChatWidget.test.tsx).
afterEach(() => {
  cleanup();
});

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
        skills={[
          {
            category: "Linguagens",
            items: [
              { name: "Java", level: 5 },
              { name: "Python", level: 4 },
            ],
          },
        ]}
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
    expect(
      screen.getByRole("img", { name: /nível: especialista/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Tech Lead e Engenheiro de Software Sênior"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/languages/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/soft skills/i)).not.toBeInTheDocument();

    const mapsLink = screen.getByRole("link", {
      name: /são josé do rio preto, sp/i,
    });
    expect(mapsLink).toHaveAttribute(
      "href",
      "https://www.google.com/maps/search/?api=1&query=S%C3%A3o%20Jos%C3%A9%20do%20Rio%20Preto%2C%20SP",
    );
    expect(mapsLink).toHaveAttribute("target", "_blank");
  });

  it("divide hero.title em cargos (destaque) e informações complementares (discreto)", () => {
    render(
      <ResumeSidebar
        hero={{
          name: "Lucas Palhares Barbosa",
          title:
            "Tech Lead | Senior Software Engineer — AI Engineering | Agentic AI | Java • Python | AWS Certified",
          location: "São José do Rio Preto, SP",
          summary: "Resumo",
          photoUrl: null,
        }}
        contact={{
          linkedin: "https://www.linkedin.com/in/lucas-palhares-barbosa/",
          email: null,
          github: null,
          whatsapp: null,
          resumePdfUrl: null,
        }}
        skills={[{ category: "Backend", items: [{ name: "Java", level: 5 }] }]}
      />,
    );

    expect(
      screen.getByLabelText("Tech Lead e Senior Software Engineer"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "AI Engineering · Agentic AI · Java • Python · AWS Certified",
      ),
    ).toBeInTheDocument();
  });

  it("combina Banco de Dados (SQL) e (NoSQL) num único bloco de colunas (US-07-10)", () => {
    render(
      <ResumeSidebar
        hero={{
          name: "Lucas Palhares Barbosa",
          title: "Tech Lead",
          location: "São José do Rio Preto, SP",
          summary: "Resumo",
          photoUrl: null,
        }}
        contact={{
          linkedin: "https://www.linkedin.com/in/lucas-palhares-barbosa/",
          email: null,
          github: null,
          whatsapp: null,
          resumePdfUrl: null,
        }}
        skills={[
          {
            category: "Banco de Dados (SQL)",
            items: [
              { name: "SQL Server", level: 4 },
              { name: "PostgreSQL", level: 3 },
            ],
          },
          {
            category: "Banco de Dados (NoSQL)",
            items: [
              { name: "Redis", level: 3 },
              { name: "DynamoDB", level: 3 },
            ],
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /^banco de dados$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /banco de dados \(sql\)/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /banco de dados \(nosql\)/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Relacional (SQL)")).toBeInTheDocument();
    expect(screen.getByText("Não-relacional (NoSQL)")).toBeInTheDocument();
    expect(screen.getByText("SQL Server")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
    expect(screen.getByText("Redis")).toBeInTheDocument();
    expect(screen.getByText("DynamoDB")).toBeInTheDocument();
  });

  it("exibe o medidor de proficiência (barra segmentada) com o rótulo do nível de cada habilidade", () => {
    render(
      <ResumeSidebar
        hero={{
          name: "Lucas Palhares Barbosa",
          title: "Tech Lead",
          location: "São José do Rio Preto, SP",
          summary: "Resumo",
          photoUrl: null,
        }}
        contact={{
          linkedin: "https://www.linkedin.com/in/lucas-palhares-barbosa/",
          email: null,
          github: null,
          whatsapp: null,
          resumePdfUrl: null,
        }}
        skills={[
          {
            category: "Backend",
            items: [
              { name: "Java", level: 5 },
              { name: "Redis", level: 3 },
            ],
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("img", { name: /nível: especialista/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /nível: intermediário/i }),
    ).toBeInTheDocument();
  });
});
