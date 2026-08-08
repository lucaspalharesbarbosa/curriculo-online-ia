"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  MapPin,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";

import type { Experience } from "@/content/resume.schema";
import {
  formatResumePeriod,
  formatYear,
  groupExperiencesByCompany,
} from "@/lib/utils";

type ExperienceSectionProps = {
  experiences: Experience[];
};

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const groups = groupExperiencesByCompany(experiences);

  return (
    <section aria-labelledby="experience-heading">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass relative overflow-hidden rounded-3xl p-6 lg:p-8"
      >
        <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-accent-500/20 p-3 text-accent-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="experience-heading"
                className="flex items-center gap-2 text-xl font-bold text-neutral-100"
              >
                Experiência
                <Sparkles className="h-4 w-4 text-accent-400" />
              </h2>
              <p className="text-xs text-neutral-400">
                Trajetória Profissional
              </p>
            </div>
          </div>

          {/* Linha do tempo — eixo com o ano de cada passagem à esquerda da
              trilha (US-07-09, opção A aprovada): comunica visualmente que a
              ordem é da mais recente para a mais antiga, sem precisar ler as
              datas de cada card. A trilha "se desenha" de cima para baixo
              uma única vez ao entrar na viewport (sem loop, por performance
              — mesma preocupação já registrada em US-07-06/CA-005).
              Passagens consecutivas na mesma empresa (promoção) ficam num
              único grupo, sob um único ícone/logo (ajuste de layout
              pós-validação). */}
          <div className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-accent-400 uppercase">
            Mais recente no topo
            <ChevronDown className="h-3.5 w-3.5 animate-bounce" aria-hidden />
          </div>

          <div className="relative">
            <div className="absolute top-2 bottom-2 left-20 w-px overflow-hidden bg-neutral-800/60">
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "top" }}
                className="h-full w-full bg-gradient-to-b from-accent-500/60 via-accent-500/25 to-transparent"
              />
            </div>

            <div className="space-y-2">
              {groups.map((group, groupIndex) => {
                const primaryRole = group.roles[0];
                const isGroupCurrent = primaryRole.endDate === null;

                return (
                  <motion.div
                    key={`${group.company}-${primaryRole.startDate}`}
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: groupIndex * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group relative border-b border-neutral-800/60 py-5 last:border-0 last:pb-0"
                  >
                    <span
                      className={`absolute top-5 left-0 w-11 text-right font-mono text-xs font-bold ${
                        isGroupCurrent ? "text-accent-400" : "text-neutral-500"
                      }`}
                    >
                      {formatYear(primaryRole.startDate)}
                    </span>

                    <motion.div
                      whileHover={{ scale: 1.08, rotate: -4 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`icon-glow absolute top-5 left-14 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-neutral-800/70 transition-colors duration-300 ${
                        isGroupCurrent
                          ? "border-accent-500/60 pulse-glow"
                          : "border-neutral-700/50 group-hover:border-accent-500/40"
                      }`}
                    >
                      {group.logoUrl ? (
                        <Image
                          src={group.logoUrl}
                          alt={`Logo ${group.company}`}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-neutral-500" />
                      )}
                    </motion.div>

                    {/* pl-28 = largura do ano (w-11) + gap até left-14 do
                        ícone + largura do ícone (h-12/w-12) + respiro, senão
                        o texto do card fica sobreposto ao ícone/ano */}
                    <div className="pl-28">
                      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <h3 className="text-base font-bold text-neutral-100">
                          {group.company}
                        </h3>
                        <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {primaryRole.location} · {primaryRole.modality}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {group.roles.map((role, roleIndex) => (
                          <div key={`${role.role}-${role.startDate}`}>
                            {roleIndex > 0 ? (
                              <div className="mb-3 flex items-center gap-1.5 border-t border-dashed border-neutral-800/60 pt-3 text-[11px] font-semibold tracking-wide text-accent-400 uppercase">
                                <TrendingUp className="h-3.5 w-3.5" />
                                Promovido
                              </div>
                            ) : null}

                            <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                              <p className="flex items-center gap-2 font-medium text-accent-300">
                                {role.role}
                                {role.endDate === null ? (
                                  <span className="rounded-full border border-accent-500/40 bg-accent-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent-400 uppercase">
                                    Atual
                                  </span>
                                ) : null}
                              </p>
                              <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatResumePeriod(
                                  role.startDate,
                                  role.endDate,
                                )}
                              </span>
                            </div>

                            <ul className="mb-3 space-y-2 text-sm text-neutral-400">
                              {role.highlights.map((highlight) => (
                                <li
                                  key={highlight}
                                  className="flex items-start gap-2"
                                >
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                                  <span>{highlight}</span>
                                </li>
                              ))}
                            </ul>

                            <div className="flex flex-wrap gap-2">
                              {role.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className="rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-2 py-1 text-xs text-neutral-300 transition-colors hover:border-accent-500/30 hover:text-accent-300"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
