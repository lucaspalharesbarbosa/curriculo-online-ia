"use client";

import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
              <BadgeCheck className="h-5 w-5" />
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
                Cursos e Credenciais Técnicas
              </p>
            </div>
          </div>

          {/* Agrupadas por emissor (um logo por emissor, não por certificado)
              e com só o ano de emissão, discreto — layout mais organizado
              que os cards individuais anteriores (ajuste de layout) */}
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((group, groupIndex) => (
              <motion.div
                key={group.issuer}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 130,
                  damping: 18,
                  delay: groupIndex * 0.08,
                }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-700/40 bg-neutral-950/60 p-1.5">
                    {group.logoUrl ? (
                      <Image
                        src={group.logoUrl}
                        alt={`Logo ${group.issuer}`}
                        width={44}
                        height={44}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/20">
                        <Award className="h-5 w-5 text-accent-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-neutral-100">
                      {group.issuer}
                    </h3>
                    {/* Legenda de contagem só faz sentido com 2+ certificados —
                        com 1 só, o item logo abaixo já fala por si (ajuste de
                        layout: evita a legenda redundante "1 certificado") */}
                    {group.items.length > 1 ? (
                      <p className="text-[11px] text-neutral-500">
                        {group.items.length} certificados
                      </p>
                    ) : null}
                  </div>
                </div>

                <ul className="space-y-3">
                  {group.items.map((cert, certIndex) => (
                    <li
                      key={`${cert.name}-${cert.issuedAt}`}
                      className={
                        certIndex > 0
                          ? "flex items-start justify-between gap-3 border-t border-neutral-800/60 pt-3"
                          : "flex items-start justify-between gap-3"
                      }
                    >
                      <div className="min-w-0">
                        {/* Ícone por certificado — identidade visual própria
                            de cada item dentro do grupo, além do logo
                            compartilhado do emissor no cabeçalho */}
                        <p className="flex items-start gap-1.5 text-xs leading-snug font-medium text-neutral-200">
                          <ShieldCheck
                            className="mt-0.5 h-3 w-3 shrink-0 text-accent-400"
                            aria-hidden
                          />
                          <span>{cert.name}</span>
                        </p>
                        {cert.expiresAt ? (
                          <p className="mt-0.5 pl-[18px] text-[11px] text-neutral-500">
                            Válido até {formatYear(cert.expiresAt)}
                          </p>
                        ) : null}
                        {cert.credentialUrl ? (
                          <Link
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 pl-[18px] text-[11px] font-medium text-accent-400 transition-colors hover:text-accent-300"
                          >
                            Ver certificado
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-[11px] font-medium tracking-wide text-neutral-500">
                        {formatYear(cert.issuedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
