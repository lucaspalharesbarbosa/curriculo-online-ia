import { MapPin } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import type { Contact, Hero as HeroData } from "@/content/resume.schema";
import { parseHeroTitle } from "@/lib/utils";

import type { CareerStats } from "../lib/career";
import { PdfLink } from "./ContactLinks";
import { CountUp } from "./CountUp";

type HeroProps = {
  hero: HeroData;
  contact: Contact;
  stats: CareerStats;
  /** Empresa e cargo atuais, exibidos sobre a foto. */
  current: { company: string; role: string };
  /** Botão que abre o chat (vem do domínio `chat`, montado na página). */
  askAction: ReactNode;
};

const CORNERS = [
  "-top-1.5 -left-1.5 border-t-2 border-l-2",
  "-top-1.5 -right-1.5 border-t-2 border-r-2",
  "-bottom-1.5 -left-1.5 border-b-2 border-l-2",
  "-right-1.5 -bottom-1.5 border-r-2 border-b-2",
];

export function Hero({ hero, contact, stats, current, askAction }: HeroProps) {
  const { primary, secondary } = parseHeroTitle(hero.title);
  const nameParts = hero.name.split(" ");
  const counters: [number, string, string][] = [
    [stats.careerYears, "+", "anos de carreira"],
    [stats.companies, "", "empresas"],
    [stats.technologies, "", "tecnologias mapeadas"],
    [stats.certifications, "", "certificações"],
  ];

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-name">
      <div
        className="hero-grid pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-accent opacity-30 blur-3xl"
        aria-hidden
      />

      <div className="relative grid items-center gap-8 px-4 py-10 sm:px-8 lg:grid-cols-[1.35fr_1fr] lg:py-16">
        <div>
          <p className="mb-4 flex items-center gap-2 font-mono text-sm text-accent">
            <span className="live-dot h-2 w-2 rounded-full bg-ok" aria-hidden />
            $ whoami
          </p>
          <h1
            id="hero-name"
            className="animate-fadeIn font-display text-[2.6rem] leading-[1.02] font-semibold tracking-tight sm:text-6xl xl:text-7xl"
          >
            {nameParts.slice(0, 2).join(" ")}{" "}
            <span className="block bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent">
              {nameParts.slice(2).join(" ")}
            </span>
          </h1>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Papéis e foco">
            {[...primary, ...secondary].map((part, index) => (
              <li
                key={part}
                className={`rounded-md border px-2.5 py-1 font-mono text-xs ${
                  index === 0
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border-subtle text-muted"
                }`}
              >
                {part}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {hero.summary}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {askAction}
            <PdfLink href={contact.resumePdfUrl} />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[16rem] lg:max-w-sm">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border-subtle bg-surface">
            {hero.photoUrl ? (
              <Image
                src={hero.photoUrl}
                alt={`Foto de ${hero.name}`}
                fill
                priority
                sizes="(min-width: 1024px) 24rem, 16rem"
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#04080e] to-transparent p-3 pt-10">
              <p className="font-mono text-xs text-accent-400">
                {current.role.split("|")[0].trim()} @ {current.company}
              </p>
              <p className="flex items-center gap-1 text-xs text-neutral-300">
                <MapPin size={12} aria-hidden /> {hero.location}
              </p>
            </div>
          </div>
          {CORNERS.map((corner) => (
            <span
              key={corner}
              aria-hidden
              className={`absolute h-5 w-5 border-accent ${corner}`}
            />
          ))}
        </div>
      </div>

      <dl className="relative grid grid-cols-2 border-y border-border-subtle bg-surface sm:grid-cols-4">
        {counters.map(([value, suffix, label], index) => (
          <div
            key={label}
            className={`px-4 py-4 sm:px-6 ${index % 2 === 1 ? "border-l border-border-subtle" : ""} ${index > 1 ? "border-t border-border-subtle sm:border-t-0" : ""} ${index > 0 ? "sm:border-l sm:border-border-subtle" : ""}`}
          >
            <dd className="font-display text-3xl font-semibold text-accent-400">
              <CountUp to={value} suffix={suffix} />
            </dd>
            <dt className="font-mono text-xs text-muted">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
