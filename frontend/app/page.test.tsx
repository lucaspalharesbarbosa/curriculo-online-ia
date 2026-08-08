import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Home from "./page";

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

describe("Home page", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("renderiza sidebar e seções principais do currículo", () => {
    render(<Home />);
    // Timeout maior: com --coverage a árvore inteira (sidebar + seções
    // colapsáveis) passa dos 5s padrão em máquinas mais lentas.

    expect(
      screen.getByRole("heading", { name: /lucas palhares barbosa/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^perfil$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^experiência$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^educação$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /certificações/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /reconhecimentos/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^destaques$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /download cv/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/nguyen tran gia si/i)).not.toBeInTheDocument();
  }, 15_000);
});
