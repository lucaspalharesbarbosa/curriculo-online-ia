"use client";

import { ArrowUpRight, BookMarked, Calendar, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { CollapsibleSection } from "@/components/CollapsibleSection";
import type { Education } from "@/content/resume.schema";

type EducationSectionProps = {
  items: Education[];
};

export function EducationSection({ items }: EducationSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <CollapsibleSection
      headingId="education-heading"
      sectionId="educacao"
      title="Educação"
      subtitle="Formação Acadêmica"
      icon={<BookMarked className="h-5 w-5" aria-hidden />}
      orbClassName="top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl max-md:hidden"
    >
      <div className="space-y-3 sm:space-y-4">
        {items.map((edu, index) => (
          <motion.article
            key={`${edu.institution}-${edu.startDate}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{
              duration: 0.35,
              delay: Math.min(index * 0.05, 0.15),
              ease: [0.16, 1, 0.3, 1],
            }}
            className="edu-card relative rounded-2xl border border-neutral-700/45 bg-[#0a1520]/90 p-4 sm:p-5"
          >
            <div className="flex gap-3.5 sm:gap-4">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-700/50 bg-white p-1.5 sm:h-14 sm:w-14 sm:p-2">
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
                    <BookMarked className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="type-item-title text-neutral-100">
                  {edu.institution}
                </h3>
                <p className="type-item-accent mt-1">{edu.degree}</p>
                <span className="type-meta mt-2.5 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0" aria-hidden />
                  {edu.startDate} – {edu.endDate}
                </span>

                {edu.websiteUrl ? (
                  <Link
                    href={edu.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Site oficial de ${edu.institution}`}
                    title="Abrir site oficial"
                    className="edu-site-cta mt-3.5 w-full justify-center sm:mt-4 sm:w-auto sm:justify-start"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    <span>Visitar site da instituição</span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 opacity-80"
                      aria-hidden
                    />
                  </Link>
                ) : null}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </CollapsibleSection>
  );
}
