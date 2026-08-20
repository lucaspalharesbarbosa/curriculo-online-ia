import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ChatApiError,
  RESUME_CHAT_ERROR_MESSAGE,
  RESUME_CHAT_RATE_LIMIT_MESSAGE,
} from "./chat-client";
import {
  HttpChatClient,
  RESUME_CHAT_ENDPOINT,
  RESUME_CHAT_FEEDBACK_ENDPOINT,
} from "./http-chat-client";

describe("HttpChatClient", () => {
  let client: HttpChatClient;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    client = new HttpChatClient();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("envia a pergunta para o endpoint de chat e resolve com a resposta", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Resposta real.", source: "resume" }),
    } as Response);

    const result = await client.sendMessage("Onde você trabalha?");

    expect(fetch).toHaveBeenCalledWith(
      RESUME_CHAT_ENDPOINT,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "Onde você trabalha?" }),
      }),
    );
    expect(result).toEqual({ answer: "Resposta real.", source: "resume" });
  });

  it("lança ChatApiError com aviso de rate limit em 429, sem vazar o body do backend", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: { code: "rate_limited" } }),
    } as Response);

    const error: unknown = await client
      .sendMessage("Pergunta qualquer")
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ChatApiError);
    expect(error).toMatchObject({ message: RESUME_CHAT_RATE_LIMIT_MESSAGE });
  });

  it("lança ChatApiError com mensagem genérica em falha 5xx, sem vazar detalhe interno", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: { code: "llm_unavailable" } }),
    } as Response);

    await expect(client.sendMessage("Pergunta qualquer")).rejects.toMatchObject(
      {
        message: RESUME_CHAT_ERROR_MESSAGE,
      },
    );
  });

  it("propaga a rejeição quando o fetch falha (falha de rede)", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network error"));

    await expect(client.sendMessage("Pergunta qualquer")).rejects.toThrow(
      "network error",
    );
  });

  it("envia question/answer/rating para o endpoint de feedback", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);

    await client.sendFeedback({
      question: "Onde você trabalha?",
      answer: "Resposta real.",
      rating: "down",
    });

    expect(fetch).toHaveBeenCalledWith(
      RESUME_CHAT_FEEDBACK_ENDPOINT,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "Onde você trabalha?",
          answer: "Resposta real.",
          rating: "down",
        }),
      }),
    );
  });

  it("propaga a rejeição de sendFeedback quando o fetch falha (quem chama decide o fallback)", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network error"));

    await expect(
      client.sendFeedback({
        question: "Onde você trabalha?",
        answer: "Resposta real.",
        rating: "up",
      }),
    ).rejects.toThrow("network error");
  });
});
