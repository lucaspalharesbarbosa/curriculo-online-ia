"use client";

import { motion } from "framer-motion";
import { ScanFace } from "lucide-react";

import { ProfileAssistChat } from "@/modules/chat/components/ProfileAssistChat";
import { SectionHeading } from "@/modules/resume/components/SectionHeading";
import { splitAboutNarrative } from "@/lib/utils";

type SummarySectionProps = {
  name: string;
  title: string;
  about: string;
};

export function SummarySection({ title, about }: SummarySectionProps) {
  const { lead, body, accents } = splitAboutNarrative(about);

  return (
    <section
      id="perfil"
      aria-labelledby="about-heading"
      className="scroll-mt-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="glass relative overflow-hidden rounded-3xl p-5 sm:p-6 lg:p-8"
      >
        <div className="pointer-events-none absolute top-0 right-0 hidden h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl lg:block" />

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
            <p className="type-item-title text-balance font-medium md:text-xl">
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
                    className="type-caption rounded-lg border border-accent-500/25 bg-accent-500/10 px-2.5 py-1.5 font-medium tracking-wide text-accent-300"
                  >
                    {accent}
                  </li>
                ))}
              </ul>
            ) : null}

            {body ? (
              <div className="relative border-l-2 border-accent-500/30 pl-4">
                <p className="type-body">{body}</p>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
