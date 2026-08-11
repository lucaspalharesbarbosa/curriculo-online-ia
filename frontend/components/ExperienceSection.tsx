"use client";

import {
  BriefcaseBusiness,
  Building2,
  Calendar,
  ChevronDown,
  MapPin,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

import { CollapsibleSection } from "@/components/CollapsibleSection";
import type { Experience } from "@/content/resume.schema";
import {
  cn,
  formatResumePeriod,
  formatYear,
  getExperienceHighlightKind,
  groupExperiencesByCompany,
} from "@/lib/utils";

type ExperienceSectionProps = {
  experiences: Experience[];
};

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const groups = groupExperiencesByCompany(experiences);

  return (
    <CollapsibleSection
      headingId="experience-heading"
      sectionId="experiencia"
      title="Experiência"
      subtitle="Trajetória Profissional"
      icon={<BriefcaseBusiness className="h-5 w-5" aria-hidden />}
      orbClassName="top-0 left-0 hidden h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl lg:block"
    >
      <div className="type-label mb-4 flex items-center gap-1.5 text-accent-400">
        Mais recente no topo
        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
      </div>

      <div className="relative">
        <div className="absolute top-2 bottom-2 left-[1.35rem] w-px overflow-hidden bg-neutral-800/60 sm:left-20">
          <div className="h-full w-full bg-gradient-to-b from-accent-500/60 via-accent-500/25 to-transparent" />
        </div>

        <div className="space-y-2">
          {groups.map((group, groupIndex) => {
            const primaryRole = group.roles[0];
            const isGroupCurrent = primaryRole.endDate === null;

            return (
              <motion.div
                key={`${group.company}-${primaryRole.startDate}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(groupIndex * 0.04, 0.12),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative border-b border-neutral-800/60 py-5 last:border-0 last:pb-0"
              >
                <div className="mb-3 flex items-start gap-3 sm:mb-0 sm:block">
                  <span
                    className={cn(
                      "type-meta absolute top-5 left-0 hidden w-12 text-right font-mono font-bold sm:block",
                      isGroupCurrent ? "text-accent-400" : "text-neutral-500",
                    )}
                  >
                    {formatYear(primaryRole.startDate)}
                  </span>

                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cn(
                      "icon-glow relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-neutral-800/70 transition-colors duration-300 sm:absolute sm:top-5 sm:left-14 sm:h-12 sm:w-12",
                      isGroupCurrent
                        ? "border-accent-500/60"
                        : "border-neutral-700/50 group-hover:border-accent-500/40",
                    )}
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

                  <div className="min-w-0 flex-1 sm:pl-28">
                    <p
                      className={cn(
                        "type-meta mb-0.5 font-mono font-bold sm:hidden",
                        isGroupCurrent ? "text-accent-400" : "text-neutral-500",
                      )}
                    >
                      {formatYear(primaryRole.startDate)}
                    </p>
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="type-item-title">{group.company}</h3>
                      <span className="type-meta flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {primaryRole.location} · {primaryRole.modality}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {group.roles.map((role, roleIndex) => (
                        <div key={`${role.role}-${role.startDate}`}>
                          {roleIndex > 0 ? (
                            <div className="type-label mb-3 flex items-center gap-1.5 border-t border-dashed border-neutral-800/60 pt-3 text-accent-400">
                              <TrendingUp className="h-3.5 w-3.5" />
                              Promovido
                            </div>
                          ) : null}

                          <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                            <p className="type-item-accent flex flex-wrap items-center gap-2 text-accent-300">
                              {role.role}
                              {role.endDate === null ? (
                                <span className="type-label rounded-full border border-accent-500/40 bg-accent-500/15 px-2 py-0.5 text-accent-400">
                                  Atual
                                </span>
                              ) : null}
                            </p>
                            <span className="type-meta flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              {formatResumePeriod(role.startDate, role.endDate)}
                            </span>
                          </div>

                          <ul className="type-body mb-3 space-y-2.5">
                            {role.highlights.map((highlight) => {
                              const kind =
                                getExperienceHighlightKind(highlight);
                              const isFeatured = kind !== "default";

                              return (
                                <li
                                  key={highlight}
                                  className={cn(
                                    "flex items-start gap-2.5",
                                    isFeatured
                                      ? "text-neutral-300"
                                      : "text-neutral-400",
                                  )}
                                >
                                  {isFeatured ? (
                                    <span
                                      className="highlight-ring-dot"
                                      aria-hidden
                                    />
                                  ) : (
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                                  )}
                                  <span>
                                    {isFeatured ? (
                                      <span className="type-label mb-0.5 block tracking-wider text-accent-400">
                                        {kind === "prad"
                                          ? "Alto desempenho"
                                          : "Mérito"}
                                      </span>
                                    ) : null}
                                    {highlight}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>

                          <div className="flex flex-wrap gap-2">
                            {role.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="type-chip rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-2 py-1 transition-colors hover:border-accent-500/30 hover:text-accent-300 active:border-accent-500/30 active:text-accent-300"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </CollapsibleSection>
  );
}
