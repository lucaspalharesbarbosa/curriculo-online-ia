"use client";

import { motion } from "framer-motion";
import { Award, Sparkles, Trophy } from "lucide-react";
import Image from "next/image";

import type { Certification } from "@/content/resume.schema";

type CertificationsProps = {
  items: Certification[];
};

export function Certifications({ items }: CertificationsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="certifications-heading">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass relative overflow-hidden rounded-3xl p-6 lg:p-8"
      >
        <div className="absolute right-0 bottom-0 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-accent-500/20 p-3 text-accent-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="certifications-heading"
                className="flex items-center gap-2 text-xl font-bold text-neutral-100"
              >
                Certificações
                <Sparkles className="h-4 w-4 text-accent-400" />
              </h2>
              <p className="text-xs text-neutral-400">
                Reconhecimentos e Conquistas
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((cert, index) => (
              <motion.div
                key={`${cert.name}-${cert.issuedAt}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass-card group relative overflow-hidden rounded-2xl p-5 text-center"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent-500/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                <div className="relative z-10">
                  <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-neutral-700/40 bg-neutral-950/60 p-1.5 sm:h-32 sm:w-32">
                    {cert.logoUrl ? (
                      <Image
                        src={cert.logoUrl}
                        alt={`Logo ${cert.name}`}
                        width={128}
                        height={128}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20">
                        <Award className="h-10 w-10 text-accent-400" />
                      </div>
                    )}
                  </div>
                  <span className="mb-3 inline-block rounded-full border border-accent-500/30 bg-accent-500/20 px-3 py-1 text-xs font-semibold text-accent-400">
                    {cert.issuedAt}
                  </span>
                  <h3 className="mb-2 text-sm leading-tight font-semibold text-neutral-100">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-neutral-400">{cert.issuer}</p>
                  {cert.expiresAt ? (
                    <p className="mt-2 text-xs font-medium text-accent-400">
                      Válido até {cert.expiresAt}
                    </p>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
