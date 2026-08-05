"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";

type ChatMessage = {
  id: string;
  question: string;
  answer: string | null;
  status: "loading" | "done" | "error";
};

type ChatResponse = {
  answer: string;
};

// mesmo padrão de fallback de NEXT_PUBLIC_SITE_URL em frontend/app/layout.tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ERROR_MESSAGE = "Não consegui responder agora, tente de novo.";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();
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
          message.id === messageId ? { ...message, status: "error" } : message,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <section
          role="dialog"
          aria-label="Chat com o assistente"
          className="flex h-96 w-80 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg sm:w-96 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Fale comigo
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar chat"
              className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              Fechar
            </button>
          </header>

          <ul
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <li className="text-sm text-zinc-500 dark:text-zinc-400">
                Pergunte algo sobre a minha trajetória profissional.
              </li>
            ) : null}
            {messages.map((message) => (
              <li key={message.id} className="space-y-1">
                <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50">
                  {message.question}
                </p>
                {message.status === "loading" ? (
                  <p className="rounded-md px-3 py-2 text-sm italic text-zinc-500 dark:text-zinc-400">
                    Digitando...
                  </p>
                ) : null}
                {message.status === "done" ? (
                  <p className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                    {message.answer}
                  </p>
                ) : null}
                {message.status === "error" ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                    {ERROR_MESSAGE}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800"
          >
            <label htmlFor={inputId} className="sr-only">
              Sua pergunta
            </label>
            <input
              id={inputId}
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Digite sua pergunta..."
              disabled={isSubmitting}
              className="flex-1 rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600"
            />
            <button
              type="submit"
              disabled={isSubmitting || question.trim().length === 0}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Enviar
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
        aria-expanded={isOpen}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-xl text-white shadow-lg transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        💬
      </button>
    </div>
  );
}
