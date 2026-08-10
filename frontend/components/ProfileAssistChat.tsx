"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageSquare, Radio } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { RagChatPanel } from "@/components/RagChatPanel";
import { useResumeChat } from "@/hooks/useResumeChat";

type ProfileAssistChatProps = {
  /** Aceito pelo Perfil; o copy do assistente é fixo (Assistente RAG). */
  role?: string;
};

const PROBES = [
  "Onde Lucas trabalha hoje?",
  "Quais tecnologias ele usa?",
  "Ele tem experiência como Tech Lead?",
];

const emptySubscribe = () => () => {};

/** Assistente no Perfil: console de sinal; ao rolar vira sticky/dock. */
export function ProfileAssistChat({}: ProfileAssistChatProps) {
  const [transformed, setTransformed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const portalReady = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const anchorRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { messages, question, setQuestion, isSubmitting, sendQuestion } =
    useResumeChat();

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
    title: "Assistente RAG",
    subtitle: "Online · baseado no currículo",
    emptyHint:
      "Olá — sou o Assistente RAG. Pergunte sobre a trajetória e eu busco no currículo para responder.",
  };

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scaleY: 0.9, y: -10 },
        animate: { opacity: 1, scaleY: 1, y: 0 },
        exit: { opacity: 0, scaleY: 0.94 },
      };

  const floatingUi =
    portalReady && transformed ? (
      <>
        <AnimatePresence>
          {!minimized ? (
            <>
              <motion.div
                key="assist-desktop"
                {...panelMotion}
                className="pointer-events-auto fixed top-24 right-4 z-[200] hidden w-[360px] origin-top xl:block"
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
                className="pointer-events-auto fixed right-3 bottom-3 left-3 z-[200] xl:hidden"
              >
                <RagChatPanel
                  {...chatProps}
                  onMinimize={() => setMinimized(true)}
                />
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        {minimized ? (
          <button
            type="button"
            onClick={() => setMinimized(false)}
            className="fixed right-4 bottom-4 z-[200] inline-flex items-center gap-2 rounded-2xl border border-[#16324a] bg-[#03070d] px-4 py-3 text-xs font-semibold text-accent-200 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
          >
            <span className="assist-signal-dot" aria-hidden />
            <MessageSquare className="h-4 w-4" />
            Abrir Assistente RAG
          </button>
        ) : null}
      </>
    ) : null;

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
            Assistente RAG ativo{" "}
            <span className="hidden xl:inline">no painel à direita</span>
            <span className="xl:hidden">no painel flutuante</span>
            {minimized ? " · minimizado" : null}
          </div>
        )}
      </div>

      {floatingUi ? createPortal(floatingUi, document.body) : null}
    </>
  );
}
