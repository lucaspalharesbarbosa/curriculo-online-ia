"use client";

import { BookMarked, Calendar, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { CollapsibleSection } from "@/components/CollapsibleSection";
import type { Education } from "@/content/resume.schema";

type EducationSectionProps = {
  items: Education[];
};

export function EducationSection({ items }: EducationSectionProps) {
  return (
    <CollapsibleSection
      headingId="education-heading"
      title="Educação"
      subtitle="Formação Acadêmica"
      icon={<BookMarked className="h-5 w-5" aria-hidden />}
      orbClassName="top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl"
    >
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
            className="glass-card group relative rounded-2xl p-4 sm:p-5"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent-500/0 via-accent-500/5 to-accent-600/0 opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative z-10 flex gap-3 sm:gap-4">
              <div className="icon-glow h-12 w-12 shrink-0 rounded-xl bg-accent-500/20 sm:h-14 sm:w-14">
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
                      <BookMarked className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-neutral-100 sm:text-lg">
                    {edu.institution}
                  </h3>
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
                <p className="mb-3 font-medium text-accent-400">{edu.degree}</p>
                <span className="flex items-center gap-1.5 text-sm text-neutral-400">
                  <Calendar className="h-4 w-4" />
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
