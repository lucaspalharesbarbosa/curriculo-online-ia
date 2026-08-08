"use client";

import { motion } from "framer-motion";
import { Info, Medal, Sparkles } from "lucide-react";

import type { Recognition } from "@/content/resume.schema";

type RecognitionsProps = {
  items: Recognition[];
};

export function Recognitions({ items }: RecognitionsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="recognitions-heading">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass relative overflow-hidden rounded-3xl p-6 lg:p-8"
      >
        <div className="absolute top-1/2 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-accent-500/20 p-3 text-accent-400">
              <Medal className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="recognitions-heading"
                className="flex items-center gap-2 text-xl font-bold text-neutral-100"
              >
                Reconhecimentos
                <Sparkles className="h-4 w-4 text-accent-400" />
              </h2>
              <p className="text-xs text-neutral-400">Prêmios e Méritos</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((recognition, index) => (
              <motion.div
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
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card group relative overflow-hidden rounded-2xl p-5"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent-500/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <div className="relative z-10 flex gap-4">
                  {/* Medalha decorativa — logos das fotos originais servem só
                      de referência de contexto, nunca aparecem na UI (ADR-006) */}
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.05 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-400/30 via-accent-500/20 to-accent-600/30 blur-md" />
                    <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-accent-500/40 bg-gradient-to-br from-accent-500/20 to-accent-600/10">
                      <Medal className="h-7 w-7 text-accent-400" />
                    </div>
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <span className="mb-2 inline-block rounded-full border border-accent-500/30 bg-accent-500/20 px-3 py-1 text-xs font-semibold text-accent-400">
                      {recognition.year}
                    </span>
                    <div className="mb-1 flex items-center gap-1.5">
                      <h3 className="text-sm leading-tight font-semibold text-neutral-100">
                        {recognition.title}
                      </h3>
                      {/* Explicação do que é o reconhecimento (PRAD/Mérito) em
                          balão exibido no hover/foco — evita texto sempre
                          visível ocupando espaço no card (pedido do autor) */}
                      {recognition.description ? (
                        <span className="group/tooltip relative inline-flex shrink-0">
                          <button
                            type="button"
                            aria-describedby={`recognition-tooltip-${index}`}
                            className="flex h-4 w-4 items-center justify-center rounded-full text-neutral-500 transition-colors hover:text-accent-400 focus-visible:text-accent-400 focus-visible:outline-none"
                          >
                            <Info className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">
                              O que é {recognition.title}?
                            </span>
                          </button>
                          <span
                            id={`recognition-tooltip-${index}`}
                            role="tooltip"
                            className="glass pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-xl p-3 text-[11px] leading-snug text-neutral-300 opacity-0 shadow-lg transition-opacity duration-200 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
                          >
                            {recognition.description}
                          </span>
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-neutral-400">
                      {recognition.issuer}
                    </p>
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
