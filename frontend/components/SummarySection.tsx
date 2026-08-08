"use client";

import { motion } from "framer-motion";
import { Code2, FileText, Sparkles } from "lucide-react";

type SummarySectionProps = {
  name: string;
  title: string;
  about: string;
};

export function SummarySection({ name, title, about }: SummarySectionProps) {
  return (
    <section aria-labelledby="about-heading">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass relative overflow-hidden rounded-3xl p-6 lg:p-8"
      >
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-accent-500/20 p-3 text-accent-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="about-heading"
                className="flex items-center gap-2 text-xl font-bold text-neutral-100"
              >
                Perfil
                <Sparkles className="h-4 w-4 text-accent-400" />
              </h2>
              <p className="text-xs text-neutral-400">Resumo Profissional</p>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-neutral-800/50 bg-neutral-900/60 p-4 font-mono text-sm">
            <div className="mb-3 flex items-center gap-2 text-xs text-neutral-500">
              <Code2 className="h-4 w-4" />
              <span>developer.ts</span>
            </div>
            <div className="space-y-1 text-xs sm:text-sm">
              <p>
                <span className="text-accent-400">const</span>{" "}
                <span className="text-neutral-200">developer</span> = {"{"}
              </p>
              <p className="pl-4">
                <span className="text-accent-300">name</span>:{" "}
                <span className="text-accent-400">&quot;{name}&quot;</span>,
              </p>
              <p className="pl-4">
                <span className="text-accent-300">role</span>:{" "}
                <span className="text-accent-400">&quot;{title}&quot;</span>,
              </p>
              <p>
                {"}"}
                <span className="cursor">|</span>
              </p>
            </div>
          </div>

          <p className="leading-relaxed text-neutral-300">{about}</p>
        </div>
      </motion.div>
    </section>
  );
}
