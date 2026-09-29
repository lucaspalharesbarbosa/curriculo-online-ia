import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Home from "./page";

describe("Home page", () => {
  afterEach(cleanup);

  it("renderiza os landmarks e as seções principais do currículo", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: /lucas palhares/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: /assistente de ia/i }),
    ).toBeInTheDocument();

    for (const name of [
      /^perfil$/i,
      /linha do tempo da carreira/i,
      /matriz de habilidades/i,
      /projetos e artigos/i,
      /formação, certificações e reconhecimentos/i,
    ]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
  });

  it("oferece navegação por âncoras, link de pular e download do CV", () => {
    render(<Home />);

    const nav = screen.getByRole("navigation", {
      name: /seções do currículo/i,
    });
    expect(
      within(nav).getByRole("link", { name: "Trajetória" }),
    ).toHaveAttribute("href", "#trajetoria");
    expect(
      screen.getByRole("link", { name: /pular para o conteúdo/i }),
    ).toHaveAttribute("href", "#conteudo");
    expect(
      screen.getByRole("link", { name: /baixar cv/i }),
    ).toBeInTheDocument();
  });

  it("mostra o chat com as perguntas iniciais que acionam as tools", () => {
    render(<Home />);

    const chat = screen.getByRole("complementary", {
      name: /assistente de ia/i,
    });
    expect(
      within(chat).getByRole("button", { name: /quantos anos de python/i }),
    ).toBeInTheDocument();
    expect(
      within(chat).getByRole("button", { name: /antes do itaú/i }),
    ).toBeInTheDocument();
    expect(
      within(chat).getByRole("button", { name: /banco vetorial/i }),
    ).toBeInTheDocument();
  });
});
