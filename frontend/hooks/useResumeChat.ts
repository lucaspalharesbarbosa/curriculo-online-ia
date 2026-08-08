"use client";

import { useCallback, useState } from "react";

export type ResumeChatMessage = {
  id: string;
  question: string;
  answer: string | null;
  status: "loading" | "done" | "error";
};

type ChatResponse = {
  answer: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const RESUME_CHAT_ERROR_MESSAGE =
  "Não consegui responder agora, tente de novo.";

/** Estado + envio para o endpoint real `/chat` (RAG). */
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
        const response = await fetch(`${apiUrl}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmedQuestion }),
        });

        if (!response.ok) {
          throw new Error(`Resposta inesperada da API: ${response.status}`);
        }

        const data = (await response.json()) as ChatResponse;

        setMessages((current) =>
          current.map((message) =>
            message.id === messageId
              ? { ...message, answer: data.answer, status: "done" }
              : message,
          ),
        );
      } catch {
        setMessages((current) =>
          current.map((message) =>
            message.id === messageId
              ? { ...message, status: "error" }
              : message,
          ),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, question],
  );

  return {
    messages,
    question,
    setQuestion,
    isSubmitting,
    sendQuestion,
    reset,
  };
}
