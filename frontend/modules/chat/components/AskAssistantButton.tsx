"use client";

import { Sparkles } from "lucide-react";

import { openAssistChat } from "../lib/open-chat";

/** Botão do hero: abre o chat (tela cheia no mobile, foco no campo no desktop). */
export function AskAssistantButton() {
  return (
    <button
      type="button"
      onClick={openAssistChat}
      className="tap-target inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-[0_0_32px_var(--accent-soft)] transition hover:-translate-y-0.5"
    >
      <Sparkles size={16} aria-hidden /> Perguntar ao assistente
    </button>
  );
}
