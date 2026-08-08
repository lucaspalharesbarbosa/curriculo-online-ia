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
        } as IntersectionObserverEntry,
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

  it("permite perguntar já no Perfil e envia para POST /chat", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Trabalho com Next.js e FastAPI." }),
    } as Response);

    render(<ProfileAssistChat role="Tech Lead | Senior" />);

    expect(
      screen.getByText(/online · pronto para falar sobre tech lead/i),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Sua pergunta"), {
      target: { value: "Qual sua stack?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/chat",
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
      screen.getByRole("region", { name: /assistente do currículo/i }),
    ).toBeInTheDocument();

    expect(MockIntersectionObserver.latest).not.toBeNull();
    act(() => {
      MockIntersectionObserver.latest?.trigger(false);
    });

    expect(
      screen.getByText((content) => content.includes("Assistente ativo")),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("dialog", { name: /assistente do currículo/i })
        .length,
    ).toBeGreaterThan(0);
  });
});
