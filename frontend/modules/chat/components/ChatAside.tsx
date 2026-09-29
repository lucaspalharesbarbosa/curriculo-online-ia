"use client";

import { MessageSquare } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useResumeChat } from "@/hooks/useResumeChat";

import { OPEN_ASSIST_CHAT_EVENT, openAssistChat } from "../lib/open-chat";
import { ChatPanel } from "./ChatPanel";

const MOBILE_QUERY = "(max-width: 1023px)";

/**
 * Chat lateral fixo no desktop; no mobile fica escondido e abre em tela cheia
 * pela barra inferior (ou pelo botão do hero, via evento `open-assist-chat`).
 */
export function ChatAside() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const {
    messages,
    question,
    setQuestion,
    isSubmitting,
    sendQuestion,
    sendFeedback,
  } = useResumeChat();

  const close = useCallback(() => {
    setOpen(false);
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  }, []);

  useEffect(() => {
    const onOpen = () => {
      if (document.activeElement instanceof HTMLElement) {
        returnFocusRef.current = document.activeElement;
      }
      setOpen(true);
    };
    window.addEventListener(OPEN_ASSIST_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ASSIST_CHAT_EVENT, onOpen);
  }, []);

  // Ao abrir: foca o campo. No mobile ainda trava a rolagem da página atrás
  // e o Esc fecha a tela cheia.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const isMobile =
      typeof window.matchMedia === "function" &&
      window.matchMedia(MOBILE_QUERY).matches;
    const previousOverflow = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobile) close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <>
      <aside
        aria-label="Assistente de IA"
        className={`flex-col border-l border-border-subtle bg-surface lg:sticky lg:top-14 lg:z-10 lg:flex lg:h-[calc(100dvh-3.5rem)] ${
          open
            ? "max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:flex"
            : "max-lg:hidden"
        }`}
      >
        <ChatPanel
          messages={messages}
          question={question}
          setQuestion={setQuestion}
          isSubmitting={isSubmitting}
          onSend={() => void sendQuestion()}
          onSuggestion={(text) => void sendQuestion(text)}
          onFeedback={sendFeedback}
          onClose={close}
          inputRef={inputRef}
        />
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={openAssistChat}
          className="tap-target flex min-h-12 w-full items-center gap-3 rounded-full border border-accent bg-accent-soft px-4 text-left text-sm text-neutral-100"
        >
          <MessageSquare size={18} className="text-accent" aria-hidden />
          Pergunte sobre a carreira do Lucas
        </button>
      </div>
    </>
  );
}
