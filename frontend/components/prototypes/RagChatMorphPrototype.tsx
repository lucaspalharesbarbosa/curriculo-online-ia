"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  MessageCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  RagChatPanel,
  type RagChatSkin,
} from "@/components/prototypes/RagChatPanel";
import { useResumeChat } from "@/hooks/useResumeChat";

type VariantId = "R1" | "R2" | "R3" | "R4";

const SUGGESTIONS = [
  "Qual sua stack principal?",
  "Conte sobre liderança técnica",
  "Quais experiências recentes?",
];

const VARIANTS: {
  id: VariantId;
  title: string;
  subtitle: string;
  hint: string;
  skin: RagChatSkin;
  morphLabel: string;
  reopenLabel: string;
}[] = [
  {
    id: "R1",
    title: "Pergunte ao currículo",
    subtitle: "Teaser → crossfade no sticky",
    hint: "Role: o cartão teaser faz crossfade e o chat RAG gruda à direita (mobile: dock).",
    skin: "assistant",
    morphLabel: "Abrindo o assistente…",
    reopenLabel: "Pergunte ao currículo",
  },
  {
    id: "R2",
    title: "Assistente",
    subtitle: "Pergunta no Perfil → sticky",
    hint: "No Perfil já dá para perguntar; ao rolar, o painel gruda à direita.",
    skin: "soft",
    morphLabel: "Expandindo assistente…",
    reopenLabel: "Abrir assistente",
  },
  {
    id: "R3",
    title: "Fale comigo",
    subtitle: "Bolha → dock inferior / sticky",
    hint: "Role: a bolha desliza para o dock (mobile) ou sticky direito (desktop).",
    skin: "dock",
    morphLabel: "Conectando conversa…",
    reopenLabel: "Fale comigo",
  },
  {
    id: "R4",
    title: "Explore o perfil",
    subtitle: "Chips → bloom do painel",
    hint: "Role: as sugestões se abrem no painel RAG completo (sticky direito).",
    skin: "chips",
    morphLabel: "Abrindo exploração…",
    reopenLabel: "Explorar perfil",
  },
];

function ChatTeaser({
  variant,
  name,
  role,
  morphProgress,
  transformed,
  reduceMotion,
  onSuggestion,
}: {
  variant: VariantId;
  name: string;
  role: string;
  morphProgress: number;
  transformed?: boolean;
  reduceMotion: boolean | null;
  onSuggestion?: (text: string) => void;
}) {
  if (transformed) {
    return null;
  }

  const progressLabel =
    morphProgress > 0.05 ? `${Math.round(morphProgress * 100)}%` : null;

  const fadeOut = reduceMotion ? 1 : Math.max(0.2, 1 - morphProgress * 1.25);
  const scale = reduceMotion ? 1 : 1 - morphProgress * 0.04;

  if (variant === "R1") {
    return (
      <motion.div
        style={{ opacity: fadeOut, scale }}
        className="overflow-hidden rounded-2xl border border-accent-500/30 bg-gradient-to-br from-accent-500/15 via-neutral-950/80 to-neutral-950/90"
      >
        <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-500/20 text-accent-300">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-neutral-50">
                Pergunte ao currículo
              </p>
              {progressLabel ? (
                <span className="rounded-md bg-accent-500/20 px-2 py-0.5 text-[10px] font-semibold text-accent-300">
                  {progressLabel}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
              Assistente do site — responde com base no perfil de {name}.
            </p>
            <p className="mt-3 text-[11px] text-accent-300/90">
              ↓ Role para abrir o chat completo
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "R2") {
    return (
      <motion.div
        style={{ opacity: fadeOut }}
        className="overflow-hidden rounded-2xl border border-neutral-700/50 bg-surface/90"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent-500/15">
            <Bot className="h-4 w-4 text-accent-300" aria-hidden />
            <span className="absolute right-0.5 bottom-0.5 h-2 w-2 rounded-full bg-accent-400 ring-2 ring-surface" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-accent-300">Assistente</p>
            <p className="truncate text-[11px] text-neutral-500">
              Online · pronto para falar sobre {role}
            </p>
          </div>
          {progressLabel ? (
            <span className="text-[10px] font-semibold text-accent-400">
              {progressLabel}
            </span>
          ) : (
            <span className="hidden text-[10px] text-neutral-500 sm:inline">
              role para expandir
            </span>
          )}
        </div>
        <div className="border-t border-neutral-800/60 px-3 py-3">
          <p className="mb-2 text-xs text-neutral-500">
            Pergunte já aqui — ao rolar, o painel gruda à direita.
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSuggestion?.(item)}
                className="rounded-xl border border-neutral-700/60 bg-neutral-900/60 px-3 py-1.5 text-[11px] text-neutral-300 transition-colors hover:border-accent-500/40 hover:text-accent-200"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "R3") {
    return (
      <motion.div
        style={{ opacity: fadeOut, y: reduceMotion ? 0 : morphProgress * 12 }}
        className="relative"
      >
        <div className="mb-2 flex items-center gap-2 text-[11px] text-neutral-500">
          <MessageCircle className="h-3.5 w-3.5 text-accent-400" />
          Fale comigo
          {progressLabel ? (
            <span className="ml-auto text-accent-400">{progressLabel}</span>
          ) : null}
        </div>
        <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-accent-500/25 bg-accent-500/10 px-4 py-3">
          <p className="text-sm leading-relaxed text-neutral-100">
            Oi! Sou o chat do currículo. Pergunte sobre minha trajetória, stack
            ou experiências.
          </p>
          <p className="mt-2 text-[11px] text-accent-300/90">
            ↓ Role e a conversa sobe para o painel
          </p>
        </div>
      </motion.div>
    );
  }

  // R4 — chips
  return (
    <motion.div
      style={{ opacity: fadeOut, scale }}
      className="overflow-hidden rounded-2xl border border-accent-500/25 bg-neutral-950/70"
    >
      <div className="px-4 py-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-400" aria-hidden />
          <p className="text-sm font-semibold text-neutral-50">
            Explore o perfil
          </p>
          {progressLabel ? (
            <span className="rounded-md bg-accent-500/20 px-2 py-0.5 text-[10px] font-semibold text-accent-300">
              {progressLabel}
            </span>
          ) : null}
        </div>
        <p className="mb-3 text-xs text-neutral-400">
          Sugestões rápidas — o painel completo abre ao rolar.
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSuggestion?.(item)}
              className="rounded-xl border border-neutral-700/60 bg-neutral-900/60 px-3 py-1.5 text-[11px] text-neutral-300 transition-colors hover:border-accent-500/40 hover:text-accent-200"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function FakeResumeSections() {
  return (
    <div className="space-y-4">
      {["Experiência", "Educação", "Certificações", "Reconhecimentos"].map(
        (title, index) => (
          <div key={title} className="glass rounded-2xl p-4 sm:p-5">
            <h3 className="mb-2 text-sm font-semibold text-neutral-100">
              {title}
            </h3>
            <div className="space-y-2">
              <div
                className="h-2.5 rounded bg-neutral-800/80"
                style={{ width: `${80 - index * 8}%` }}
              />
              <div
                className="h-2.5 rounded bg-neutral-800/50"
                style={{ width: `${60 - index * 5}%` }}
              />
              <div
                className="h-2.5 rounded bg-neutral-800/40"
                style={{ width: `${66 - index * 4}%` }}
              />
            </div>
          </div>
        ),
      )}
      <div className="glass rounded-2xl p-5">
        <h3 className="mb-2 text-sm font-semibold text-neutral-100">
          Continue rolando
        </h3>
        <p className="text-xs leading-relaxed text-neutral-500">
          O morph dispara quando o teaser do chat sai da área visível. As
          respostas usam o backend real em{" "}
          <code className="text-accent-400">POST /chat</code>.
        </p>
      </div>
    </div>
  );
}

export function RagChatMorphPrototype({
  name,
  role,
}: {
  name: string;
  role: string;
}) {
  const [variant, setVariant] = useState<VariantId>("R1");
  const [morphProgress, setMorphProgress] = useState(0);
  const [transformed, setTransformed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const {
    messages,
    question,
    setQuestion,
    isSubmitting,
    sendQuestion,
    reset: resetChat,
  } = useResumeChat();

  const shortRole = role.split("|")[0]?.trim() ?? role;
  const active = VARIANTS.find((item) => item.id === variant)!;

  const resetDemo = useCallback(() => {
    resetChat();
    setMorphProgress(0);
    setTransformed(false);
    setMinimized(false);
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [resetChat]);

  const selectVariant = useCallback(
    (id: VariantId) => {
      setVariant(id);
      resetDemo();
    },
    [resetDemo],
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    const anchor = anchorRef.current;
    if (!scroller || !anchor) return;

    function onScroll() {
      if (!scroller || !anchor) return;
      const scrollerRect = scroller.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const traveled = scrollerRect.top - anchorRect.top + 20;
      const range = Math.max(anchor.offsetHeight * 0.9, 140);
      const progress = Math.min(1, Math.max(0, traveled / range));
      setMorphProgress(progress);
      setTransformed(progress > 0.7);
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [variant]);

  const chatProps = {
    messages,
    question,
    setQuestion,
    isSubmitting,
    onSend: () => {
      void sendQuestion();
    },
    skin: active.skin,
  };

  async function handleSuggestion(text: string) {
    setQuestion(text);
    await sendQuestion(text);
  }

  const panelMotion =
    variant === "R1"
      ? reduceMotion
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
          }
        : {
            initial: { opacity: 0, x: 28 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 16 },
          }
      : variant === "R2"
        ? reduceMotion
          ? {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
            }
          : {
              initial: { opacity: 0, scaleY: 0.85, y: -12 },
              animate: { opacity: 1, scaleY: 1, y: 0 },
              exit: { opacity: 0, scaleY: 0.9 },
            }
        : variant === "R3"
          ? reduceMotion
            ? {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
              }
            : {
                initial: { opacity: 0, y: 40 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: 24 },
              }
          : reduceMotion
            ? {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
              }
            : {
                initial: { opacity: 0, scale: 0.92 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.96 },
              };

  return (
    <div className="gradient-bg relative min-h-screen overflow-hidden text-neutral-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="orb-drift absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute top-3/4 -right-20 h-80 w-80 rounded-full bg-accent-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col">
        <header className="sticky top-0 z-30 border-b border-neutral-800/70 bg-background/85 px-3 py-3 backdrop-blur-xl sm:px-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700/50 px-2.5 py-1.5 text-xs text-neutral-300 transition-colors hover:border-accent-500/40 hover:text-accent-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Site
              </Link>
              <div>
                <p className="text-sm font-semibold">
                  Protótipo · chat RAG do site
                </p>
                <p className="text-[11px] text-neutral-500">
                  Família B1 (sticky direito) · backend em{" "}
                  <code className="text-accent-400/80">localhost:8000</code>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetDemo}
              className="rounded-lg border border-neutral-700/50 px-2.5 py-1.5 text-[11px] text-neutral-400 hover:border-accent-500/40 hover:text-accent-300"
            >
              Reiniciar
            </button>
          </div>

          <div
            className="grid grid-cols-2 gap-2 lg:grid-cols-4"
            role="tablist"
            aria-label="Variantes do chat RAG"
          >
            {VARIANTS.map((item) => {
              const selected = variant === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => selectVariant(item.id)}
                  className={`rounded-2xl border px-3 py-2.5 text-left transition-all ${
                    selected
                      ? "border-accent-500/50 bg-accent-500/15 shadow-lg shadow-accent-500/10"
                      : "border-neutral-700/50 bg-neutral-900/40 hover:border-accent-500/30"
                  }`}
                >
                  <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        selected
                          ? "bg-accent-500 text-neutral-950"
                          : "bg-neutral-800 text-neutral-300"
                      }`}
                    >
                      {item.id}
                    </span>
                  </div>
                  <p className="text-xs font-semibold sm:text-sm">
                    {item.title}
                  </p>
                  <p className="mt-0.5 hidden text-[10px] text-neutral-400 sm:block">
                    {item.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-neutral-400 lg:hidden">
            {active.hint}
          </p>
        </header>

        <div className="grid flex-1 lg:grid-cols-[200px_1fr]">
          <aside className="hidden border-r border-neutral-800/60 p-4 lg:block">
            <div className="glass space-y-3 rounded-2xl p-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-surface text-xs font-bold text-accent-300">
                  LP
                </div>
              </div>
              <p className="text-center text-xs font-semibold">{name}</p>
              <p className="text-center text-[10px] text-neutral-500">
                {shortRole}
              </p>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-neutral-500">
              {active.hint}
            </p>
            <p className="mt-3 rounded-xl border border-accent-500/20 bg-accent-500/10 px-3 py-2 text-[11px] text-accent-200">
              Chat = RAG real. Sem respostas fake.
            </p>
          </aside>

          <div
            ref={scrollerRef}
            className="h-[calc(100vh-10.5rem)] overflow-y-auto px-3 py-5 sm:px-6"
          >
            <div className="mx-auto max-w-2xl space-y-5 pb-36">
              <section className="glass relative overflow-hidden rounded-3xl p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-400" />
                  <h2 className="text-lg font-bold">Perfil</h2>
                  {transformed ? (
                    <span className="rounded-md bg-accent-500/20 px-2 py-0.5 text-[10px] font-semibold text-accent-300">
                      chat RAG ativo
                    </span>
                  ) : null}
                </div>

                <div ref={anchorRef}>
                  <ChatTeaser
                    variant={variant}
                    name={name}
                    role={shortRole}
                    morphProgress={morphProgress}
                    transformed={transformed}
                    reduceMotion={reduceMotion}
                    onSuggestion={(text) => {
                      void handleSuggestion(text);
                    }}
                  />

                  {transformed ? (
                    <div className="rounded-2xl border border-dashed border-neutral-700/50 px-4 py-5 text-center text-xs text-neutral-500">
                      Origem do morph — o chat RAG está no painel flutuante
                      (direita no desktop, dock no mobile).
                    </div>
                  ) : null}
                </div>

                <p className="mt-5 text-sm leading-relaxed text-neutral-300">
                  Tech Lead e Senior Software Engineer com mais de 10 anos de
                  experiência em soluções escaláveis…
                </p>
                {!transformed ? (
                  <p className="mt-3 text-xs text-accent-400/90">
                    ↓ Role para transformar o teaser no chat RAG ·{" "}
                    {active.morphLabel}
                  </p>
                ) : null}
              </section>

              <FakeResumeSections />
            </div>

            <AnimatePresence>
              {transformed && !minimized ? (
                <>
                  <motion.div
                    key={`${variant}-desktop`}
                    {...panelMotion}
                    className="pointer-events-auto fixed top-36 right-4 z-40 hidden w-[340px] origin-top xl:block"
                  >
                    <RagChatPanel
                      {...chatProps}
                      onMinimize={() => setMinimized(true)}
                      listClassName="max-h-[50vh] min-h-[12rem]"
                      onSuggestion={
                        variant === "R4"
                          ? (text) => {
                              void handleSuggestion(text);
                            }
                          : undefined
                      }
                    />
                  </motion.div>
                  <motion.div
                    key={`${variant}-mobile`}
                    initial={
                      reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    className="pointer-events-auto fixed right-3 bottom-3 left-3 z-40 xl:hidden"
                  >
                    <RagChatPanel
                      {...chatProps}
                      onMinimize={() => setMinimized(true)}
                      onSuggestion={
                        variant === "R4"
                          ? (text) => {
                              void handleSuggestion(text);
                            }
                          : undefined
                      }
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
                {active.reopenLabel}
              </button>
            ) : null}
          </div>
        </div>

        <footer className="border-t border-neutral-800/60 bg-background/70 px-4 py-3 text-[11px] text-neutral-500 backdrop-blur sm:px-6">
          Escolha R1–R4, role para o morph e diga qual linguagem visual prefere.
        </footer>
      </div>
    </div>
  );
}
