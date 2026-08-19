"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageSquare, Radio } from "lucide-react";
import {
  type ComponentProps,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { RagChatPanel } from "@/components/RagChatPanel";
import { useResumeChat } from "@/hooks/useResumeChat";
import { useVisualViewportOffset } from "@/hooks/useVisualViewportOffset";
import { OPEN_ASSIST_CHAT_EVENT } from "@/lib/mobile-nav";

type ProfileAssistChatProps = {
  /** Aceito pelo Perfil; o copy do assistente é fixo (Assistente RAG). */
  role?: string;
};

type ChatPanelSharedProps = Pick<
  ComponentProps<typeof RagChatPanel>,
  | "messages"
  | "question"
  | "setQuestion"
  | "isSubmitting"
  | "onSend"
  | "onFeedback"
  | "onSuggestion"
  | "suggestions"
  | "skin"
  | "title"
  | "subtitle"
  | "emptyHint"
>;

type PanelMotion = Pick<
  ComponentProps<typeof motion.div>,
  "initial" | "animate" | "exit"
>;

const PROBES = [
  "Onde Lucas trabalha hoje?",
  "Quais tecnologias ele usa?",
  "Ele tem experiência como Tech Lead?",
];

const emptySubscribe = () => () => {};

/** Painéis flutuantes (desktop dock + sheet mobile) e os botões de reabrir quando minimizado. */
function AssistFloatingPanels({
  minimized,
  onMinimize,
  onExpand,
  chatProps,
  panelMotion,
  reduceMotion,
  viewportOffset,
}: {
  minimized: boolean;
  onMinimize: () => void;
  onExpand: () => void;
  chatProps: ChatPanelSharedProps;
  panelMotion: PanelMotion;
  reduceMotion: boolean | null;
  viewportOffset: number;
}) {
  return (
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
                onMinimize={onMinimize}
                listClassName="max-h-[50vh] min-h-[12rem]"
              />
            </motion.div>

            <motion.div
              key="assist-mobile-sheet"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ bottom: `calc(${viewportOffset}px + 4.75rem)` }}
              className="pointer-events-auto fixed inset-x-0 z-[200] px-3 xl:hidden"
            >
              <div className="mx-auto max-w-lg overflow-hidden rounded-t-[1.5rem] rounded-b-2xl border border-[#16324a] shadow-[0_-16px_48px_rgba(0,0,0,0.5)]">
                <RagChatPanel
                  {...chatProps}
                  sheet
                  onMinimize={onMinimize}
                  listClassName="max-h-[min(42dvh,20rem)] min-h-[9rem]"
                  className="max-h-[min(72dvh,560px)]"
                />
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      {minimized ? (
        <>
          <button
            type="button"
            onClick={onExpand}
            style={{ bottom: `calc(${viewportOffset}px + 4.75rem)` }}
            className="tap-target fixed right-4 z-[200] inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#16324a] bg-[#03070d] px-4 py-3 text-sm font-semibold text-accent-200 shadow-[0_12px_40px_rgba(0,0,0,0.55)] xl:hidden"
          >
            <span className="assist-signal-dot" aria-hidden />
            <MessageSquare className="h-4 w-4" />
            Abrir Assistente
          </button>
          <button
            type="button"
            onClick={onExpand}
            className="tap-target fixed right-4 bottom-4 z-[200] hidden min-h-12 items-center gap-2 rounded-2xl border border-[#16324a] bg-[#03070d] px-4 py-3 text-sm font-semibold text-accent-200 shadow-[0_12px_40px_rgba(0,0,0,0.55)] xl:inline-flex"
          >
            <span className="assist-signal-dot" aria-hidden />
            <MessageSquare className="h-4 w-4" />
            Abrir Assistente RAG
          </button>
        </>
      ) : null}
    </>
  );
}

/** Assistente no Perfil: console de sinal; ao rolar vira sticky/dock / bottom sheet. */
export function ProfileAssistChat({}: ProfileAssistChatProps) {
  const [transformed, setTransformed] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const portalReady = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const anchorRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const viewportOffset = useVisualViewportOffset();
  const {
    messages,
    question,
    setQuestion,
    isSubmitting,
    sendQuestion,
    sendFeedback,
  } = useResumeChat();

  const docked = transformed || forceOpen;

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = !entry.isIntersecting;
        setTransformed(next);
        if (!next) {
          setForceOpen(false);
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
    const onOpen = () => {
      setForceOpen(true);
      setMinimized(false);
    };
    window.addEventListener(OPEN_ASSIST_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ASSIST_CHAT_EVENT, onOpen);
  }, []);

  const chatProps = {
    messages,
    question,
    setQuestion,
    isSubmitting,
    onSend: () => {
      void sendQuestion();
    },
    onFeedback: sendFeedback,
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
    portalReady && docked ? (
      <AssistFloatingPanels
        minimized={minimized}
        onMinimize={() => setMinimized(true)}
        onExpand={() => setMinimized(false)}
        chatProps={chatProps}
        panelMotion={panelMotion}
        reduceMotion={reduceMotion ?? false}
        viewportOffset={viewportOffset}
      />
    ) : null;

  return (
    <>
      <div ref={anchorRef}>
        {!docked ? (
          <RagChatPanel
            {...chatProps}
            embedded
            listClassName="max-h-52 min-h-[9rem]"
          />
        ) : (
          <div className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-[#16324a] bg-[#03070d] px-4 py-4 text-center font-mono text-xs text-neutral-400">
            <Radio className="h-3.5 w-3.5 text-accent-400" aria-hidden />
            Assistente RAG ativo{" "}
            <span className="hidden xl:inline">no painel à direita</span>
            <span className="xl:hidden">no sheet inferior</span>
            {minimized ? " · minimizado" : null}
          </div>
        )}
      </div>

      {floatingUi ? createPortal(floatingUi, document.body) : null}
    </>
  );
}
