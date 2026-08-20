/**
 * Port (ADR-012): contrato entre a lógica de estado do chat (`useResumeChat`)
 * e o transporte real. O hook depende só desta interface, nunca de `fetch`
 * direto — implementação real em `http-chat-client.ts` (adapter HTTP).
 */

export type ChatSource = "resume" | "web";

export type ChatResponse = {
  answer: string;
  /** ADR-010/US-11-07: "web" quando a resposta usou busca externa, não o currículo. */
  source?: ChatSource;
};

export type ChatFeedbackRating = "up" | "down";

export type ChatFeedbackPayload = {
  question: string;
  answer: string;
  rating: ChatFeedbackRating;
};

export type ChatHistoryRole = "user" | "assistant";

/** ADR-014: troca de conversa anterior, enviada ao backend para memória conversacional. */
export type ChatHistoryMessage = {
  role: ChatHistoryRole;
  content: string;
};

/** ADR-014: janela deslizante — mesma janela funcional do backend (`MAX_HISTORY_MESSAGES`, `service.py`). */
export const MAX_HISTORY_MESSAGES = 6;

/** ADR-014: mesmo teto de `HistoryMessage.content` do backend (`router.py`) — evita 422 na troca seguinte quando a resposta anterior é longa. */
export const MAX_HISTORY_CONTENT_LENGTH = 4000;

export const RESUME_CHAT_ERROR_MESSAGE =
  "Não consegui responder agora, tente de novo.";

export const RESUME_CHAT_RATE_LIMIT_MESSAGE =
  "Muitas requisições. Tente novamente em instantes.";

/**
 * Erro de contrato do `ChatClient` — mensagem já pronta para exibir ao
 * visitante (nunca o detalhe interno do transporte/backend).
 */
export class ChatApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatApiError";
  }
}

export interface ChatClient {
  sendMessage(
    question: string,
    history?: ChatHistoryMessage[],
  ): Promise<ChatResponse>;
  sendFeedback(payload: ChatFeedbackPayload): Promise<void>;
}
