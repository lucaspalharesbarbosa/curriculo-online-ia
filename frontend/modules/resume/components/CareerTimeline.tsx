"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import type { Experience } from "@/content/resume.schema";
import { formatDuration, formatPeriod, monthsBetween } from "@/lib/period";

import { ganttBar, yearOffset, type GanttAxis } from "../lib/career";
import { SectionTitle } from "./SectionTitle";

type CareerTimelineProps = {
  experiences: Experience[];
  axis: GanttAxis;
};

/** Linha do tempo estilo Gantt: cada cargo é uma barra; o cargo aberto mostra conquistas e tecnologias. */
export function CareerTimeline({ experiences, axis }: CareerTimelineProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();
  // anos alternados no eixo para não encavalar rótulos
  const labeledYears = axis.years.filter((_, index) => index % 2 === 0);

  return (
    <section
      id="trajetoria"
      className="scroll-mt-20 px-4 py-12 sm:px-8"
      aria-labelledby="trajetoria-titulo"
    >
      <SectionTitle
        id="trajetoria-titulo"
        kicker="// trajetória"
        title="Linha do tempo da carreira"
      />
      <div className="overflow-hidden rounded-[10px] border border-border-subtle bg-surface-raised">
        <div
          className="relative hidden h-8 border-b border-border-subtle lg:mr-[9.5rem] lg:ml-[14rem] lg:block"
          aria-hidden
        >
          {labeledYears.map((year) => (
            <span
              key={year}
              className="absolute top-2 -translate-x-1/2 font-mono text-[11px] text-muted"
              style={{ left: `${yearOffset(axis, year)}%` }}
            >
              {year}
            </span>
          ))}
        </div>
        <ul>
          {experiences.map((experience, index) => {
            const bar = ganttBar(axis, experience);
            const isOpen = openIndex === index;
            const isCurrent = experience.endDate === null;
            const panelId = `${baseId}-painel-${index}`;
            const months = monthsBetween(
              experience.startDate,
              experience.endDate,
              axis.max,
            );
            return (
              <li
                key={`${experience.company}-${experience.startDate}`}
                className="border-b border-border-subtle last:border-b-0"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="tap-target grid w-full items-center gap-x-4 gap-y-2 px-4 py-3 text-left transition hover:bg-surface lg:grid-cols-[13rem_1fr_9rem]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {experience.company}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {experience.role.split("|")[0].trim()}
                    </span>
                  </span>
                  <span
                    className="relative h-6 rounded-sm bg-surface"
                    aria-hidden
                  >
                    {axis.years.slice(1).map((year) => (
                      <span
                        key={year}
                        className="absolute inset-y-0 w-px bg-border-subtle opacity-60"
                        style={{ left: `${yearOffset(axis, year)}%` }}
                      />
                    ))}
                    <motion.span
                      className={`absolute inset-y-1 origin-left rounded-[3px] ${
                        isCurrent
                          ? "bg-gradient-to-r from-accent-500 to-accent-400 shadow-[0_0_16px_var(--accent)]"
                          : "bg-gradient-to-r from-[#1d6a94] to-[#2b8fc2]"
                      }`}
                      style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.7,
                        delay: index * 0.05,
                        ease: "easeOut",
                      }}
                    />
                  </span>
                  <span className="flex items-center justify-between gap-2 font-mono text-xs text-muted">
                    <span>
                      {formatPeriod(experience.startDate, experience.endDate)}
                    </span>
                    <ChevronDown
                      size={15}
                      className={`shrink-0 transition ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-4 px-4 pb-5 lg:grid-cols-[1.4fr_1fr]">
                        <ul className="space-y-2 text-sm leading-relaxed text-muted">
                          {experience.highlights.map((highlight) => (
                            <li key={highlight} className="flex gap-2">
                              <span className="text-accent" aria-hidden>
                                ›
                              </span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                        <div>
                          <p className="mb-2 font-mono text-xs text-muted">
                            {experience.location} · {experience.modality} ·{" "}
                            {formatDuration(months)}
                          </p>
                          <ul
                            className="flex flex-wrap gap-1.5"
                            aria-label="Tecnologias"
                          >
                            {experience.technologies.map((tech) => (
                              <li
                                key={tech}
                                className="rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[11px]"
                              >
                                {tech}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
