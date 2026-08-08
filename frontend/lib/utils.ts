import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Certification, Experience } from "@/content/resume.schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type HeroTitleParts = {
  primary: string[];
  secondary: string[];
};

/**
 * Divide `hero.title` em cargos (antes do "—", em destaque) e informações
 * complementares (depois do "—", exibidas de forma discreta) — cada lado
 * então dividido por "|", convenção usada em `resume.json`
 * (ex.: "Tech Lead | Senior Software Engineer — AI Engineering | Java").
 */
export function parseHeroTitle(title: string): HeroTitleParts {
  const [rolesPart, infoPart] = title.split("—");
  const splitTrimmed = (value: string | undefined) =>
    (value ?? "")
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);

  return {
    primary: splitTrimmed(rolesPart),
    secondary: splitTrimmed(infoPart),
  };
}

/** URL de busca do Google Maps para uma localização em texto livre. */
export function buildGoogleMapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function formatResumePeriod(
  startDate: string,
  endDate: string | null,
): string {
  if (!endDate) {
    return `${startDate} – Atual`;
  }
  return `${startDate} – ${endDate}`;
}

/** Extrai só o ano (AAAA) de uma data no formato AAAA-MM usado no resume.json. */
export function formatYear(date: string): string {
  return date.slice(0, 4);
}

/** Rótulo em PT-BR do nível de proficiência (1–5) usado no medidor de Habilidades Técnicas. */
export const SKILL_LEVEL_LABELS: Record<number, string> = {
  1: "Iniciante",
  2: "Básico",
  3: "Intermediário",
  4: "Avançado",
  5: "Especialista",
};

export function formatSkillLevel(level: number): string {
  return SKILL_LEVEL_LABELS[level] ?? "Intermediário";
}

export type ExperienceGroup = {
  company: string;
  logoUrl: string | null;
  roles: Experience[];
};

/**
 * Agrupa experiências consecutivas na mesma empresa (ex.: promoção de Junior
 * para Pleno) para exibir um único logo/ícone por empresa na timeline, em vez
 * de repetir o mesmo logo para cada cargo.
 */
export function groupExperiencesByCompany(
  experiences: Experience[],
): ExperienceGroup[] {
  const groups: ExperienceGroup[] = [];

  for (const experience of experiences) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.company === experience.company) {
      lastGroup.roles.push(experience);
      continue;
    }
    groups.push({
      company: experience.company,
      logoUrl: experience.logoUrl,
      roles: [experience],
    });
  }

  return groups;
}

export type CertificationGroup = {
  issuer: string;
  logoUrl: string | null;
  items: Certification[];
};

/**
 * Agrupa certificações pelo emissor (ex.: Alura, Asimov Academy) — mais
 * recente primeiro — para exibir um único logo por emissor em vez de repetir
 * o mesmo badge em cada card.
 */
export function groupCertificationsByIssuer(
  items: Certification[],
): CertificationGroup[] {
  const groups = new Map<string, CertificationGroup>();

  for (const item of items) {
    const existing = groups.get(item.issuer);
    if (!existing) {
      groups.set(item.issuer, {
        issuer: item.issuer,
        logoUrl: item.logoUrl,
        items: [item],
      });
      continue;
    }
    existing.items.push(item);
    existing.logoUrl = existing.logoUrl ?? item.logoUrl;
  }

  for (const group of groups.values()) {
    group.items.sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1));
  }

  return Array.from(groups.values());
}
