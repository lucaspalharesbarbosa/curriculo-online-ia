import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

import {
  ChatApiError,
  MAX_HISTORY_MESSAGES,
  RESUME_CHAT_ERROR_MESSAGE,
  RESUME_CHAT_RATE_LIMIT_MESSAGE,
  type ChatHistoryMessage,
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
    expect(result).toEqual({
      answer: "Resposta real.",
      source: "resume",
      tools: [],
    });
  });

  it("repassa as tools usadas quando o backend devolve o campo (ADR-018)", async () => {
    const tool = {
      name: "calculate_experience",
      arguments: { skill_or_company: "Python" },
      result: "Experiência profissional com 'Python': 3 anos e 8 meses",
    };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        answer: "3 anos e 8 meses.",
        source: "resume",
        tools: [tool],
      }),
    } as Response);

    const result = await client.sendMessage("Quantos anos de Python?");

    expect(result.tools).toEqual([tool]);
  });

  it("descarta entradas de tools malformadas sem quebrar a resposta", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        answer: "ok",
        tools: [
          { name: "search_web", arguments: "texto", result: "r" },
          { name: 42, result: "r" },
          "lixo",
          null,
        ],
      }),
    } as Response);

    const result = await client.sendMessage("Pergunta");

    expect(result.answer).toBe("ok");
    expect(result.tools).toEqual([
      { name: "search_web", arguments: {}, result: "r" },
    ]);
  });

  it("trata tools que não é lista como vazio", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ answer: "ok", tools: "nada" }),
    } as Response);

    const result = await client.sendMessage("Pergunta");

    expect(result.tools).toEqual([]);
  });

  it("inclui o history no body quando informado (ADR-014)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Resposta real.", source: "resume" }),
    } as Response);
    const history = [
      { role: "user" as const, content: "Onde Lucas trabalha?" },
      { role: "assistant" as const, content: "Na Engineering Brasil." },
    ];

    await client.sendMessage("Onde fica a matriz da empresa?", history);

    expect(fetch).toHaveBeenCalledWith(
      RESUME_CHAT_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify({
          question: "Onde fica a matriz da empresa?",
          history,
        }),
      }),
    );
  });

  it("trunca o history às últimas MAX_HISTORY_MESSAGES trocas antes de enviar", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Resposta real." }),
    } as Response);
    const history = Array.from(
      { length: 10 },
      (_, index): ChatHistoryMessage => ({
        role: index % 2 === 0 ? "user" : "assistant",
        content: `turno ${index}`,
      }),
    );

    await client.sendMessage("Pergunta atual", history);

    const sentBody = JSON.parse(
      (fetch as unknown as Mock).mock.calls[0][1].body as string,
    );
    expect(sentBody.history).toHaveLength(MAX_HISTORY_MESSAGES);
    expect(sentBody.history).toEqual(history.slice(-MAX_HISTORY_MESSAGES));
  });

  it("não inclui history no body quando não informado (retrocompatibilidade)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Resposta real." }),
    } as Response);

    await client.sendMessage("Onde você trabalha?", []);

    expect(fetch).toHaveBeenCalledWith(
      RESUME_CHAT_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify({ question: "Onde você trabalha?" }),
      }),
    );
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
