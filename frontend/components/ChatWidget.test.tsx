import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChatWidget } from "./ChatWidget";

function openChat() {
  fireEvent.click(screen.getByRole("button", { name: "Abrir chat" }));
}

function askQuestion(question: string) {
  fireEvent.change(screen.getByLabelText("Sua pergunta"), {
    target: { value: question },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
}

describe("ChatWidget", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("envia a pergunta para POST /chat e exibe a resposta", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Trabalho com Next.js e FastAPI." }),
    } as Response);

    render(<ChatWidget />);
    openChat();
    askQuestion("Quais tecnologias você usa?");

    expect(fetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "Quais tecnologias você usa?" }),
      }),
    );

    expect(
      await screen.findByText("Trabalho com Next.js e FastAPI."),
    ).toBeInTheDocument();
    expect(screen.getByText("Quais tecnologias você usa?")).toBeInTheDocument();
  });

  it("mostra estado de carregamento enquanto aguarda a resposta", async () => {
    let resolveFetch: (value: Response) => void = () => {};
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    render(<ChatWidget />);
    openChat();
    askQuestion("Você tem experiência com RAG?");

    expect(await screen.findByText("Digitando...")).toBeInTheDocument();

    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Sim, inclusive neste projeto." }),
    } as Response);

    expect(
      await screen.findByText("Sim, inclusive neste projeto."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Digitando...")).not.toBeInTheDocument();
  });

  it("mostra mensagem de erro quando o fetch falha e permite tentar de novo", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network error"));

    render(<ChatWidget />);
    openChat();
    askQuestion("Isso vai falhar?");

    expect(
      await screen.findByText("Não consegui responder agora, tente de novo."),
    ).toBeInTheDocument();

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Agora funcionou." }),
    } as Response);

    askQuestion("Tenta de novo?");

    expect(await screen.findByText("Agora funcionou.")).toBeInTheDocument();
  });

  it("mostra mensagem de erro quando a API responde com status de erro", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    render(<ChatWidget />);
    openChat();
    askQuestion("Vai dar 500?");

    expect(
      await screen.findByText("Não consegui responder agora, tente de novo."),
    ).toBeInTheDocument();
  });

  it("não expõe detalhe interno do backend na UI", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        detail:
          "Chave da OpenAI ausente ou inválida. Configure LLM_API_KEY no backend.",
      }),
    } as Response);

    render(<ChatWidget />);
    openChat();
    askQuestion("Vai vazar config?");

    expect(
      await screen.findByText("Não consegui responder agora, tente de novo."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/LLM_API_KEY/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/OpenAI/i)).not.toBeInTheDocument();
  });
});
