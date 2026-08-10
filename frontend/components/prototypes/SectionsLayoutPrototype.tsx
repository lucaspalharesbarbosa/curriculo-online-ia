"use client";

import {
  ArrowUpRight,
  Award,
  BookMarked,
  ExternalLink,
  Link2,
  Medal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type SectionsLayoutPrototypeProps = {
  education: {
    institution: string;
    degree: string;
    logoUrl: string | null;
    startDate: string;
    endDate: string;
    websiteUrl: string | null;
  }[];
  certifications: {
    name: string;
    issuer: string;
    logoUrl: string | null;
    issuedAt: string;
    expiresAt: string | null;
    credentialUrl: string | null;
  }[];
};

const SAMPLE_HIGHLIGHTS = {
  default: "Liderança técnica da squad e entrega contínua em produção",
  prad: 'Reconhecido por Alto Desempenho (2023 e 2024): classificação "Destaca-se em relação ao grupo", PRAD',
  merit:
    "Reconhecimento de Mérito (2024): concedido individualmente pela liderança",
};

function VariantCard({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a101a] shadow-lg shadow-black/30">
      <header className="border-b border-white/5 bg-[#0d1520] px-4 py-3">
        <p className="text-xs font-bold tracking-wider text-accent-400 uppercase">
          Variante {id}
        </p>
        <h3 className="mt-0.5 text-sm font-semibold text-neutral-50">
          {title}
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
          {description}
        </p>
      </header>
      <div className="bg-[#070b12] p-4">{children}</div>
    </article>
  );
}

function SectionBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-50">{title}</h2>
        <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

/** Produção atual (US-07-12 variante B) — anel grande demais para o feedback. */
function CurrentProductionMarker() {
  return <span className="highlight-ring-dot" aria-hidden />;
}

/** P — só a bolinha pisca suavemente (opacity), sem anel. */
function WhisperDot() {
  return (
    <span
      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400 motion-reduce:animate-none"
      style={{ animation: "proto-whisper 2.8s ease-in-out infinite" }}
      aria-hidden
    />
  );
}

/** Q — brilho externo mínimo (glow), escala quase imperceptível. */
function SoftGlowDot() {
  return (
    <span
      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400 motion-reduce:animate-none"
      style={{ animation: "proto-glow 3.2s ease-in-out infinite" }}
      aria-hidden
    />
  );
}

/** R — micro-anel (cresce pouco, opacidade baixa). */
function MicroRingDot() {
  return (
    <span className="relative mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center">
      <span
        className="absolute inset-0 rounded-full border border-accent-400/40 motion-reduce:animate-none"
        style={{ animation: "proto-micro-ring 2.8s ease-in-out infinite" }}
      />
      <span className="relative h-1.5 w-1.5 rounded-full bg-accent-400" />
    </span>
  );
}

/** S — caret terminal `•` com pulse lento (estilo console). */
function TerminalPulseDot() {
  return (
    <span
      className="mt-1 font-mono text-[10px] leading-none text-accent-400 motion-reduce:animate-none"
      style={{ animation: "proto-whisper 2.4s steps(2, end) infinite" }}
      aria-hidden
    >
      ●
    </span>
  );
}

/** T — bolinha estática + label accent (sem motion); contraste só tipográfico. */
function StaticAccentDot() {
  return (
    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400 shadow-[0_0_6px_rgba(56,189,248,0.35)]" />
  );
}

function HighlightRow({
  featured,
  label,
  text,
  marker,
}: {
  featured?: boolean;
  label?: string;
  text: string;
  marker: ReactNode;
}) {
  return (
    <li
      className={`flex items-start gap-2.5 text-sm ${featured ? "text-neutral-300" : "text-neutral-400"}`}
    >
      {marker}
      <span>
        {label ? (
          <span className="mb-0.5 block text-[10px] font-semibold tracking-wider text-accent-400/90 uppercase">
            {label}
          </span>
        ) : null}
        {text}
      </span>
    </li>
  );
}

function EducationDemo({
  item,
  link,
}: {
  item: SectionsLayoutPrototypeProps["education"][0];
  link: ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-[#0d1520] p-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-700/50 bg-white p-1.5">
        {item.logoUrl ? (
          <Image
            src={item.logoUrl}
            alt=""
            width={48}
            height={48}
            className="h-full w-full object-contain"
          />
        ) : (
          <BookMarked className="h-5 w-5 text-accent-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">{link}</div>
        <p className="mt-1 text-xs font-medium text-accent-400">
          {item.degree}
        </p>
        <p className="mt-1 text-[11px] text-neutral-500">
          {item.startDate} – {item.endDate}
        </p>
      </div>
    </div>
  );
}

function yearOf(iso: string) {
  return iso.slice(0, 4);
}

export function SectionsLayoutPrototype({
  education,
  certifications,
}: SectionsLayoutPrototypeProps) {
  const eduSample = education[0] ?? {
    institution: "Instituição",
    degree: "Curso",
    logoUrl: null,
    startDate: "2020",
    endDate: "2022",
    websiteUrl: "https://example.com",
  };

  const certSample = certifications.slice(0, 4);
  const byIssuer = certSample.reduce<Record<string, typeof certifications>>(
    (acc, cert) => {
      (acc[cert.issuer] ??= []).push(cert);
      return acc;
    },
    {},
  );

  return (
    <div className="min-h-screen bg-[#04080e] text-neutral-100">
      <div className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6">
        <style>{`
          @keyframes proto-whisper {
            0%, 100% { opacity: 0.45; }
            50% { opacity: 1; }
          }
          @keyframes proto-glow {
            0%, 100% {
              opacity: 0.7;
              box-shadow: 0 0 0 0 rgba(56, 189, 248, 0);
            }
            50% {
              opacity: 1;
              box-shadow: 0 0 8px 1px rgba(56, 189, 248, 0.35);
            }
          }
          @keyframes proto-micro-ring {
            0%, 100% { transform: scale(1); opacity: 0.55; }
            50% { transform: scale(1.35); opacity: 0.15; }
          }
          @media (prefers-reduced-motion: reduce) {
            [style*="proto-whisper"],
            [style*="proto-glow"],
            [style*="proto-micro-ring"] {
              animation: none !important;
            }
          }
        `}</style>

        <header className="space-y-3 border-b border-white/10 pb-8">
          <p className="text-xs font-semibold tracking-wider text-accent-400 uppercase">
            US-07-13 · Rodada 2 — marcadores subtler
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Protótipos — PRAD / Mérito (pulse sutil)
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-400">
            A variante B (anel respirando) ficou chamativa demais. Compare as
            opções abaixo e responda só a letra do marcador (ex.:{" "}
            <span className="text-neutral-200">“Marcador Q”</span>
            ). Educação, Certificações, Destaques, Hero e Chat seguem com a
            direção que você já deu — sem grade extra nesta rodada.
          </p>
          <p className="text-xs text-neutral-500">
            Rota só de protótipo ·{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5">
              /prototipo/secoes-layout
            </code>
          </p>
        </header>

        {/* ——— EXPERIÊNCIA ——— */}
        <SectionBlock
          title="1. Destaques PRAD / Mérito — pulse sutil"
          subtitle="Lista limpa (sem caixa). Só a bolinha dos itens featured anima — elegante e discreta."
        >
          <VariantCard
            id="atual"
            title="Produção agora (B)"
            description="Anel expandindo + glow — o que está na home e você achou destacado demais."
          >
            <ul className="space-y-2.5">
              <HighlightRow
                text={SAMPLE_HIGHLIGHTS.default}
                marker={
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                }
              />
              <HighlightRow
                featured
                label="Alto desempenho"
                text={SAMPLE_HIGHLIGHTS.prad}
                marker={<CurrentProductionMarker />}
              />
              <HighlightRow
                featured
                label="Mérito"
                text={SAMPLE_HIGHLIGHTS.merit}
                marker={<CurrentProductionMarker />}
              />
            </ul>
          </VariantCard>

          <VariantCard
            id="P"
            title="Whisper (opacity)"
            description="Bolinha pequena que só altera opacidade — sem anel, sem ping. Mais discreto."
          >
            <ul className="space-y-2.5">
              <HighlightRow
                text={SAMPLE_HIGHLIGHTS.default}
                marker={
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                }
              />
              <HighlightRow
                featured
                label="Alto desempenho"
                text={SAMPLE_HIGHLIGHTS.prad}
                marker={<WhisperDot />}
              />
              <HighlightRow
                featured
                label="Mérito"
                text={SAMPLE_HIGHLIGHTS.merit}
                marker={<WhisperDot />}
              />
            </ul>
          </VariantCard>

          <VariantCard
            id="Q"
            title="Soft glow"
            description="Glow mínimo ao redor da bolinha (respira). Sem anel crescer."
          >
            <ul className="space-y-2.5">
              <HighlightRow
                text={SAMPLE_HIGHLIGHTS.default}
                marker={
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                }
              />
              <HighlightRow
                featured
                label="Alto desempenho"
                text={SAMPLE_HIGHLIGHTS.prad}
                marker={<SoftGlowDot />}
              />
              <HighlightRow
                featured
                label="Mérito"
                text={SAMPLE_HIGHLIGHTS.merit}
                marker={<SoftGlowDot />}
              />
            </ul>
          </VariantCard>

          <VariantCard
            id="R"
            title="Micro-anel"
            description="Anel bem contido (scale ~1.35, opacidade baixa) — versão contida do B."
          >
            <ul className="space-y-2.5">
              <HighlightRow
                text={SAMPLE_HIGHLIGHTS.default}
                marker={
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                }
              />
              <HighlightRow
                featured
                label="Alto desempenho"
                text={SAMPLE_HIGHLIGHTS.prad}
                marker={<MicroRingDot />}
              />
              <HighlightRow
                featured
                label="Mérito"
                text={SAMPLE_HIGHLIGHTS.merit}
                marker={<MicroRingDot />}
              />
            </ul>
          </VariantCard>

          <VariantCard
            id="S"
            title="Pulse terminal"
            description="Marcador ● estilo console, piscando em steps — combina com o vibe AI/terminal."
          >
            <ul className="space-y-2.5">
              <HighlightRow
                text={SAMPLE_HIGHLIGHTS.default}
                marker={
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                }
              />
              <HighlightRow
                featured
                label="Alto desempenho"
                text={SAMPLE_HIGHLIGHTS.prad}
                marker={<TerminalPulseDot />}
              />
              <HighlightRow
                featured
                label="Mérito"
                text={SAMPLE_HIGHLIGHTS.merit}
                marker={<TerminalPulseDot />}
              />
            </ul>
          </VariantCard>

          <VariantCard
            id="T"
            title="Estático + accent"
            description="Sem animação: bolinha accent com glow fixo + label. Zero movimento."
          >
            <ul className="space-y-2.5">
              <HighlightRow
                text={SAMPLE_HIGHLIGHTS.default}
                marker={
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                }
              />
              <HighlightRow
                featured
                label="Alto desempenho"
                text={SAMPLE_HIGHLIGHTS.prad}
                marker={<StaticAccentDot />}
              />
              <HighlightRow
                featured
                label="Mérito"
                text={SAMPLE_HIGHLIGHTS.merit}
                marker={<StaticAccentDot />}
              />
            </ul>
          </VariantCard>
        </SectionBlock>

        {/* ——— EDUCAÇÃO ——— */}
        <SectionBlock
          title="2. Link do site (Educação)"
          subtitle="Hoje: ícone Globe minúsculo ao lado do nome. Objetivo: óbvio que abre o site."
        >
          <VariantCard
            id="E"
            title="Botão 'Site' com seta"
            description="Hit-area maior, rótulo explícito + ArrowUpRight."
          >
            <EducationDemo
              item={eduSample}
              link={
                <>
                  <h3 className="text-sm font-bold text-neutral-100">
                    {eduSample.institution}
                  </h3>
                  {eduSample.websiteUrl ? (
                    <Link
                      href={eduSample.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-accent-500/35 bg-accent-500/10 px-2 py-1 text-[11px] font-semibold text-accent-300 transition-colors hover:bg-accent-500/20"
                    >
                      Site
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </>
              }
            />
          </VariantCard>

          <VariantCard
            id="F"
            title="Nome como link + ícone"
            description="Instituição vira link sublinhado sutil; ExternalLink ao lado (maior)."
          >
            <EducationDemo
              item={eduSample}
              link={
                eduSample.websiteUrl ? (
                  <Link
                    href={eduSample.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm font-bold text-neutral-100 underline decoration-accent-500/40 underline-offset-4 transition-colors hover:text-accent-300 hover:decoration-accent-400"
                  >
                    {eduSample.institution}
                    <ExternalLink className="h-4 w-4 shrink-0 text-accent-400 group-hover:text-accent-300" />
                  </Link>
                ) : (
                  <h3 className="text-sm font-bold text-neutral-100">
                    {eduSample.institution}
                  </h3>
                )
              }
            />
          </VariantCard>

          <VariantCard
            id="G"
            title="Pill 'Visitar site'"
            description="Pill com Link2 — leitura imediata, bom em mobile."
          >
            <EducationDemo
              item={eduSample}
              link={
                <div className="w-full space-y-2">
                  <h3 className="text-sm font-bold text-neutral-100">
                    {eduSample.institution}
                  </h3>
                  {eduSample.websiteUrl ? (
                    <Link
                      href={eduSample.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#121a27] px-3 py-1.5 text-[11px] font-medium text-accent-300 transition-colors hover:border-accent-500/40 hover:text-accent-200"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Visitar site da instituição
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              }
            />
          </VariantCard>
        </SectionBlock>

        {/* ——— CERTIFICAÇÕES ——— */}
        <SectionBlock
          title="3. Certificações"
          subtitle="Objetivo: selos, hierarquia clara e informações bem divididas."
        >
          <VariantCard
            id="H"
            title="Selo à esquerda + grade"
            description="Cada certificado como linha com selo circular do emissor, nome, ano e link."
          >
            <ul className="space-y-3">
              {certSample.map((cert) => (
                <li
                  key={`${cert.name}-${cert.issuedAt}`}
                  className="flex gap-3 rounded-xl border border-white/10 bg-[#0d1520] p-3"
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-accent-500/15 blur-sm" />
                    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-accent-500/35 bg-white p-1.5 shadow-inner">
                      {cert.logoUrl ? (
                        <Image
                          src={cert.logoUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Medal className="h-5 w-5 text-accent-500" />
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-neutral-100">
                        {cert.name}
                      </p>
                      <span className="shrink-0 font-mono text-[11px] text-accent-400">
                        {yearOf(cert.issuedAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      {cert.issuer}
                      {cert.expiresAt
                        ? ` · válido até ${yearOf(cert.expiresAt)}`
                        : ""}
                    </p>
                    {cert.credentialUrl ? (
                      <Link
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-accent-300 hover:text-accent-200"
                      >
                        Ver credencial
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </VariantCard>

          <VariantCard
            id="I"
            title="Card por emissor + selo grande"
            description="Agrupa por instituição: selo + contagem no header; lista limpa abaixo."
          >
            <div className="space-y-4">
              {Object.entries(byIssuer).map(([issuer, items]) => {
                const logo = items[0]?.logoUrl;
                return (
                  <div
                    key={issuer}
                    className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1520]"
                  >
                    <div className="flex items-center gap-3 border-b border-white/5 bg-[#121a27] px-3 py-3">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-accent-500/30 bg-white p-2 shadow-[0_0_0_4px_rgba(56,189,248,0.08)]">
                        {logo ? (
                          <Image
                            src={logo}
                            alt=""
                            width={48}
                            height={48}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Award className="h-6 w-6 text-accent-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-50">
                          {issuer}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {items.length}{" "}
                          {items.length === 1 ? "certificado" : "certificados"}
                        </p>
                      </div>
                    </div>
                    <ul className="divide-y divide-white/5">
                      {items.map((cert) => (
                        <li
                          key={`${cert.name}-${cert.issuedAt}`}
                          className="flex items-start justify-between gap-3 px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-neutral-200">
                              {cert.name}
                            </p>
                            <p className="mt-0.5 text-[10px] text-neutral-500">
                              Emitido {yearOf(cert.issuedAt)}
                              {cert.expiresAt
                                ? ` · até ${yearOf(cert.expiresAt)}`
                                : ""}
                            </p>
                            {cert.credentialUrl ? (
                              <Link
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-[11px] text-accent-300"
                              >
                                Credencial
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ) : null}
                          </div>
                          <span className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">
                            {yearOf(cert.issuedAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </VariantCard>

          <VariantCard
            id="J"
            title="Grade de selos (badge wall)"
            description="Ênfase visual nos selos; nome e ano abaixo — bom para scan rápido."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {certSample.map((cert) => (
                <div
                  key={`${cert.name}-${cert.issuedAt}`}
                  className="flex flex-col items-center rounded-xl border border-white/10 bg-[#0d1520] px-2 py-4 text-center"
                >
                  <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-accent-500/40 bg-white p-2 shadow-[0_0_24px_rgba(56,189,248,0.12)]">
                    {cert.logoUrl ? (
                      <Image
                        src={cert.logoUrl}
                        alt=""
                        width={56}
                        height={56}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Medal className="h-7 w-7 text-accent-500" />
                    )}
                  </div>
                  <p className="line-clamp-2 text-[11px] leading-snug font-medium text-neutral-100">
                    {cert.name}
                  </p>
                  <p className="mt-1 text-[10px] text-neutral-500">
                    {cert.issuer} · {yearOf(cert.issuedAt)}
                  </p>
                  {cert.credentialUrl ? (
                    <Link
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-[10px] font-semibold text-accent-300"
                    >
                      Ver →
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </VariantCard>
        </SectionBlock>

        <footer className="rounded-2xl border border-accent-500/20 bg-accent-500/5 px-4 py-5 text-sm text-neutral-300">
          <p className="font-semibold text-neutral-100">Como responder</p>
          <p className="mt-1 text-neutral-400">
            Gate desta rodada: só o marcador. Ex.:{" "}
            <span className="text-accent-300">“Marcador Q”</span> (ou P / R / S
            / T). Com a letra, o orquestrador fecha o DoR da US-07-13 e segue
            Dev → QA → TL → PO (educação, certs, hero, chat inclusos).
          </p>
        </footer>
      </div>
    </div>
  );
}
