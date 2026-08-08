"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, MessageSquare, Send } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { RagChatPanel } from "@/components/RagChatPanel";
import {
  RESUME_CHAT_ERROR_MESSAGE,
  useResumeChat,
} from "@/hooks/useResumeChat";

type ProfileAssistChatProps = {
  role: string;
};

/** Assistente R2 no Perfil: pergunta já no bloco; ao rolar vira sticky/dock. */
export function ProfileAssistChat({ role }: ProfileAssistChatProps) {
  const [transformed, setTransformed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputId = useId();
  const reduceMotion = useReducedMotion();
  const { messages, question, setQuestion, isSubmitting, sendQuestion } =
    useResumeChat();

  const shortRole = role.split("|")[0]?.trim() ?? role;

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = !entry.isIntersecting;
        setTransformed(next);
        if (!next) {
          setMinimized(false);
        }
      },
      {
        root: null,
        threshold: 0.2,
        rootMargin: "-72px 0px 0px 0px",
      },
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof list.scrollTo !== "function") return;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendQuestion();
  }

  const chatProps = {
    messages,
    question,
    setQuestion,
    isSubmitting,
    onSend: () => {
      void sendQuestion();
    },
    skin: "soft" as const,
  };

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scaleY: 0.9, y: -10 },
        animate: { opacity: 1, scaleY: 1, y: 0 },
        exit: { opacity: 0, scaleY: 0.94 },
      };

  return (
    <>
      <div ref={anchorRef}>
        {!transformed ? (
          <section
            aria-label="Assistente do currículo"
            className="overflow-hidden rounded-2xl border border-neutral-700/50 bg-surface/90"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent-500/15">
                <Bot className="h-4 w-4 text-accent-300" aria-hidden />
                <span className="absolute right-0.5 bottom-0.5 h-2 w-2 rounded-full bg-accent-400 ring-2 ring-surface" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-accent-300">
                  Assistente
                </p>
                <p className="truncate text-[11px] text-neutral-500">
                  Online · pronto para falar sobre {shortRole}
                </p>
              </div>
            </div>

            <ul
              ref={listRef}
              className="max-h-44 space-y-2.5 overflow-y-auto border-t border-neutral-800/60 px-3 py-3"
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <li className="text-xs leading-relaxed text-neutral-500">
                  Pergunte sobre experiência, stack ou trajetória — a resposta
                  vem do currículo.
                </li>
              ) : null}
              {messages.map((message) => (
                <li key={message.id} className="space-y-1.5">
                  <p className="ml-4 rounded-2xl rounded-tr-md bg-accent-500/15 px-3 py-2 text-xs text-neutral-100">
                    {message.question}
                  </p>
                  {message.status === "loading" ? (
                    <p className="mr-4 rounded-2xl rounded-tl-md px-3 py-2 text-xs text-neutral-500 italic">
                      Buscando no currículo…
                    </p>
                  ) : null}
                  {message.status === "done" ? (
                    <p className="mr-4 rounded-2xl rounded-tl-md border border-neutral-700/50 bg-neutral-900/50 px-3 py-2 text-xs text-neutral-300">
                      {message.answer}
                    </p>
                  ) : null}
                  {message.status === "error" ? (
                    <p className="mr-4 rounded-2xl rounded-tl-md border border-red-900 bg-red-950 px-3 py-2 text-xs text-red-300">
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
                placeholder="O que você quer saber?"
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
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-700/50 px-4 py-4 text-center text-xs text-neutral-500">
            Assistente ativo <span className="hidden xl:inline">à direita</span>
            <span className="xl:hidden">no painel flutuante</span>
            {minimized ? " · minimizado" : null}
          </div>
        )}
      </div>

      <AnimatePresence>
        {transformed && !minimized ? (
          <>
            <motion.div
              key="assist-desktop"
              {...panelMotion}
              className="pointer-events-auto fixed top-24 right-4 z-40 hidden w-[340px] origin-top xl:block"
            >
              <RagChatPanel
                {...chatProps}
                onMinimize={() => setMinimized(true)}
                listClassName="max-h-[50vh] min-h-[12rem]"
              />
            </motion.div>
            <motion.div
              key="assist-mobile"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="pointer-events-auto fixed right-3 bottom-3 left-3 z-40 xl:hidden"
            >
              <RagChatPanel
                {...chatProps}
                onMinimize={() => setMinimized(true)}
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      {transformed && minimized ? (
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-accent-500/20 px-4 py-2.5 text-xs font-semibold text-accent-200 shadow-lg shadow-accent-500/20 backdrop-blur"
        >
          <MessageSquare className="h-4 w-4" />
          Abrir assistente
        </button>
      ) : null}
    </>
  );
}
