"use client";

import { Bot, MessageCircle, Minimize2, Send, Sparkles } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  RESUME_CHAT_ERROR_MESSAGE,
  type ResumeChatMessage,
} from "@/hooks/useResumeChat";

export type RagChatSkin = "assistant" | "soft" | "dock" | "chips";

type RagChatPanelProps = {
  messages: ResumeChatMessage[];
  question: string;
  setQuestion: (value: string) => void;
  isSubmitting: boolean;
  onSend: () => void;
  onMinimize?: () => void;
  title?: string;
  subtitle?: string;
  skin?: RagChatSkin;
  className?: string;
  /** Altura mínima da lista de mensagens */
  listClassName?: string;
  emptyHint?: string;
  placeholder?: string;
  suggestions?: string[];
  onSuggestion?: (text: string) => void;
};

const DEFAULT_SUGGESTIONS = [
  "Qual sua stack principal?",
  "Conte sobre liderança técnica",
  "Quais experiências recentes?",
];

const SKIN_DEFAULTS: Record<
  RagChatSkin,
  {
    title: string;
    subtitle: string;
    emptyHint: string;
    placeholder: string;
    icon: ReactNode;
    headerClass: string;
    shellClass: string;
    titleClass: string;
  }
> = {
  assistant: {
    title: "Pergunte ao currículo",
    subtitle: "Assistente com busca no perfil",
    emptyHint:
      "Pergunte sobre experiência, stack ou trajetória — a resposta vem do RAG.",
    placeholder: "Ex.: Quais projetos você liderou?",
    icon: <Sparkles className="h-4 w-4 shrink-0 text-accent-400" aria-hidden />,
    headerClass: "border-b border-accent-500/20 bg-accent-500/10",
    shellClass:
      "border-accent-500/35 bg-neutral-950/95 shadow-xl shadow-accent-500/10",
    titleClass: "text-sm font-semibold text-neutral-100",
  },
  soft: {
    title: "Assistente",
    subtitle: "Conversando sobre o currículo",
    emptyHint: "Pode perguntar em linguagem natural — eu busco no currículo.",
    placeholder: "O que você quer saber?",
    icon: <Bot className="h-4 w-4 shrink-0 text-accent-300" aria-hidden />,
    headerClass: "border-b border-neutral-800/50 bg-surface/80",
    shellClass:
      "border-neutral-700/60 bg-surface/95 shadow-2xl shadow-black/40",
    titleClass: "text-sm font-semibold tracking-tight text-accent-300",
  },
  dock: {
    title: "Fale comigo",
    subtitle: "Chat do site · respostas do perfil",
    emptyHint: "Estou aqui no rodapé — pergunte algo sobre minha trajetória.",
    placeholder: "Escreva sua pergunta…",
    icon: (
      <MessageCircle className="h-4 w-4 shrink-0 text-accent-400" aria-hidden />
    ),
    headerClass: "border-b border-neutral-800/60",
    shellClass:
      "rounded-t-3xl rounded-b-2xl border-accent-500/25 bg-neutral-950/98 shadow-[0_-8px_40px_rgba(0,0,0,0.45)]",
    titleClass: "text-sm font-semibold text-neutral-50",
  },
  chips: {
    title: "Explore o perfil",
    subtitle: "Sugestões + chat RAG",
    emptyHint: "Toque numa sugestão ou digite a sua própria pergunta.",
    placeholder: "Ou digite sua pergunta…",
    icon: <Sparkles className="h-4 w-4 shrink-0 text-accent-400" aria-hidden />,
    headerClass:
      "border-b border-accent-500/15 bg-gradient-to-r from-accent-500/15 to-transparent",
    shellClass:
      "border-accent-500/30 bg-neutral-950/95 shadow-xl shadow-accent-500/15",
    titleClass: "text-sm font-semibold text-neutral-100",
  },
};

/** Painel de chat ligado ao RAG real — skins de assistente/currículo. */
export function RagChatPanel({
  messages,
  question,
  setQuestion,
  isSubmitting,
  onSend,
  onMinimize,
  title,
  subtitle,
  skin = "assistant",
  className = "",
  listClassName = "max-h-56 min-h-[8rem]",
  emptyHint,
  placeholder,
  suggestions,
  onSuggestion,
}: RagChatPanelProps) {
  const inputId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const defaults = SKIN_DEFAULTS[skin];
  const chipSuggestions =
    suggestions ?? (skin === "chips" ? DEFAULT_SUGGESTIONS : []);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof list.scrollTo !== "function") return;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSend();
  }

  return (
    <section
      role="dialog"
      aria-label="Chat com o assistente do currículo"
      className={`flex flex-col overflow-hidden rounded-2xl border backdrop-blur-xl ${defaults.shellClass} ${className}`}
    >
      <header
        className={`flex items-center gap-2.5 px-3 py-2.5 ${defaults.headerClass}`}
      >
        {defaults.icon}
        <div className="min-w-0 flex-1">
          <p className={`truncate ${defaults.titleClass}`}>
            {title ?? defaults.title}
          </p>
          <p className="text-[10px] text-neutral-500">
            {subtitle ?? defaults.subtitle}
          </p>
        </div>
        {onMinimize ? (
          <button
            type="button"
            onClick={onMinimize}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-accent-300"
            aria-label="Minimizar chat"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      <ul
        ref={listRef}
        className={`flex-1 space-y-3 overflow-y-auto px-3 py-3 ${listClassName}`}
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <li className="space-y-3">
            <p className="text-xs leading-relaxed text-neutral-500">
              {emptyHint ?? defaults.emptyHint}
            </p>
            {chipSuggestions.length > 0 && onSuggestion ? (
              <div className="flex flex-wrap gap-2">
                {chipSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onSuggestion(item)}
                    disabled={isSubmitting}
                    className="rounded-xl border border-neutral-700/60 bg-neutral-900/60 px-2.5 py-1.5 text-[11px] text-neutral-300 transition-colors hover:border-accent-500/40 hover:text-accent-200 disabled:opacity-50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </li>
        ) : null}
        {messages.map((message) => (
          <li key={message.id} className="space-y-1.5">
            <p className="ml-6 rounded-2xl rounded-tr-md bg-accent-500/15 px-3 py-2 text-xs text-neutral-100 sm:text-sm">
              {message.question}
            </p>
            {message.status === "loading" ? (
              <p className="mr-6 rounded-2xl rounded-tl-md px-3 py-2 text-xs text-neutral-500 italic sm:text-sm">
                Buscando no currículo…
              </p>
            ) : null}
            {message.status === "done" ? (
              <p className="mr-6 rounded-2xl rounded-tl-md border border-neutral-700/50 bg-neutral-900/50 px-3 py-2 text-xs text-neutral-300 sm:text-sm">
                {message.answer}
              </p>
            ) : null}
            {message.status === "error" ? (
              <p className="mr-6 rounded-2xl rounded-tl-md border border-red-900 bg-red-950 px-3 py-2 text-xs text-red-300 sm:text-sm">
                {RESUME_CHAT_ERROR_MESSAGE}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-neutral-800/70 p-2.5"
      >
        <label htmlFor={inputId} className="sr-only">
          Sua pergunta
        </label>
        <input
          id={inputId}
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={placeholder ?? defaults.placeholder}
          disabled={isSubmitting}
          className="min-w-0 flex-1 rounded-xl border border-neutral-700/50 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-100 outline-none transition-colors focus:border-accent-500/50 disabled:opacity-60 sm:text-sm"
        />
        <button
          type="submit"
          disabled={isSubmitting || question.trim().length === 0}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-accent-400 to-accent-500 text-neutral-900 transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
