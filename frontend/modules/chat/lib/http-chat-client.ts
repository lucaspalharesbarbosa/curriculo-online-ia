import {
  ChatApiError,
  MAX_HISTORY_MESSAGES,
  RESUME_CHAT_ERROR_MESSAGE,
  RESUME_CHAT_RATE_LIMIT_MESSAGE,
  type ChatClient,
  type ChatFeedbackPayload,
  type ChatHistoryMessage,
  type ChatResponse,
} from "./chat-client";

/** Same-origin — Next faz proxy para o FastAPI (`app/api/chat`). */
export const RESUME_CHAT_ENDPOINT = "/api/chat";

/** Same-origin — Next faz proxy para o FastAPI (`app/api/chat/feedback`). */
export const RESUME_CHAT_FEEDBACK_ENDPOINT = "/api/chat/feedback";

/** Nunca repassa `detail` do backend — evita vazar config/stack ao visitante. */
function publicErrorMessage(status: number): string {
  if (status === 429) {
    return RESUME_CHAT_RATE_LIMIT_MESSAGE;
  }
  return RESUME_CHAT_ERROR_MESSAGE;
}

/** Adapter HTTP (ADR-012): implementa `ChatClient` via `fetch` para os endpoints Next. */
export class HttpChatClient implements ChatClient {
  async sendMessage(
    question: string,
    history?: ChatHistoryMessage[],
  ): Promise<ChatResponse> {
    // ADR-014: janela deslizante aplicada de novo aqui — não depende só da
    // validação do backend para a experiência normal (o backend segue sendo
    // a fonte de verdade, truncando/validando de qualquer forma).
    const truncatedHistory = history?.slice(-MAX_HISTORY_MESSAGES);
    const body =
      truncatedHistory && truncatedHistory.length > 0
        ? { question, history: truncatedHistory }
        : { question };

    const response = await fetch(RESUME_CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new ChatApiError(publicErrorMessage(response.status));
    }

    return (await response.json()) as ChatResponse;
  }

  async sendFeedback(payload: ChatFeedbackPayload): Promise<void> {
    // Fire-and-forget é responsabilidade de quem chama (useResumeChat) — o
    // adapter só traduz o contrato para a chamada HTTP, sem engolir erro.
    await fetch(RESUME_CHAT_FEEDBACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}

/** Instância default usada pelo `useResumeChat` quando nenhum `ChatClient` é injetado. */
export const httpChatClient = new HttpChatClient();
