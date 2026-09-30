"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import {
  RESUME_CHAT_ERROR_MESSAGE,
  type ResumeChatFeedback,
  type ResumeChatMessage,
} from "@/hooks/useResumeChat";

import { renderMarkdown } from "../lib/markdown";
import { SourceBadge } from "./SourceBadge";
import { ToolChips } from "./ToolChips";

// Cards (e os parsers) só carregam quando uma resposta traz tools com card.
const ToolCards = dynamic(() => import("./ToolCards"), { ssr: false });

const LOADING_STAGES = [
  "Buscando contexto…",
  "Raciocinando…",
  "Interpretando…",
  "Respondendo…",
] as const;

/** Tempo em cada estágio antes de avançar (o último fica até a resposta chegar). */
const LOADING_STAGE_MS = [1600, 1800, 2000] as const;

function LoadingStatus() {
  const [stage, setStage] = useState(0);
  const lastStage = LOADING_STAGES.length - 1;

  useEffect(() => {
    if (stage >= lastStage) return;
    const id = window.setTimeout(
      () => setStage((current) => Math.min(current + 1, lastStage)),
      LOADING_STAGE_MS[stage] ?? 2000,
    );
    return () => window.clearTimeout(id);
  }, [stage, lastStage]);

  return (
    <p
      role="status"
      className="flex items-center gap-2 font-mono text-sm text-accent-400"
    >
      <span className="live-dot h-2 w-2 rounded-full bg-accent" aria-hidden />
      {LOADING_STAGES[stage]}
    </p>
  );
}

function FeedbackButtons({
  message,
  onFeedback,
}: {
  message: ResumeChatMessage;
  onFeedback: (messageId: string, rating: ResumeChatFeedback) => void;
}) {
  const base =
    "tap-target inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors";
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onFeedback(message.id, "up")}
        aria-pressed={message.feedback === "up"}
        aria-label="Resposta útil"
        title="Resposta útil"
        className={`${base} ${
          message.feedback === "up"
            ? "border-accent/60 bg-accent/15 text-accent-400"
            : "border-transparent text-neutral-400 hover:border-border-subtle hover:text-accent-400"
        }`}
      >
        <ThumbsUp size={14} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onFeedback(message.id, "down")}
        aria-pressed={message.feedback === "down"}
        aria-label="Resposta não útil"
        title="Resposta não útil"
        className={`${base} ${
          message.feedback === "down"
            ? "border-red-400/60 bg-red-500/15 text-red-300"
            : "border-transparent text-neutral-400 hover:border-border-subtle hover:text-red-300"
        }`}
      >
        <ThumbsDown size={14} aria-hidden />
      </button>
    </div>
  );
}

type ChatMessageProps = {
  message: ResumeChatMessage;
  onFeedback?: (messageId: string, rating: ResumeChatFeedback) => void;
};

/** Um turno: pergunta do visitante e resposta (chips das tools, texto, selo de fonte, cards, feedback). */
export function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  const tools = message.tools ?? [];

  return (
    <li className="space-y-3">
      <div className="flex justify-end">
        <p className="max-w-[88%] rounded-[14px] rounded-br-sm bg-accent px-3.5 py-2 text-[15px] text-accent-foreground">
          {message.question}
        </p>
      </div>

      {message.status === "loading" ? <LoadingStatus /> : null}

      {message.status === "done" ? (
        <div className="flex min-w-0 flex-col gap-2.5">
          <ToolChips tools={tools} />
          <div
            data-testid="chat-answer"
            className="space-y-2 text-[15px] leading-relaxed text-neutral-100"
          >
            {renderMarkdown(message.answer ?? "")}
          </div>
          {message.source ? (
            <div>
              <SourceBadge source={message.source} />
            </div>
          ) : null}
          {tools.length > 0 ? <ToolCards tools={tools} /> : null}
          {onFeedback ? (
            <FeedbackButtons message={message} onFeedback={onFeedback} />
          ) : null}
        </div>
      ) : null}

      {message.status === "error" ? (
        <p
          role="alert"
          className="rounded-[14px] border border-red-900 bg-red-950 px-3.5 py-2.5 text-sm text-red-200"
        >
          {message.answer ?? RESUME_CHAT_ERROR_MESSAGE}
        </p>
      ) : null}
    </li>
  );
}
