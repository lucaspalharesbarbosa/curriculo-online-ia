import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { resume } from "@/content/resume";

import { careerStats } from "../lib/career";
import { ymToIndex } from "@/lib/period";
import { Hero } from "./Hero";
import { SiteHeader } from "./SiteHeader";

const stats = careerStats(resume, ymToIndex("2026-09"));

describe("Hero", () => {
  afterEach(cleanup);

  it("mostra nome, papéis, resumo, foto com alt e o botão injetado", () => {
    render(
      <Hero
        hero={resume.hero}
        contact={resume.contact}
        stats={stats}
        current={{ company: "Engineering Brasil", role: "Tech Lead | Senior" }}
        askAction={<button type="button">Perguntar</button>}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /lucas palhares barbosa/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: /papéis e foco/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByAltText(/foto de lucas palhares barbosa/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Tech Lead @ Engineering Brasil"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Perguntar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /baixar cv/i })).toHaveAttribute(
      "download",
    );
  });

  it("mostra os quatro contadores com os valores finais no primeiro render", () => {
    render(
      <Hero
        hero={resume.hero}
        contact={resume.contact}
        stats={stats}
        current={{ company: "X", role: "Y" }}
        askAction={null}
      />,
    );

    expect(
      screen.getByText("anos de carreira").previousSibling,
    ).toHaveTextContent(`${stats.careerYears}+`);
    expect(screen.getByText("empresas").previousSibling).toHaveTextContent(
      String(stats.companies),
    );
    expect(screen.getByText("certificações").previousSibling).toHaveTextContent(
      String(stats.certifications),
    );
  });
});

describe("SiteHeader", () => {
  afterEach(cleanup);

  it("expõe a navegação por seção e os contatos com nome acessível", () => {
    render(<SiteHeader contact={resume.contact} />);

    const nav = screen.getByRole("navigation", {
      name: /seções do currículo/i,
    });
    expect(within(nav).getAllByRole("link")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "LinkedIn" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "WhatsApp" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "E-mail" })).toHaveAttribute(
      "href",
      `mailto:${resume.contact.email}`,
    );
  });

  it("omite contatos ausentes", () => {
    render(
      <SiteHeader
        contact={{
          ...resume.contact,
          github: null,
          whatsapp: null,
          email: null,
        }}
      />,
    );

    expect(
      screen.queryByRole("link", { name: "GitHub" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "E-mail" }),
    ).not.toBeInTheDocument();
  });
});
