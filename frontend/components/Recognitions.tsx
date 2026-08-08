"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

import { CollapsibleSection } from "@/components/CollapsibleSection";
import type { Recognition } from "@/content/resume.schema";

type RecognitionsProps = {
  items: Recognition[];
};

export function Recognitions({ items }: RecognitionsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection
      headingId="recognitions-heading"
      title="Reconhecimentos"
      subtitle="Prêmios e Méritos"
      icon={<Trophy className="h-5 w-5" aria-hidden />}
      orbClassName="top-1/2 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((recognition, index) => (
          <motion.article
            key={`${recognition.title}-${recognition.year}`}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              type: "spring",
              stiffness: 130,
              damping: 16,
              delay: index * 0.1,
            }}
            whileHover={{ scale: 1.015, y: -3 }}
            className="glass-card group relative overflow-hidden rounded-2xl border border-accent-500/20 p-5"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/70 to-transparent" />
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent-500/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <div className="relative z-10">
              <div className="mb-4 flex items-start justify-between gap-3">
                <motion.div
                  whileHover={{ rotate: 6, scale: 1.05 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative flex h-14 w-14 shrink-0 items-center justify-center"
                >
                  <div className="absolute inset-0 rounded-2xl bg-accent-500/20 blur-md" />
                  <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-accent-500/40 bg-gradient-to-br from-accent-500/25 to-accent-600/10">
                    <Trophy className="h-6 w-6 text-accent-300" aria-hidden />
                  </div>
                </motion.div>

                <span className="rounded-lg border border-accent-500/35 bg-accent-500/15 px-2.5 py-1 font-mono text-[11px] font-semibold text-accent-300">
                  {recognition.year}
                </span>
              </div>

              <h3 className="mb-1 text-sm leading-snug font-semibold text-neutral-50 sm:text-base">
                {recognition.title}
              </h3>
              <p className="mb-3 text-xs font-medium tracking-wide text-accent-400/90 uppercase">
                {recognition.issuer}
              </p>

              {recognition.description ? (
                <p className="rounded-xl border border-neutral-800/80 bg-neutral-950/45 px-3 py-2.5 text-[12px] leading-relaxed text-neutral-300">
                  {recognition.description}
                </p>
              ) : null}
            </div>
          </motion.article>
        ))}
      </div>
    </CollapsibleSection>
  );
}
