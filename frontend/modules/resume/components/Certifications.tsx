"use client";

import { Award, ExternalLink, KeyRound } from "lucide-react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { CollapsibleSection } from "@/modules/resume/components/CollapsibleSection";
import { LinkButton } from "@/modules/resume/components/LinkButton";
import type { Certification } from "@/content/resume.schema";
import { formatYear, groupCertificationsByIssuer } from "@/lib/utils";

type CertificationsProps = {
  items: Certification[];
};

export function Certifications({ items }: CertificationsProps) {
  const reduceMotion = useReducedMotion();

  if (items.length === 0) {
    return null;
  }

  const groups = groupCertificationsByIssuer(items);

  return (
    <CollapsibleSection
      headingId="certifications-heading"
      sectionId="certificacoes"
      title="Certificações"
      subtitle="Cursos e Credenciais Técnicas"
      icon={<KeyRound className="h-5 w-5" aria-hidden />}
      orbClassName="right-0 bottom-0 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl max-md:hidden"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {groups.map((group, groupIndex) => (
          <motion.article
            key={group.issuer}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{
              duration: 0.35,
              delay: Math.min(groupIndex * 0.05, 0.15),
              ease: [0.16, 1, 0.3, 1],
            }}
            className="cert-issuer-card relative overflow-hidden rounded-2xl border border-neutral-700/45 bg-[#0a1520]/90 p-4 sm:p-5"
          >
            <header className="relative mb-3.5 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent-500/25 bg-white p-2">
                {group.logoUrl ? (
                  <Image
                    src={group.logoUrl}
                    alt={`Logo ${group.issuer}`}
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Award className="h-5 w-5 text-accent-400" aria-hidden />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="type-item-title text-sm sm:text-base">
                  {group.issuer}
                </h3>
                <p className="type-meta mt-0.5">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "credencial" : "credenciais"}
                </p>
              </div>
            </header>

            <ul className="relative space-y-2.5">
              {group.items.map((cert) => (
                <li key={`${cert.name}-${cert.issuedAt}`}>
                  <div className="rounded-xl border border-white/5 bg-black/25 p-3.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="type-body min-w-0 flex-1 leading-snug font-medium text-neutral-100">
                        {cert.name}
                      </p>
                      <time
                        dateTime={cert.issuedAt}
                        className="cert-year-pill shrink-0"
                      >
                        {formatYear(cert.issuedAt)}
                      </time>
                    </div>

                    {cert.expiresAt ? (
                      <p className="type-meta mt-1.5 text-neutral-500">
                        válido até {formatYear(cert.expiresAt)}
                      </p>
                    ) : null}

                    {cert.credentialUrl ? (
                      <LinkButton
                        href={cert.credentialUrl}
                        label="Ver certificado"
                        icon={
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        }
                        ariaLabel={`Ver certificado ${cert.name}`}
                        className="mt-3"
                      />
                    ) : null}
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
