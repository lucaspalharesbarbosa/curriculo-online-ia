"use client";

import {
  ArrowUpRight,
  Bot,
  Globe,
  MessageCircle,
  Minimize2,
  Send,
  Sparkles,
  Terminal,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  RESUME_CHAT_ERROR_MESSAGE,
  type ResumeChatFeedback,
  type ResumeChatMessage,
} from "@/hooks/useResumeChat";

export type RagChatSkin = "assistant" | "soft" | "dock" | "chips";

type RagChatPanelProps = {
  messages: ResumeChatMessage[];
  question: string;
  setQuestion: (value: string) => void;
  isSubmitting: boolean;
  onSend: () => void;
  /** US-11-04: ausente = sem UI de feedback (ex.: telas que ainda não precisam). */
  onFeedback?: (messageId: string, rating: ResumeChatFeedback) => void;
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
  /** Inline no Perfil — region em vez de dialog */
  embedded?: boolean;
  /** Bottom sheet mobile — cantos retos no clip, targets maiores */
  sheet?: boolean;
};

const DEFAULT_SUGGESTIONS = [
  "Onde Lucas trabalha hoje?",
  "Quais tecnologias ele usa?",
  "Ele tem experiência como Tech Lead?",
];

const RAG_LOADING_STAGES = [
  "Buscando contexto…",
  "Raciocinando…",
  "Interpretando…",
  "Respondendo…",
] as const;

/** Tempo em cada estágio antes de avançar (último fica até a resposta chegar). */
const RAG_LOADING_STAGE_MS = [1600, 1800, 2000] as const;

const SKIN_DEFAULTS: Record<
  RagChatSkin,
  {
    title: string;
    subtitle: string;
    emptyHint: string;
    placeholder: string;
    icon: ReactNode;
  }
> = {
  assistant: {
    title: "Assistente RAG",
    subtitle: "Online · baseado no currículo",
    emptyHint:
      "Olá — sou o Assistente RAG. Pergunte sobre a trajetória e eu busco no currículo para responder.",
    placeholder: "Ex.: Quais projetos Lucas liderou?",
    icon: <Sparkles className="h-4 w-4" aria-hidden />,
  },
  soft: {
    title: "Assistente RAG",
    subtitle: "Online · baseado no currículo",
    emptyHint:
      "Olá — sou o Assistente RAG. Pergunte sobre a trajetória e eu busco no currículo para responder.",
    placeholder: "Digite sua pergunta…",
    icon: <Bot className="h-4 w-4" aria-hidden />,
  },
  dock: {
    title: "Assistente RAG",
    subtitle: "Online · baseado no currículo",
    emptyHint: "Estou aqui — pergunte algo sobre a trajetória profissional.",
    placeholder: "Escreva sua pergunta…",
    icon: <MessageCircle className="h-4 w-4" aria-hidden />,
  },
  chips: {
    title: "Assistente RAG",
    subtitle: "Sugestões + busca no currículo",
    emptyHint: "Toque numa sugestão ou digite a sua própria pergunta.",
    placeholder: "Ou digite sua pergunta…",
    icon: <Sparkles className="h-4 w-4" aria-hidden />,
  },
};

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-accent-400"
          style={{
            animation: "assist-signal-ping 1.2s ease-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </span>
  );
}

function RagLoadingStatus() {
  const [stageIndex, setStageIndex] = useState(0);
  const lastIndex = RAG_LOADING_STAGES.length - 1;

  useEffect(() => {
    if (stageIndex >= lastIndex) {
      return;
    }

    const delay = RAG_LOADING_STAGE_MS[stageIndex] ?? 2000;
    const id = window.setTimeout(() => {
      setStageIndex((current) => Math.min(current + 1, lastIndex));
    }, delay);

    return () => window.clearTimeout(id);
  }, [stageIndex, lastIndex]);

  return (
    <p className="font-mono text-xs text-accent-300/90 sm:text-sm">
      {RAG_LOADING_STAGES[stageIndex]}
    </p>
  );
}

/** Painel de chat ligado ao RAG — console de sinal opaco (Deep Ice). */
export function RagChatPanel({
  messages,
  question,
  setQuestion,
  isSubmitting,
  onSend,
  onFeedback,
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
  embedded = false,
  sheet = false,
}: RagChatPanelProps) {
  const inputId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const defaults = SKIN_DEFAULTS[skin];
  const chipSuggestions =
    suggestions ??
    (skin === "chips" || skin === "soft" || onSuggestion
      ? DEFAULT_SUGGESTIONS
      : []);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof list.scrollTo !== "function") return;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSend();
  }

  const resolvedTitle = title ?? defaults.title;
  const resolvedSubtitle = subtitle ?? defaults.subtitle;
  const shellProps = embedded
    ? ({
        role: "region" as const,
        "aria-label": "Assistente RAG",
      } as const)
    : ({
        role: "dialog" as const,
        "aria-label": "Assistente RAG",
      } as const);

  return (
    <section
      {...shellProps}
      className={`assist-console flex flex-col ${sheet ? "assist-console--sheet" : ""} ${className}`}
    >
      <div className="assist-console-rail" aria-hidden />
      <div className="assist-scanline" aria-hidden />

      <header className="relative z-[2] flex items-center gap-3 border-b border-[var(--assist-line)] bg-[var(--assist-panel)] px-4 py-3.5 pl-5">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0c2233] text-accent-300 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.35)]">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent-400/30 to-transparent opacity-70" />
          <span className="relative">{defaults.icon}</span>
          <span className="assist-signal-dot absolute -right-0.5 -bottom-0.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold tracking-tight text-neutral-50">
              {resolvedTitle}
            </p>
            <span className="inline-flex items-center gap-1 rounded-md border border-accent-500/30 bg-accent-500/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-accent-300 uppercase">
              <Terminal className="h-3 w-3" aria-hidden />
              Live
            </span>
          </div>
          <p className="mt-0.5 truncate font-mono text-xs leading-snug text-neutral-400">
            {resolvedSubtitle}
          </p>
        </div>

        {onMinimize ? (
          <button
            type="button"
            onClick={onMinimize}
            className="tap-target relative z-[3] mr-6 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--assist-line)] bg-[#0c2233] text-accent-200 transition-colors hover:border-accent-500/40 hover:bg-[#0f2a3d] hover:text-accent-100 active:scale-[0.97] active:bg-[#123247] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 sm:mr-7"
            aria-label="Minimizar chat"
            title="Minimizar"
          >
            <Minimize2 className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </header>

      <ul
        ref={listRef}
        className={`relative z-[2] flex-1 space-y-3 overflow-y-auto bg-[var(--assist-ink)] px-4 py-4 pl-5 ${listClassName}`}
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <li className="space-y-4">
            <div className="rounded-2xl border border-dashed border-[var(--assist-line)] bg-[var(--assist-panel)] px-3.5 py-3">
              <p className="text-sm leading-relaxed text-neutral-300">
                {emptyHint ?? defaults.emptyHint}
              </p>
            </div>
            {chipSuggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {chipSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (onSuggestion) {
                        onSuggestion(item);
                        return;
                      }
                      setQuestion(item);
                    }}
                    className="assist-probe inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--assist-line)] bg-[var(--assist-rail)] px-3 py-2.5 text-xs text-neutral-200 active:border-accent-500/45 active:bg-[#0c2233] active:text-accent-200 hover:border-accent-500/45 hover:bg-[#0c2233] hover:text-accent-200 disabled:opacity-50"
                  >
                    <span className="font-mono text-accent-400">/</span>
                    {item}
                    <ArrowUpRight className="h-3 w-3 text-accent-400/80" />
                  </button>
                ))}
              </div>
            ) : null}
          </li>
        ) : null}

        {messages.map((message) => (
          <li key={message.id} className="space-y-2">
            <div className="flex justify-end">
              <p className="max-w-[92%] rounded-2xl rounded-br-md bg-gradient-to-br from-accent-500 to-accent-600 px-3.5 py-2.5 text-xs leading-relaxed font-medium text-neutral-950 shadow-[0_8px_24px_rgba(2,132,199,0.35)] sm:text-sm">
                {message.question}
              </p>
            </div>

            {message.status === "loading" ? (
              <div className="mr-6 flex max-w-[94%] items-start gap-2 rounded-2xl rounded-bl-md border border-[var(--assist-line)] bg-[var(--assist-panel)] px-3.5 py-2.5">
                <TypingDots />
                <RagLoadingStatus />
              </div>
            ) : null}

            {message.status === "done" ? (
              <div className="mr-4 max-w-[94%] rounded-2xl rounded-bl-md border border-[var(--assist-line)] border-l-[3px] border-l-accent-400 bg-[var(--assist-panel)] px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(125,211,252,0.06)]">
                <p className="text-xs leading-relaxed text-neutral-100 sm:text-sm">
                  {message.answer}
                </p>
                {message.source === "web" ? (
                  <p className="mt-2 flex items-center gap-1 font-mono text-[11px] text-neutral-400">
                    <Globe className="h-3 w-3 text-accent-400" aria-hidden />
                    Informação pública da web, não do currículo
                  </p>
                ) : null}
                {onFeedback ? (
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onFeedback(message.id, "up")}
                      aria-pressed={message.feedback === "up"}
                      aria-label="Resposta útil"
                      title="Resposta útil"
                      className={`tap-target inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                        message.feedback === "up"
                          ? "border-accent-500/60 bg-accent-500/15 text-accent-300"
                          : "border-transparent text-neutral-500 hover:border-[var(--assist-line)] hover:text-accent-300"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => onFeedback(message.id, "down")}
                      aria-pressed={message.feedback === "down"}
                      aria-label="Resposta não útil"
                      title="Resposta não útil"
                      className={`tap-target inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                        message.feedback === "down"
                          ? "border-red-500/60 bg-red-500/15 text-red-300"
                          : "border-transparent text-neutral-500 hover:border-[var(--assist-line)] hover:text-red-300"
                      }`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {message.status === "error" ? (
              <p className="mr-4 max-w-[94%] rounded-2xl rounded-bl-md border border-red-900 bg-red-950 px-3.5 py-2.5 text-xs text-red-300 sm:text-sm">
                {message.answer ?? RESUME_CHAT_ERROR_MESSAGE}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="relative z-[2] flex items-center gap-2 border-t border-[var(--assist-line)] bg-[var(--assist-panel)] p-3 pl-5"
      >
        <span
          className="hidden font-mono text-sm text-accent-400 sm:inline"
          aria-hidden
        >
          ›
        </span>
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
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--assist-line)] bg-[var(--assist-ink)] px-3 py-2.5 text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-500 focus:border-accent-500/50 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.12)] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSubmitting || question.trim().length === 0}
          className="tap-target flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-300 via-accent-500 to-accent-600 text-neutral-950 shadow-[0_10px_28px_rgba(56,189,248,0.35)] transition-[transform,opacity] hover:scale-[1.03] hover:opacity-95 active:scale-[0.97] disabled:scale-100 disabled:opacity-35"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
