"use client";

import { ArrowUpRight, Send, X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  type FormEvent,
  type RefObject,
} from "react";

import type {
  ResumeChatFeedback,
  ResumeChatMessage,
} from "@/hooks/useResumeChat";

import { ChatMessage } from "./ChatMessage";

/** Perguntas iniciais; as três primeiras acionam tools estruturadas (ADR-018). */
export const INITIAL_SUGGESTIONS = [
  "Quantos anos de Python?",
  "Onde trabalhei antes do Itaú?",
  "Por que este projeto não usa banco vetorial?",
  "Quais tecnologias ele usa?",
  "Onde Lucas trabalha hoje?",
];

/** Atalhos que continuam visíveis depois da primeira pergunta. */
export const FOLLOW_UP_SUGGESTIONS = [
  "Já trabalhou com Kubernetes?",
  "Qual a última empresa?",
  "Quais projetos e artigos ele publicou?",
];

const EXPLAINERS: [string, string][] = [
  ["Consultou o currículo", "busca nos trechos do resume.json"],
  ["Calculou experiência", "meses exatos por tecnologia, sem dupla contagem"],
  ["Fonte: web", "só quando o currículo não basta"],
];

type ChatPanelProps = {
  messages: ResumeChatMessage[];
  question: string;
  setQuestion: (value: string) => void;
  isSubmitting: boolean;
  onSend: () => void;
  onSuggestion: (text: string) => void;
  onFeedback?: (messageId: string, rating: ResumeChatFeedback) => void;
  /** Só no mobile (tela cheia): botão de fechar. */
  onClose?: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
};

export function ChatPanel({
  messages,
  question,
  setQuestion,
  isSubmitting,
  onSend,
  onSuggestion,
  onFeedback,
  onClose,
  inputRef,
}: ChatPanelProps) {
  const inputId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    const list = listRef.current;
    if (!list || messages.length === 0) return;
    list.scrollTop = list.scrollHeight;
  }, [messages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSend();
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
        <span className="live-dot h-2.5 w-2.5 rounded-full bg-ok" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="font-mono text-sm font-semibold">assistente.lucas</h2>
          <p className="text-xs text-muted">
            RAG + tools · baseado no currículo
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar chat"
            className="tap-target flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-raised lg:hidden"
          >
            <X size={20} aria-hidden />
          </button>
        ) : null}
      </div>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-busy={isSubmitting}
        aria-label="Conversa com o assistente"
        className="chat-scroll min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4"
      >
        {isEmpty ? (
          <div className="space-y-5">
            <div>
              <p className="font-display text-xl leading-snug font-semibold">
                Pergunte qualquer coisa sobre a carreira do Lucas.
              </p>
              <p className="mt-1 text-sm text-muted">
                Cada resposta mostra de onde veio o dado.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-muted">
              {EXPLAINERS.map(([label, text]) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="inline-flex shrink-0 items-center rounded-full border border-border-subtle bg-surface-raised px-2.5 py-0.5 font-mono">
                    {label}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <ul
              className="flex flex-wrap gap-2"
              aria-label="Perguntas sugeridas"
            >
              {INITIAL_SUGGESTIONS.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => onSuggestion(item)}
                    className="tap-target inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border-subtle bg-surface-raised px-3.5 py-2 text-left text-[13px] text-neutral-100 transition hover:-translate-y-px hover:border-accent disabled:opacity-50"
                  >
                    {item}
                    <ArrowUpRight
                      size={12}
                      className="shrink-0 text-accent-400"
                      aria-hidden
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className="space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onFeedback={onFeedback}
              />
            ))}
          </ol>
        )}
      </div>

      {!isEmpty ? (
        <ul
          className="chat-scroll flex gap-2 overflow-x-auto px-4 pb-2"
          aria-label="Perguntas sugeridas"
        >
          {FOLLOW_UP_SUGGESTIONS.map((item) => (
            <li key={item} className="shrink-0">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onSuggestion(item)}
                className="tap-target min-h-9 rounded-full border border-border-subtle px-3 py-1.5 text-xs text-muted hover:border-accent hover:text-neutral-100 disabled:opacity-50"
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="border-t border-border-subtle p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center gap-2 rounded-full border border-border-subtle py-1 pr-1 pl-3 focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-soft)]">
          <span className="font-mono text-sm text-accent" aria-hidden>
            &gt;
          </span>
          <label htmlFor={inputId} className="sr-only">
            Pergunte ao assistente sobre a carreira do Lucas
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Pergunte sobre experiência, stack..."
            autoComplete="off"
            className="chat-input min-h-11 min-w-0 flex-1 bg-transparent text-base text-neutral-100 placeholder:text-neutral-500"
          />
          <button
            type="submit"
            disabled={isSubmitting || question.trim().length === 0}
            aria-label="Enviar pergunta"
            className="tap-target flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Send size={17} aria-hidden />
          </button>
        </div>
      </form>
    </>
  );
}
