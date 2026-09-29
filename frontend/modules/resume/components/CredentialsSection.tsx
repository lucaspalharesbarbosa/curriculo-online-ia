"use client";

import { useState } from "react";

import type {
  Certification,
  Education,
  Recognition,
} from "@/content/resume.schema";

import { SectionTitle } from "./SectionTitle";

type CredentialsSectionProps = {
  education: Education[];
  certifications: Certification[];
  recognitions: Recognition[];
};

const CARD = "rounded-[10px] border border-border-subtle bg-surface-raised p-4";
const CARD_TITLE =
  "mb-3 font-mono text-xs tracking-wider text-accent uppercase";
const INITIAL_CERTIFICATIONS = 4;

export function CredentialsSection({
  education,
  certifications,
  recognitions,
}: CredentialsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll
    ? certifications
    : certifications.slice(0, INITIAL_CERTIFICATIONS);

  return (
    <section
      id="formacao"
      className="scroll-mt-20 px-4 py-12 sm:px-8"
      aria-labelledby="formacao-titulo"
    >
      <SectionTitle
        id="formacao-titulo"
        kicker="// credenciais"
        title="Formação, certificações e reconhecimentos"
      />
      <div className="grid gap-3 lg:grid-cols-3">
        <div className={CARD}>
          <h3 className={CARD_TITLE}>formação</h3>
          <ul className="space-y-3 text-sm">
            {education.map((item) => (
              <li key={`${item.institution}-${item.degree}`}>
                <span className="font-medium">{item.degree}</span>
                <span className="block text-xs text-muted">
                  {item.institution} · {item.startDate} a {item.endDate}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={CARD}>
          <h3 className={CARD_TITLE}>
            certificações ({certifications.length})
          </h3>
          <ul className="space-y-3 text-sm">
            {visible.map((item) => (
              <li key={item.name}>
                {item.credentialUrl ? (
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {item.name}
                  </a>
                ) : (
                  <span className="font-medium">{item.name}</span>
                )}
                <span className="block text-xs text-muted">
                  {item.issuer} · {item.issuedAt}
                </span>
              </li>
            ))}
          </ul>
          {certifications.length > INITIAL_CERTIFICATIONS ? (
            <button
              type="button"
              aria-expanded={showAll}
              onClick={() => setShowAll(!showAll)}
              className="tap-target mt-3 min-h-11 text-sm font-medium text-accent"
            >
              {showAll
                ? "Mostrar menos"
                : `Ver todas as ${certifications.length}`}
            </button>
          ) : null}
        </div>

        <div className={CARD}>
          <h3 className={CARD_TITLE}>reconhecimentos</h3>
          <ul className="space-y-3 text-sm">
            {recognitions.map((item) => (
              <li key={`${item.title}-${item.year}`}>
                <span className="font-medium">{item.title}</span>
                <span className="block text-xs text-muted">
                  {item.issuer} · {item.year}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
