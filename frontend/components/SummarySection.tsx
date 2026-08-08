"use client";

import { motion } from "framer-motion";
import { ScanFace } from "lucide-react";

import { ProfileAssistChat } from "@/components/ProfileAssistChat";
import { SectionHeading } from "@/components/SectionHeading";
import { splitAboutNarrative } from "@/lib/utils";

type SummarySectionProps = {
  name: string;
  title: string;
  about: string;
};

export function SummarySection({ title, about }: SummarySectionProps) {
  const { lead, body, accents } = splitAboutNarrative(about);

  return (
    <section aria-labelledby="about-heading">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass relative overflow-hidden rounded-3xl p-5 sm:p-6 lg:p-8"
      >
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6">
            <SectionHeading
              id="about-heading"
              title="Perfil"
              subtitle="Resumo Profissional"
              icon={<ScanFace className="h-5 w-5" aria-hidden />}
            />
          </div>

          <div className="mb-6">
            <ProfileAssistChat role={title} />
          </div>

          <div className="space-y-4">
            <p className="text-lg leading-snug font-medium text-balance text-neutral-100 sm:text-xl">
              {lead}
            </p>

            {accents.length > 0 ? (
              <ul
                className="flex flex-wrap gap-2"
                aria-label="Ênfases do perfil"
              >
                {accents.map((accent) => (
                  <li
                    key={accent}
                    className="rounded-lg border border-accent-500/25 bg-accent-500/10 px-2.5 py-1 text-[11px] font-medium tracking-wide text-accent-300"
                  >
                    {accent}
                  </li>
                ))}
              </ul>
            ) : null}

            {body ? (
              <div className="relative border-l-2 border-accent-500/30 pl-4">
                <p className="text-sm leading-relaxed text-neutral-400 sm:text-[15px] sm:leading-relaxed">
                  {body}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
