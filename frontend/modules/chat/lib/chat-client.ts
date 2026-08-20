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
  sendMessage(question: string): Promise<ChatResponse>;
  sendFeedback(payload: ChatFeedbackPayload): Promise<void>;
}
