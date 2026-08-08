"use client";

import { motion } from "framer-motion";
import {
  Download,
  Github,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type {
  Contact,
  Hero,
  SkillGroup,
  SkillItem,
} from "@/content/resume.schema";
import { getSkillIcon } from "@/lib/skill-icons";
import {
  buildGoogleMapsUrl,
  formatSkillLevel,
  parseHeroTitle,
} from "@/lib/utils";

const SKILL_LEVEL_SEGMENTS = [1, 2, 3, 4, 5] as const;

// US-07-10 — as duas categorias de banco de dados são combinadas num único
// bloco de "colunas leves" (opção 6 aprovada) em vez de duas categorias
// genéricas separadas; nomes batem com `resume.json`.
const SQL_CATEGORY = "Banco de Dados (SQL)";
const NOSQL_CATEGORY = "Banco de Dados (NoSQL)";

type ResumeSidebarProps = {
  hero: Hero;
  contact: Contact;
  skills: SkillGroup[];
};

type SkillChipProps = {
  skill: SkillItem;
  delay: number;
  icon: ReactNode;
};

/** Chip de habilidade — ícone, nome e medidor de proficiência (barra segmentada).
    `icon` já vem resolvido do chamador (`getSkillIcon` roda no `.map()`, não
    aqui) — instanciar o componente de ícone dentro de um componente nomeado
    aciona o lint `react-hooks/static-components` ("componente criado durante
    o render"). */
function SkillChip({ skill, delay, icon }: SkillChipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="skill-tag flex cursor-default items-center gap-2 rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-2 py-1.5 text-xs text-neutral-200 hover:border-accent-500/50 hover:bg-accent-500/10 hover:text-accent-300"
    >
      {/* Chip com fundo próprio atrás do ícone — garante contraste
          consistente mesmo para logos de marca com traços finos/
          monocromáticos que ficavam quase invisíveis direto sobre o fundo
          escuro do tag */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-500/15 text-accent-300">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate" title={skill.name}>
        {skill.name}
      </span>
      {/* Medidor de proficiência — barra segmentada (opção aprovada pelo
          autor entre 4 alternativas visuais) */}
      <span
        className="flex shrink-0 items-center gap-[3px]"
        role="img"
        aria-label={`Nível: ${formatSkillLevel(skill.level)}`}
        title={formatSkillLevel(skill.level)}
      >
        {SKILL_LEVEL_SEGMENTS.map((segment) => (
          <span
            key={segment}
            className={`h-[5px] w-2 rounded-full ${
              segment <= skill.level
                ? "bg-gradient-to-r from-accent-400 to-accent-500"
                : "bg-neutral-700/60"
            }`}
          />
        ))}
      </span>
    </motion.div>
  );
}

export function ResumeSidebar({ hero, contact, skills }: ResumeSidebarProps) {
  const { primary: primaryRoles, secondary: secondaryInfo } = parseHeroTitle(
    hero.title,
  );

  return (
    <aside className="w-full shrink-0 p-4 lg:w-[340px] lg:min-h-screen lg:p-6 xl:w-[380px]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="glass space-y-6 rounded-3xl p-6 lg:sticky lg:top-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <div className="relative mb-4 inline-block">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-accent-400 via-accent-500 to-accent-400 opacity-40 blur-xl" />
            <div
              className="spin-slow absolute -inset-1.5 rounded-full opacity-70"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, var(--accent-500) 90deg, transparent 180deg, var(--accent-400) 270deg, transparent 360deg)",
              }}
              aria-hidden
            />
            <div className="pulse-glow relative h-28 w-28 rounded-full bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 p-[3px] transition-transform duration-300 hover:scale-105 lg:h-36 lg:w-36">
              {hero.photoUrl ? (
                <Image
                  src={hero.photoUrl}
                  alt={hero.name}
                  width={144}
                  height={144}
                  className="h-full w-full rounded-full object-cover object-top bg-surface"
                  priority
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center rounded-full bg-surface text-2xl font-bold text-accent-400"
                  aria-hidden
                >
                  {hero.name
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </div>
              )}
            </div>
          </div>

          <h1 className="gradient-text glow-text mb-2 text-xl font-bold lg:text-2xl">
            {hero.name}
          </h1>

          {/* Cargos em destaque, um por linha, digitados simultaneamente
              (US-07-07 — opção B3 aprovada: as duas linhas "escrevem" ao
              mesmo tempo, sem alternar/esconder um cargo pelo outro).
              Informações complementares discretas seguem abaixo, divididas
              a partir de hero.title. */}
          {primaryRoles.length > 0 ? (
            <div className="mb-1.5 flex flex-col items-center gap-1">
              {primaryRoles.map((role, index) => (
                <span
                  key={role}
                  className={`role-typewriter font-mono ${
                    index === 0
                      ? "gradient-text text-sm font-semibold lg:text-base"
                      : "text-xs text-accent-300 lg:text-sm"
                  }`}
                  style={
                    {
                      "--role-chars": role.length,
                      "--role-type-duration": `${(role.length * 0.045).toFixed(2)}s`,
                      "--role-delay": "0.2s",
                    } as React.CSSProperties
                  }
                >
                  {role}
                </span>
              ))}
            </div>
          ) : null}

          {secondaryInfo.length > 0 ? (
            <p className="mb-3 text-[11px] tracking-wide text-neutral-500 uppercase">
              {secondaryInfo.join(" · ")}
            </p>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            <Sparkles className="h-3 w-3 text-accent-400" />
            Contato
          </h2>

          {contact.email ? (
            <Link
              href={`mailto:${contact.email}`}
              className="glass-card group flex items-center gap-3 rounded-xl p-3"
            >
              <div className="rounded-lg bg-accent-500/20 p-2 text-accent-400 transition-colors group-hover:bg-accent-500/30">
                <Mail className="h-4 w-4" />
              </div>
              <span className="truncate text-xs text-neutral-300 transition-colors group-hover:text-white">
                {contact.email}
              </span>
            </Link>
          ) : null}

          {contact.whatsapp ? (
            <Link
              href={contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card group flex items-center gap-3 rounded-xl p-3"
            >
              <div className="rounded-lg bg-accent-500/20 p-2 text-accent-400 transition-colors group-hover:bg-accent-500/30">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="text-xs text-neutral-300 transition-colors group-hover:text-white">
                WhatsApp
              </span>
            </Link>
          ) : null}

          <Link
            href={buildGoogleMapsUrl(hero.location)}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card group flex items-center gap-3 rounded-xl p-3"
          >
            <div className="rounded-lg bg-accent-500/20 p-2 text-accent-400 transition-colors group-hover:bg-accent-500/30">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-xs text-neutral-300 transition-colors group-hover:text-white">
              {hero.location}
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex justify-center gap-3"
        >
          {contact.github ? (
            <Link
              href={contact.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="glass-card group rounded-xl p-3 transition-all hover:border-accent-500/30 hover:bg-accent-500/10"
            >
              <Github className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-accent-400" />
            </Link>
          ) : null}
          <Link
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="glass-card group rounded-xl p-3 transition-all hover:border-accent-500/30 hover:bg-accent-500/10"
          >
            <Linkedin className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-accent-400" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            <Sparkles className="h-3 w-3 text-accent-400" />
            Habilidades Técnicas
          </h2>

          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
            {skills.map((category, catIndex) => {
              // NoSQL é renderizado junto com SQL (abaixo) — nada aqui.
              if (category.category === NOSQL_CATEGORY) {
                return null;
              }

              if (category.category === SQL_CATEGORY) {
                const nosqlCategory = skills.find(
                  (c) => c.category === NOSQL_CATEGORY,
                );
                return (
                  <div key="banco-de-dados" className="space-y-1.5">
                    <h3 className="text-xs font-medium text-accent-400">
                      Banco de Dados
                    </h3>
                    {/* US-07-10 (revisão) — seções empilhadas em vez de
                        colunas lado a lado: em duas colunas a largura por
                        item ficava curta demais e cortava nomes como "SQL
                        Server"/"DynamoDB" (opção 1 aprovada pelo autor entre
                        3 alternativas mostradas em artifact comparativo) */}
                    <div className="space-y-2">
                      <div className="relative overflow-hidden rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-2 pt-2.5">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent-400 to-transparent" />
                        <h4 className="mb-1.5 text-[10px] font-semibold tracking-wide text-neutral-400 uppercase">
                          Relacional (SQL)
                        </h4>
                        <div className="space-y-1">
                          {category.items.map((skill, skillIndex) => {
                            const SkillIcon = getSkillIcon(skill.name);
                            return (
                              <SkillChip
                                key={skill.name}
                                skill={skill}
                                delay={0.5 + catIndex * 0.1 + skillIndex * 0.02}
                                icon={
                                  <SkillIcon
                                    className="h-3.5 w-3.5"
                                    aria-hidden
                                  />
                                }
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="relative overflow-hidden rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-2 pt-2.5">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent-600 to-transparent" />
                        <h4 className="mb-1.5 text-[10px] font-semibold tracking-wide text-neutral-400 uppercase">
                          Não-relacional (NoSQL)
                        </h4>
                        <div className="space-y-1">
                          {(nosqlCategory?.items ?? []).map(
                            (skill, skillIndex) => {
                              const SkillIcon = getSkillIcon(skill.name);
                              return (
                                <SkillChip
                                  key={skill.name}
                                  skill={skill}
                                  delay={
                                    0.5 + catIndex * 0.1 + skillIndex * 0.02
                                  }
                                  icon={
                                    <SkillIcon
                                      className="h-3.5 w-3.5"
                                      aria-hidden
                                    />
                                  }
                                />
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={category.category} className="space-y-1.5">
                  <h3 className="text-xs font-medium text-accent-400">
                    {category.category}
                  </h3>
                  <div className="space-y-1">
                    {category.items.map((skill, skillIndex) => {
                      const SkillIcon = getSkillIcon(skill.name);
                      return (
                        <SkillChip
                          key={skill.name}
                          skill={skill}
                          delay={0.5 + catIndex * 0.1 + skillIndex * 0.02}
                          icon={
                            <SkillIcon className="h-3.5 w-3.5" aria-hidden />
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {contact.resumePdfUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <Link
              href={contact.resumePdfUrl}
              download
              className="neon-glow flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-400 via-accent-500 to-accent-400 bg-[length:200%_100%] py-3.5 text-sm font-medium text-neutral-900 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-lg hover:shadow-accent-500/25"
            >
              <Download className="h-4 w-4" />
              Download CV
            </Link>
          </motion.div>
        ) : null}
      </motion.div>
    </aside>
  );
}
