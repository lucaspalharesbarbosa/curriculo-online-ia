import {
  ChatApiError,
  RESUME_CHAT_ERROR_MESSAGE,
  RESUME_CHAT_RATE_LIMIT_MESSAGE,
  type ChatClient,
  type ChatFeedbackPayload,
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
  async sendMessage(question: string): Promise<ChatResponse> {
    const response = await fetch(RESUME_CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
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
