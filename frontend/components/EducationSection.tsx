"use client";

import { motion } from "framer-motion";
import { Calendar, Globe, GraduationCap, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Education } from "@/content/resume.schema";

type EducationSectionProps = {
  items: Education[];
};

export function EducationSection({ items }: EducationSectionProps) {
  return (
    <section aria-labelledby="education-heading">
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
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="education-heading"
                className="flex items-center gap-2 text-xl font-bold text-neutral-100"
              >
                Educação
                <Sparkles className="h-4 w-4 text-accent-400" />
              </h2>
              <p className="text-xs text-neutral-400">Formação Acadêmica</p>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((edu, index) => (
              <motion.div
                key={`${edu.institution}-${edu.startDate}`}
                initial={{ opacity: 0, x: -36 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 16,
                  delay: index * 0.12,
                }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card group relative rounded-2xl p-5"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent-500/0 via-accent-500/5 to-accent-600/0 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative z-10 flex gap-4">
                  <div className="icon-glow h-14 w-14 shrink-0 rounded-xl bg-accent-500/20">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-700/50 bg-white p-2">
                      {edu.logoUrl ? (
                        <Image
                          src={edu.logoUrl}
                          alt={`Logo ${edu.institution}`}
                          width={56}
                          height={56}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/20 text-accent-400">
                          <GraduationCap className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      <h3 className="text-lg font-bold text-neutral-100">
                        {edu.institution}
                      </h3>
                      {/* Link para o site oficial — chip com fundo próprio
                          (mesmo padrão dos ícones de contato) para não se
                          perder contra o fundo escuro; some quando a
                          instituição não tem site cadastrado */}
                      {edu.websiteUrl ? (
                        <Link
                          href={edu.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Site oficial de ${edu.institution}`}
                          title="Site oficial"
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-accent-400 transition-colors hover:bg-accent-500/25 hover:text-accent-300"
                        >
                          <Globe className="h-3.5 w-3.5" />
                        </Link>
                      ) : null}
                    </div>
                    <p className="mb-3 font-medium text-accent-400">
                      {edu.degree}
                    </p>
                    <span className="flex items-center gap-1.5 text-sm text-neutral-400">
                      <Calendar className="h-4 w-4" />
                      {edu.startDate} – {edu.endDate}
                    </span>
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
