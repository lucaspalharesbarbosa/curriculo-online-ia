"use client";

import {
  ArrowUpRight,
  ExternalLink,
  Minimize2,
  Sparkles,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type {
  Certification,
  Education,
  Project,
} from "@/content/resume.schema";

type RefinamentoChatLinksPrototypeProps = {
  education: Education | undefined;
  certification: (Certification & { credentialUrl: string }) | undefined;
  project: Project | undefined;
};

function VariantLabel({ letter, name }: { letter: string; name: string }) {
  return (
    <p className="mb-2 flex items-center gap-2 font-mono text-xs text-accent-400">
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-accent-500/40 text-[11px] font-bold">
        {letter}
      </span>
      {name}
    </p>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-700/60 bg-black/20 p-4">
      {children}
    </div>
  );
}

/** Cabeçalho do chat (mobile, ~360px) — variante A, decidida. */
function ChatHeaderVariantA() {
  return (
    <header className="relative flex w-full max-w-[360px] items-center gap-3 rounded-t-2xl border-b border-[var(--assist-line)] bg-[var(--assist-panel)] px-4 py-3.5 pl-5">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0c2233] text-accent-300 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.35)]">
        <Sparkles className="h-4 w-4" aria-hidden />
        <span className="assist-signal-dot absolute -right-0.5 -bottom-0.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold tracking-tight text-neutral-50">
            Assistente RAG
          </p>
          <span className="inline-flex items-center gap-1 rounded-md border border-accent-500/30 bg-accent-500/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-accent-300 uppercase">
            <Terminal className="h-3 w-3" aria-hidden />
            Live
          </span>
        </div>
        <p className="mt-0.5 truncate font-mono text-[11px] leading-snug text-neutral-400">
          Online · baseado no currículo
        </p>
      </div>

      <button
        type="button"
        aria-label="Minimizar chat"
        title="Minimizar"
        className="tap-target relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--assist-line)] bg-[#0c2233] text-accent-200 transition-colors hover:border-accent-500/40 hover:bg-[#0f2a3d] hover:text-accent-100 active:scale-[0.97]"
      >
        <Minimize2 className="h-4 w-4" aria-hidden />
      </button>
    </header>
  );
}

/** Botões de link (CTA) — variantes aplicadas aos 3 casos reais do site. */
function LinkVariantA({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 py-1.5 text-[13px] font-semibold text-accent-300 underline-offset-4 transition-colors hover:text-accent-100 hover:underline"
    >
      {icon}
      {label}
      <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
    </Link>
  );
}

function LinkVariantB({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-accent-500/25 px-2.5 py-1.5 text-xs font-medium text-accent-300 transition-all hover:border-accent-500/50 hover:bg-accent-500/5 hover:text-accent-100"
    >
      {icon}
      {label}
      <ArrowUpRight className="h-3 w-3 opacity-70" aria-hidden />
    </Link>
  );
}

function LinkVariantC({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-700/60 text-neutral-400 transition-colors group-hover:border-accent-500/50 group-hover:text-accent-300">
        {icon}
      </span>
      <span className="text-[13px] font-medium text-neutral-300 transition-colors group-hover:text-accent-200">
        {label}
      </span>
    </Link>
  );
}

/** Só o botão (evolução do B, sem texto) — ícone com tooltip/aria-label. */
function LinkVariantD({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="tap-target inline-flex h-8 w-8 items-center justify-center rounded-lg border border-accent-500/25 text-accent-300 transition-all hover:border-accent-500/50 hover:bg-accent-500/10 hover:text-accent-100"
    >
      {icon}
    </Link>
  );
}

/** Botão (estilo B) + texto bem sutil e pequeno ao lado (evolução do C). */
function LinkVariantE({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent-500/25 text-accent-300 transition-all group-hover:border-accent-500/50 group-hover:bg-accent-500/10 group-hover:text-accent-100">
        {icon}
      </span>
      <span className="text-[11px] font-normal text-neutral-500 transition-colors group-hover:text-neutral-300">
        {label}
      </span>
    </Link>
  );
}

export function RefinamentoChatLinksPrototype({
  education,
  certification,
  project,
}: RefinamentoChatLinksPrototypeProps) {
  const linkCases = [
    education?.websiteUrl
      ? {
          key: "educacao",
          title: "Educação — site da instituição",
          href: education.websiteUrl,
          label: "Visitar site da instituição",
          icon: <ExternalLink className="h-3.5 w-3.5" aria-hidden />,
        }
      : null,
    certification
      ? {
          key: "certificacao",
          title: "Certificações — credencial",
          href: certification.credentialUrl,
          label: "Ver certificado",
          icon: <ExternalLink className="h-3.5 w-3.5" aria-hidden />,
        }
      : null,
    project
      ? {
          key: "projeto",
          title: "Destaques — repositório",
          href: project.repositoryUrl,
          label: "Ver repositório",
          icon: <ExternalLink className="h-3.5 w-3.5" aria-hidden />,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <main className="min-h-screen bg-[#03070d] px-4 py-10 text-neutral-100 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-12">
        <header className="space-y-2">
          <p className="font-mono text-xs tracking-widest text-accent-400 uppercase">
            Protótipo — descartável, robots: noindex
          </p>
          <h1 className="text-2xl font-bold">
            Refinamento — cabeçalho do chat mobile e botões de link
          </h1>
          <p className="text-sm text-neutral-400">
            Compare as opções abaixo e responda com a(s) letra(s) escolhida(s)
            para cada bloco, ou peça ajustes.
          </p>
        </header>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-50">
              1. Cabeçalho do chat (mobile)
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              <span className="text-accent-400">Decidido: variante A.</span>{" "}
              Texto completo do subtítulo, truncado com reticências se não
              couber; botão &ldquo;Minimizar&rdquo; virou quadrado de ícone
              (36px), sem rótulo.
            </p>
          </div>

          <div className="max-w-[360px]">
            <Frame>
              <ChatHeaderVariantA />
            </Frame>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-50">
              2. Botões de link (Educação, Certificações, Destaques)
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Você curtiu mais <span className="text-accent-400">B</span> e{" "}
              <span className="text-accent-400">C</span>. Nova rodada: duas
              variantes a mais na mesma linha — <strong>D</strong> só com o
              botão (sem texto) e <strong>E</strong> com botão + texto bem sutil
              e pequeno ao lado.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <VariantLabel letter="B" name="Chip fantasma" />
              <p className="mb-3 text-xs text-neutral-500">
                Pill menor (32px), só borda sutil — sem gradiente de fundo.
              </p>
              <Frame>
                <div className="flex flex-col gap-3">
                  {linkCases.map((item) => (
                    <LinkVariantB
                      key={item.key}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                    />
                  ))}
                </div>
              </Frame>
            </div>

            <div>
              <VariantLabel letter="C" name="Ícone + texto separados" />
              <p className="mb-3 text-xs text-neutral-500">
                Círculo de ícone (28px) discreto ao lado do texto solto.
              </p>
              <Frame>
                <div className="flex flex-col gap-3">
                  {linkCases.map((item) => (
                    <LinkVariantC
                      key={item.key}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                    />
                  ))}
                </div>
              </Frame>
            </div>

            <div>
              <VariantLabel letter="D" name="Só o botão" />
              <p className="mb-3 text-xs text-neutral-500">
                Sem texto nenhum — só o ícone (32px, estilo do B), com
                tooltip/aria-label. O mais discreto de todos.
              </p>
              <Frame>
                <div className="flex flex-col gap-3">
                  {linkCases.map((item) => (
                    <LinkVariantD
                      key={item.key}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                    />
                  ))}
                </div>
              </Frame>
            </div>

            <div>
              <VariantLabel letter="E" name="Botão + texto sutil" />
              <p className="mb-3 text-xs text-neutral-500">
                Botão quadrado (estilo B) + texto pequeno (11px) e apagado ao
                lado — só ganha cor no hover.
              </p>
              <Frame>
                <div className="flex flex-col gap-3">
                  {linkCases.map((item) => (
                    <LinkVariantE
                      key={item.key}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                    />
                  ))}
                </div>
              </Frame>
            </div>
          </div>

          <div className="space-y-1 text-xs text-neutral-500">
            {linkCases.map((item) => (
              <p key={item.key}>
                <span className="text-neutral-400">{item.title}:</span>{" "}
                {item.label}
              </p>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
