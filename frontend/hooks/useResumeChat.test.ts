import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  RESUME_CHAT_ERROR_MESSAGE,
  RESUME_CHAT_RATE_LIMIT_MESSAGE,
  useResumeChat,
} from "./useResumeChat";

describe("useResumeChat", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("envia a pergunta e preenche a resposta ao receber 200", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Resposta real." }),
    } as Response);

    const { result } = renderHook(() => useResumeChat());

    await act(async () => {
      await result.current.sendQuestion("Onde você trabalha?");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      question: "Onde você trabalha?",
      answer: "Resposta real.",
      status: "done",
    });
    expect(result.current.isSubmitting).toBe(false);
  });

  it("marca a mensagem como erro com aviso de rate limit em 429, sem vazar o body do backend", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: { code: "rate_limited" } }),
    } as Response);

    const { result } = renderHook(() => useResumeChat());

    await act(async () => {
      await result.current.sendQuestion("Pergunta qualquer");
    });

    expect(result.current.messages[0]).toMatchObject({
      status: "error",
      answer: RESUME_CHAT_RATE_LIMIT_MESSAGE,
    });
  });

  it("marca a mensagem como erro genérico em falha 5xx, sem vazar detalhe interno", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ error: { code: "llm_unavailable" } }),
    } as Response);

    const { result } = renderHook(() => useResumeChat());

    await act(async () => {
      await result.current.sendQuestion("Pergunta qualquer");
    });

    expect(result.current.messages[0]).toMatchObject({
      status: "error",
      answer: RESUME_CHAT_ERROR_MESSAGE,
    });
  });

  it("marca a mensagem como erro genérico quando o fetch rejeita (falha de rede)", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network error"));

    const { result } = renderHook(() => useResumeChat());

    await act(async () => {
      await result.current.sendQuestion("Pergunta qualquer");
    });

    expect(result.current.messages[0]).toMatchObject({
      status: "error",
      answer: RESUME_CHAT_ERROR_MESSAGE,
    });
  });

  it("ignora envio de pergunta em branco", async () => {
    const { result } = renderHook(() => useResumeChat());

    await act(async () => {
      await result.current.sendQuestion("   ");
    });

    expect(result.current.messages).toHaveLength(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("ignora novo envio enquanto uma pergunta já está em andamento", async () => {
    let resolveFetch!: (value: Response) => void;
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const { result } = renderHook(() => useResumeChat());

    act(() => {
      void result.current.sendQuestion("Primeira pergunta");
    });
    await waitFor(() => expect(result.current.isSubmitting).toBe(true));

    await act(async () => {
      await result.current.sendQuestion("Segunda pergunta, deve ser ignorada");
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch({
        ok: true,
        status: 200,
        json: async () => ({ answer: "Resposta real." }),
      } as Response);
    });

    expect(result.current.messages).toHaveLength(1);
  });

  it("reset limpa mensagens, pergunta em andamento e estado de envio", () => {
    const { result } = renderHook(() => useResumeChat());

    act(() => {
      result.current.setQuestion("Rascunho de pergunta");
    });
    expect(result.current.question).toBe("Rascunho de pergunta");

    act(() => {
      result.current.reset();
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.question).toBe("");
    expect(result.current.isSubmitting).toBe(false);
  });
});
