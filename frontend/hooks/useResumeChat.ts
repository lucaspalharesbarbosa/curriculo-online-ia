"use client";

import { useCallback, useState } from "react";

import {
  ChatApiError,
  RESUME_CHAT_ERROR_MESSAGE,
  RESUME_CHAT_RATE_LIMIT_MESSAGE,
  type ChatClient,
  type ChatFeedbackRating,
} from "@/modules/chat/lib/chat-client";
import { httpChatClient } from "@/modules/chat/lib/http-chat-client";

export type ResumeChatFeedback = ChatFeedbackRating;

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

export { RESUME_CHAT_ERROR_MESSAGE, RESUME_CHAT_RATE_LIMIT_MESSAGE };

/**
 * Estado + envio para o chat (RAG) via `ChatClient` (ADR-012, US-14-04).
 * Recebe o client por parâmetro — default é o adapter HTTP real
 * (`httpChatClient`, proxy Next para `/chat`), para não quebrar quem já usa
 * o hook sem argumento.
 */
export function useResumeChat(chatClient: ChatClient = httpChatClient) {
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
        const data = await chatClient.sendMessage(trimmedQuestion);

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
    [chatClient, isSubmitting, question],
  );

  const sendFeedback = useCallback(
    (messageId: string, rating: ResumeChatFeedback) => {
      // Otimista: reflete o voto na UI antes da resposta do backend — US-11-04
      // CA-003, falha ao registrar não pode travar a conversa.
      setMessages((current) => {
        const target = current.find((message) => message.id === messageId);
        if (target?.answer) {
          void chatClient
            .sendFeedback({
              question: target.question,
              answer: target.answer,
              rating,
            })
            .catch(() => {
              // Fire-and-forget — falha de rede não deve afetar a UI do chat.
            });
        }
        return current.map((message) =>
          message.id === messageId ? { ...message, feedback: rating } : message,
        );
      });
    },
    [chatClient],
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
