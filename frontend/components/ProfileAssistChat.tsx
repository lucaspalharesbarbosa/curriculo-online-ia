"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageSquare, Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { RagChatPanel } from "@/components/RagChatPanel";
import { useResumeChat } from "@/hooks/useResumeChat";

type ProfileAssistChatProps = {
  role: string;
};

const PROBES = [
  "Qual sua stack principal?",
  "Conte sobre liderança técnica",
  "Quais experiências recentes?",
];

/** Assistente no Perfil: console de sinal; ao rolar vira sticky/dock. */
export function ProfileAssistChat({ role }: ProfileAssistChatProps) {
  const [transformed, setTransformed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
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

  const chatProps = {
    messages,
    question,
    setQuestion,
    isSubmitting,
    onSend: () => {
      void sendQuestion();
    },
    onSuggestion: (text: string) => {
      void sendQuestion(text);
    },
    suggestions: PROBES,
    skin: "soft" as const,
    title: "Assistente",
    subtitle: `Online · pronto para falar sobre ${shortRole}`,
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
          <RagChatPanel
            {...chatProps}
            embedded
            listClassName="max-h-52 min-h-[9rem]"
          />
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#16324a] bg-[#03070d] px-4 py-4 text-center font-mono text-[11px] text-neutral-400">
            <Radio className="h-3.5 w-3.5 text-accent-400" aria-hidden />
            Sinal ativo{" "}
            <span className="hidden xl:inline">no painel à direita</span>
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
              className="pointer-events-auto fixed top-24 right-4 z-40 hidden w-[360px] origin-top xl:block"
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
          className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-2xl border border-[#16324a] bg-[#03070d] px-4 py-3 text-xs font-semibold text-accent-200 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
        >
          <span className="assist-signal-dot" aria-hidden />
          <MessageSquare className="h-4 w-4" />
          Abrir assistente
        </button>
      ) : null}
    </>
  );
}
