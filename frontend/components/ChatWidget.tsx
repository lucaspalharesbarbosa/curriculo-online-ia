"use client";

import { MessageCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import {
  RESUME_CHAT_ERROR_MESSAGE,
  useResumeChat,
} from "@/hooks/useResumeChat";

export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const inputId = useId();
  const { messages, question, setQuestion, isSubmitting, sendQuestion } =
    useResumeChat();

  // Protótipos em /prototipo/* têm chat próprio — evita dois widgets
  if (pathname?.startsWith("/prototipo")) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendQuestion();
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {isOpen ? (
        <section
          role="dialog"
          aria-label="Chat com o assistente"
          className="glass flex h-96 w-80 flex-col overflow-hidden rounded-2xl border border-neutral-700/60 shadow-lg shadow-black/40 sm:w-96"
        >
          <header className="flex items-center justify-between border-b border-neutral-700/50 px-4 py-3">
            <h2 className="text-sm font-semibold text-neutral-100">
              Fale comigo
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar chat"
              className="rounded-lg px-2 py-1 text-xs font-medium text-neutral-400 transition-colors duration-200 hover:bg-accent-500/10 hover:text-accent-400"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <ul
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <li className="text-sm text-neutral-400">
                Pergunte algo sobre a minha trajetória profissional.
              </li>
            ) : null}
            {messages.map((message) => (
              <li key={message.id} className="space-y-1">
                <p className="rounded-lg bg-accent-500/15 px-3 py-2 text-sm text-neutral-100">
                  {message.question}
                </p>
                {message.status === "loading" ? (
                  <p className="rounded-lg px-3 py-2 text-sm text-neutral-500 italic">
                    Digitando...
                  </p>
                ) : null}
                {message.status === "done" ? (
                  <p className="rounded-lg border border-neutral-700/50 px-3 py-2 text-sm text-neutral-300">
                    {message.answer}
                  </p>
                ) : null}
                {message.status === "error" ? (
                  <p className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300">
                    {message.answer ?? RESUME_CHAT_ERROR_MESSAGE}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-neutral-700/50 p-3"
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
              className="flex-1 rounded-lg border border-neutral-700/50 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100 outline-none transition-colors duration-200 focus:border-accent-500/50 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isSubmitting || question.trim().length === 0}
              className="rounded-lg bg-gradient-to-r from-accent-400 to-accent-500 px-3 py-2 text-sm font-semibold text-neutral-900 transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
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
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-neutral-900 shadow-lg shadow-accent-500/25 transition-all duration-200 motion-safe:hover:-translate-y-0.5"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </div>
  );
}
