"use client";

import { useCallback, useState } from "react";

export type ResumeChatFeedback = "up" | "down";

export type ResumeChatMessage = {
  id: string;
  question: string;
  answer: string | null;
  status: "loading" | "done" | "error";
  /** ADR-010/US-11-07: "web" quando a resposta usou busca externa, não o currículo. */
  source?: "resume" | "web";
  /** US-11-04: voto do visitante nesta resposta, `null`/ausente até ele avaliar. */
  feedback?: ResumeChatFeedback | null;
};

type ChatResponse = {
  answer: string;
  source?: "resume" | "web";
};

/** Same-origin — Next faz proxy para o FastAPI (`app/api/chat`). */
export const RESUME_CHAT_ENDPOINT = "/api/chat";

/** Same-origin — Next faz proxy para o FastAPI (`app/api/chat/feedback`). */
export const RESUME_CHAT_FEEDBACK_ENDPOINT = "/api/chat/feedback";

export const RESUME_CHAT_ERROR_MESSAGE =
  "Não consegui responder agora, tente de novo.";

export const RESUME_CHAT_RATE_LIMIT_MESSAGE =
  "Muitas requisições. Tente novamente em instantes.";

class ChatApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatApiError";
  }
}

/** Nunca repassa `detail` do backend — evita vazar config/stack ao visitante. */
function publicErrorMessage(status: number): string {
  if (status === 429) {
    return RESUME_CHAT_RATE_LIMIT_MESSAGE;
  }
  return RESUME_CHAT_ERROR_MESSAGE;
}

/** Estado + envio para o endpoint real `/chat` (RAG) via proxy Next. */
export function useResumeChat() {
  const [messages, setMessages] = useState<ResumeChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = useCallback(() => {
    setMessages([]);
    setQuestion("");
    setIsSubmitting(false);
  }, []);

  const sendQuestion = useCallback(
    async (rawQuestion?: string) => {
      const trimmedQuestion = (rawQuestion ?? question).trim();
      if (!trimmedQuestion || isSubmitting) {
        return;
      }

      const messageId = crypto.randomUUID();
      setMessages((current) => [
        ...current,
        {
          id: messageId,
          question: trimmedQuestion,
          answer: null,
          status: "loading",
        },
      ]);
      setQuestion("");
      setIsSubmitting(true);

      try {
        const response = await fetch(RESUME_CHAT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmedQuestion }),
        });

        if (!response.ok) {
          throw new ChatApiError(publicErrorMessage(response.status));
        }

        const data = (await response.json()) as ChatResponse;

        setMessages((current) =>
          current.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  answer: data.answer,
                  status: "done",
                  source: data.source,
                }
              : message,
          ),
        );
      } catch (error) {
        const detail =
          error instanceof ChatApiError
            ? error.message
            : RESUME_CHAT_ERROR_MESSAGE;
        setMessages((current) =>
          current.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  answer: detail,
                  status: "error",
                }
              : message,
          ),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, question],
  );

  const sendFeedback = useCallback(
    (messageId: string, rating: ResumeChatFeedback) => {
      // Otimista: reflete o voto na UI antes da resposta do backend — US-11-04
      // CA-003, falha ao registrar não pode travar a conversa.
      setMessages((current) => {
        const target = current.find((message) => message.id === messageId);
        if (target?.answer) {
          void fetch(RESUME_CHAT_FEEDBACK_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: target.question,
              answer: target.answer,
              rating,
            }),
          }).catch(() => {
            // Fire-and-forget — falha de rede não deve afetar a UI do chat.
          });
        }
        return current.map((message) =>
          message.id === messageId ? { ...message, feedback: rating } : message,
        );
      });
    },
    [],
  );

  return {
    messages,
    question,
    setQuestion,
    isSubmitting,
    sendQuestion,
    sendFeedback,
    reset,
  };
}
