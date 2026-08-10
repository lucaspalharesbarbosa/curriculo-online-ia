"use client";

import { ArrowUpRight, Award, KeyRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { CollapsibleSection } from "@/components/CollapsibleSection";
import type { Certification } from "@/content/resume.schema";
import { formatYear, groupCertificationsByIssuer } from "@/lib/utils";

type CertificationsProps = {
  items: Certification[];
};

export function Certifications({ items }: CertificationsProps) {
  if (items.length === 0) {
    return null;
  }

  const groups = groupCertificationsByIssuer(items);

  return (
    <CollapsibleSection
      headingId="certifications-heading"
      title="Certificações"
      subtitle="Cursos e Credenciais Técnicas"
      icon={<KeyRound className="h-5 w-5" aria-hidden />}
      orbClassName="right-0 bottom-0 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group, groupIndex) => {
          const spansWide = group.items.length >= 3;

          return (
            <motion.article
              key={group.issuer}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 130,
                damping: 18,
                delay: groupIndex * 0.06,
              }}
              className={`glass-card flex flex-col rounded-2xl border border-neutral-800/80 p-4 ${
                spansWide ? "sm:col-span-2" : ""
              }`}
            >
              <header className="mb-3 flex items-center gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-xl bg-accent-500/15 blur-md"
                    aria-hidden
                  />
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-accent-500/30 bg-white p-1.5">
                    {group.logoUrl ? (
                      <Image
                        src={group.logoUrl}
                        alt={`Logo ${group.issuer}`}
                        width={44}
                        height={44}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Award className="h-5 w-5 text-accent-500" />
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="type-item-title truncate text-base">
                    {group.issuer}
                  </h3>
                  <p className="type-meta mt-0.5">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "credencial" : "credenciais"}
                  </p>
                </div>
              </header>

              <ul
                className={
                  spansWide
                    ? "grid gap-0 sm:grid-cols-2 sm:gap-x-6"
                    : "flex flex-col"
                }
              >
                {group.items.map((cert, certIndex) => (
                  <li
                    key={`${cert.name}-${cert.issuedAt}`}
                    className={`flex items-start gap-3 border-t border-neutral-800/70 py-3 first:border-t-0 first:pt-0 last:pb-0 ${
                      spansWide && certIndex === 0
                        ? "sm:border-t-0 sm:pt-0"
                        : ""
                    } ${
                      spansWide && certIndex === 1
                        ? "sm:border-t-0 sm:pt-0"
                        : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="type-body leading-snug font-medium text-neutral-100">
                        {cert.name}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="type-caption font-mono tracking-wide text-accent-300/90">
                          {formatYear(cert.issuedAt)}
                        </span>
                        {cert.expiresAt ? (
                          <span className="type-meta text-neutral-500">
                            · válido até {formatYear(cert.expiresAt)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {cert.credentialUrl ? (
                      <Link
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ver certificado ${cert.name}`}
                        className="cert-credential-cta cert-credential-cta--compact shrink-0 self-center"
                      >
                        Ver
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </motion.article>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
