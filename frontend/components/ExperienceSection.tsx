"use client";

import { motion } from "framer-motion";
import { Briefcase, Building2, Calendar, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";

import type { Experience } from "@/content/resume.schema";
import { formatResumePeriod } from "@/lib/utils";

type ExperienceSectionProps = {
  experiences: Experience[];
};

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
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

          <div className="space-y-4">
            {experiences.map((experience, index) => (
              <motion.div
                key={`${experience.company}-${experience.startDate}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="glass-card group relative rounded-2xl p-5"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent-500/0 via-accent-500/5 to-accent-600/0 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-700/50 bg-neutral-800/50">
                        {experience.logoUrl ? (
                          <Image
                            src={experience.logoUrl}
                            alt={`Logo ${experience.company}`}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-5 w-5 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="mb-1 text-lg font-bold text-neutral-100">
                          {experience.role}
                        </h3>
                        <p className="font-medium text-accent-400">
                          {experience.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatResumePeriod(
                          experience.startDate,
                          experience.endDate,
                        )}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {experience.location} · {experience.modality}
                      </span>
                    </div>
                  </div>

                  <ul className="mb-4 space-y-2 text-sm text-neutral-400">
                    {experience.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    {experience.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-2 py-1 text-xs text-neutral-300 transition-colors hover:border-accent-500/30 hover:text-accent-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
