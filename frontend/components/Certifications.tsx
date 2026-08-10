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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {groups.map((group, groupIndex) => (
          <motion.article
            key={group.issuer}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 20,
              delay: groupIndex * 0.06,
            }}
            className="cert-issuer-card glass-card group relative overflow-hidden rounded-2xl p-4 sm:p-5"
          >
            <div
              className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-accent-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden
            />

            <header className="relative mb-4 flex items-center gap-3.5">
              <div className="cert-seal shrink-0">
                <div className="cert-seal__ring" aria-hidden />
                <div className="cert-seal__face">
                  {group.logoUrl ? (
                    <Image
                      src={group.logoUrl}
                      alt={`Logo ${group.issuer}`}
                      width={44}
                      height={44}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Award className="h-5 w-5 text-accent-400" aria-hidden />
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="type-item-title truncate text-sm sm:text-base">
                  {group.issuer}
                </h3>
                <p className="type-meta mt-0.5">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "credencial" : "credenciais"}
                </p>
              </div>
            </header>

            <ul className="relative space-y-2">
              {group.items.map((cert) => (
                <li key={`${cert.name}-${cert.issuedAt}`}>
                  <div className="cert-credential-row">
                    <div className="min-w-0 flex-1">
                      <p className="type-body leading-snug font-medium text-neutral-100">
                        {cert.name}
                      </p>
                      {cert.expiresAt ? (
                        <p className="type-meta mt-1 text-neutral-500">
                          válido até {formatYear(cert.expiresAt)}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                      <time dateTime={cert.issuedAt} className="cert-year-pill">
                        {formatYear(cert.issuedAt)}
                      </time>

                      {cert.credentialUrl ? (
                        <Link
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Ver certificado ${cert.name}`}
                          className="cert-credential-link"
                        >
                          <span>Ver certificado</span>
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </CollapsibleSection>
  );
}
