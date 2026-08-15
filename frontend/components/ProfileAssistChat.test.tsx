import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileAssistChat } from "./ProfileAssistChat";

class MockIntersectionObserver {
  static latest: MockIntersectionObserver | null = null;
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.latest = this;
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  trigger(isIntersecting: boolean) {
    this.callback(
      [
        {
          isIntersecting,
          target: document.createElement("div"),
        } as unknown as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

describe("ProfileAssistChat", () => {
  beforeEach(() => {
    MockIntersectionObserver.latest = null;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("permite perguntar já no Perfil e envia para POST /api/chat", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Trabalho com Next.js e FastAPI." }),
    } as Response);

    render(<ProfileAssistChat role="Tech Lead | Senior" />);

    expect(
      screen.getByRole("region", { name: /assistente rag/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/online · baseado no currículo/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /onde lucas trabalha hoje/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /quais tecnologias ele usa/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /onde você trabalha/i }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Sua pergunta"), {
      target: { value: "Qual sua stack?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ question: "Qual sua stack?" }),
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Trabalho com Next.js e FastAPI."),
      ).toBeInTheDocument();
    });
  });

  it("ao sair da viewport mostra o painel sticky/dock", () => {
    render(<ProfileAssistChat role="Tech Lead" />);

    expect(
      screen.getByRole("region", { name: /assistente rag/i }),
    ).toBeInTheDocument();

    expect(MockIntersectionObserver.latest).not.toBeNull();
    act(() => {
      MockIntersectionObserver.latest?.trigger(false);
    });

    expect(
      screen.getByText((content) => content.includes("Assistente RAG ativo")),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("dialog", { name: /assistente rag/i }).length,
    ).toBeGreaterThan(0);
  });

  it("mantém o chat minimizado ao rolar para o topo e descer de novo, só reabrindo pelo botão", async () => {
    render(<ProfileAssistChat role="Tech Lead" />);

    act(() => {
      MockIntersectionObserver.latest?.trigger(false);
    });
    expect(
      screen.getAllByRole("dialog", { name: /assistente rag/i }).length,
    ).toBeGreaterThan(0);

    fireEvent.click(
      screen.getAllByRole("button", { name: /minimizar chat/i })[0],
    );
    await waitFor(() => {
      expect(
        screen.queryAllByRole("dialog", { name: /assistente rag/i }).length,
      ).toBe(0);
    });
    expect(
      screen.getAllByRole("button", { name: /abrir assistente/i }).length,
    ).toBeGreaterThan(0);

    act(() => {
      MockIntersectionObserver.latest?.trigger(true);
    });
    act(() => {
      MockIntersectionObserver.latest?.trigger(false);
    });

    expect(
      screen.queryAllByRole("dialog", { name: /assistente rag/i }).length,
    ).toBe(0);
    expect(
      screen.getAllByRole("button", { name: /abrir assistente/i }).length,
    ).toBeGreaterThan(0);
  });

  it("abre o sheet ao receber o evento do hero mobile", () => {
    render(<ProfileAssistChat role="Tech Lead" />);

    act(() => {
      window.dispatchEvent(new CustomEvent("open-assist-chat"));
    });

    expect(
      screen.getByText((content) => content.includes("Assistente RAG ativo")),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("dialog", { name: /assistente rag/i }).length,
    ).toBeGreaterThan(0);
  });
});
