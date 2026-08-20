import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, type Mock } from "vitest";

import {
  ChatApiError,
  RESUME_CHAT_ERROR_MESSAGE,
  RESUME_CHAT_RATE_LIMIT_MESSAGE,
  type ChatClient,
  type ChatResponse,
} from "@/modules/chat/lib/chat-client";

import { useResumeChat } from "./useResumeChat";

type FakeChatClient = {
  sendMessage: Mock<ChatClient["sendMessage"]>;
  sendFeedback: Mock<ChatClient["sendFeedback"]>;
};

/** Fake de `ChatClient` (ADR-012/US-14-04) — sem `fetch`/rede, só resolve/rejeita conforme o teste. */
function createFakeChatClient(): FakeChatClient {
  return {
    sendMessage: vi.fn(),
    sendFeedback: vi.fn().mockResolvedValue(undefined),
  };
}

describe("useResumeChat", () => {
  it("envia a pergunta e preenche a resposta ao receber sucesso do client", async () => {
    const chatClient = createFakeChatClient();
    chatClient.sendMessage.mockResolvedValueOnce({
      answer: "Resposta real.",
    } satisfies ChatResponse);

    const { result } = renderHook(() => useResumeChat(chatClient));

    await act(async () => {
      await result.current.sendQuestion("Onde você trabalha?");
    });

    expect(chatClient.sendMessage).toHaveBeenCalledWith("Onde você trabalha?");
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      question: "Onde você trabalha?",
      answer: "Resposta real.",
      status: "done",
    });
    expect(result.current.isSubmitting).toBe(false);
  });

  it("marca a mensagem como erro com aviso de rate limit quando o client rejeita com ChatApiError de 429", async () => {
    const chatClient = createFakeChatClient();
    chatClient.sendMessage.mockRejectedValueOnce(
      new ChatApiError(RESUME_CHAT_RATE_LIMIT_MESSAGE),
    );

    const { result } = renderHook(() => useResumeChat(chatClient));

    await act(async () => {
      await result.current.sendQuestion("Pergunta qualquer");
    });

    expect(result.current.messages[0]).toMatchObject({
      status: "error",
      answer: RESUME_CHAT_RATE_LIMIT_MESSAGE,
    });
  });

  it("marca a mensagem como erro genérico quando o client rejeita com ChatApiError de falha 5xx", async () => {
    const chatClient = createFakeChatClient();
    chatClient.sendMessage.mockRejectedValueOnce(
      new ChatApiError(RESUME_CHAT_ERROR_MESSAGE),
    );

    const { result } = renderHook(() => useResumeChat(chatClient));

    await act(async () => {
      await result.current.sendQuestion("Pergunta qualquer");
    });

    expect(result.current.messages[0]).toMatchObject({
      status: "error",
      answer: RESUME_CHAT_ERROR_MESSAGE,
    });
  });

  it("marca a mensagem como erro genérico quando o client rejeita com erro não mapeado (falha de rede)", async () => {
    const chatClient = createFakeChatClient();
    chatClient.sendMessage.mockRejectedValueOnce(new Error("network error"));

    const { result } = renderHook(() => useResumeChat(chatClient));

    await act(async () => {
      await result.current.sendQuestion("Pergunta qualquer");
    });

    expect(result.current.messages[0]).toMatchObject({
      status: "error",
      answer: RESUME_CHAT_ERROR_MESSAGE,
    });
  });

  it("ignora envio de pergunta em branco", async () => {
    const chatClient = createFakeChatClient();
    const { result } = renderHook(() => useResumeChat(chatClient));

    await act(async () => {
      await result.current.sendQuestion("   ");
    });

    expect(result.current.messages).toHaveLength(0);
    expect(chatClient.sendMessage).not.toHaveBeenCalled();
  });

  it("ignora novo envio enquanto uma pergunta já está em andamento", async () => {
    const chatClient = createFakeChatClient();
    let resolveSendMessage!: (value: ChatResponse) => void;
    chatClient.sendMessage.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSendMessage = resolve;
      }),
    );

    const { result } = renderHook(() => useResumeChat(chatClient));

    act(() => {
      void result.current.sendQuestion("Primeira pergunta");
    });
    await waitFor(() => expect(result.current.isSubmitting).toBe(true));

    await act(async () => {
      await result.current.sendQuestion("Segunda pergunta, deve ser ignorada");
    });

    expect(chatClient.sendMessage).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSendMessage({ answer: "Resposta real." });
    });

    expect(result.current.messages).toHaveLength(1);
  });

  it("captura o campo source da resposta (US-11-07)", async () => {
    const chatClient = createFakeChatClient();
    chatClient.sendMessage.mockResolvedValueOnce({
      answer: "Resposta pública.",
      source: "web",
    } satisfies ChatResponse);

    const { result } = renderHook(() => useResumeChat(chatClient));

    await act(async () => {
      await result.current.sendQuestion("O que a empresa faz?");
    });

    expect(result.current.messages[0]).toMatchObject({
      answer: "Resposta pública.",
      source: "web",
    });
  });

  it("sendFeedback envia question/answer/rating pelo client e marca o voto", async () => {
    const chatClient = createFakeChatClient();
    chatClient.sendMessage.mockResolvedValueOnce({
      answer: "Resposta real.",
      source: "resume",
    } satisfies ChatResponse);

    const { result } = renderHook(() => useResumeChat(chatClient));

    await act(async () => {
      await result.current.sendQuestion("Onde você trabalha?");
    });
    const messageId = result.current.messages[0].id;

    act(() => {
      result.current.sendFeedback(messageId, "down");
    });

    expect(result.current.messages[0]).toMatchObject({ feedback: "down" });
    expect(chatClient.sendFeedback).toHaveBeenCalledWith({
      question: "Onde você trabalha?",
      answer: "Resposta real.",
      rating: "down",
    });
  });

  it("sendFeedback não quebra quando o client rejeita (fire-and-forget)", async () => {
    const chatClient = createFakeChatClient();
    chatClient.sendMessage.mockResolvedValueOnce({
      answer: "Resposta real.",
      source: "resume",
    } satisfies ChatResponse);
    chatClient.sendFeedback.mockRejectedValueOnce(new Error("network error"));

    const { result } = renderHook(() => useResumeChat(chatClient));

    await act(async () => {
      await result.current.sendQuestion("Onde você trabalha?");
    });
    const messageId = result.current.messages[0].id;

    act(() => {
      result.current.sendFeedback(messageId, "up");
    });

    await waitFor(() => {
      expect(result.current.messages[0]).toMatchObject({ feedback: "up" });
    });
  });

  it("reset limpa mensagens, pergunta em andamento e estado de envio", () => {
    const chatClient = createFakeChatClient();
    const { result } = renderHook(() => useResumeChat(chatClient));

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

  it("usa o adapter HTTP como default quando nenhum ChatClient é injetado", () => {
    const { result } = renderHook(() => useResumeChat());

    expect(result.current.messages).toHaveLength(0);
    expect(typeof result.current.sendQuestion).toBe("function");
  });
});
