/**
 * Derivações puras sobre o `resume.json` para a UI (hero, linha do tempo).
 * Nada de conteúdo factual novo: só contas sobre as datas e listas do currículo.
 */
import type { Experience, Resume } from "@/content/resume.schema";
import { monthsBetween, ymToIndex } from "@/lib/period";

export type CareerStats = {
  careerYears: number;
  companies: number;
  technologies: number;
  certifications: number;
};

/** Contadores do hero. `refIndex` é o mês de referência ("atual"), injetado para ser testável. */
export function careerStats(resume: Resume, refIndex: number): CareerStats {
  const firstStart = Math.min(
    ...resume.experiences.map((e) => ymToIndex(e.startDate)),
  );
  return {
    careerYears: Math.floor((refIndex - firstStart) / 12),
    companies: new Set(resume.experiences.map((e) => e.company)).size,
    technologies: resume.skills.reduce((n, g) => n + g.items.length, 0),
    certifications: resume.certifications.length,
  };
}

export type GanttAxis = {
  /** Índice de mês do início da carreira. */
  min: number;
  /** Índice de mês de referência. */
  max: number;
  years: number[];
};

/** Eixo do gráfico: do primeiro mês de carreira ao mês de referência. */
export function ganttAxis(resume: Resume, refIndex: number): GanttAxis {
  const min = Math.min(
    ...resume.experiences.map((e) => ymToIndex(e.startDate)),
  );
  const firstYear = Math.floor(min / 12);
  const lastYear = Math.floor(refIndex / 12);
  return {
    min,
    max: refIndex,
    years: Array.from(
      { length: lastYear - firstYear + 1 },
      (_, i) => firstYear + i,
    ),
  };
}

/** Posição de um ano no eixo, em % (o eixo começa no mês, não no ano cheio). */
export function yearOffset(axis: GanttAxis, year: number): number {
  return ((year * 12 - axis.min) / (axis.max - axis.min)) * 100;
}

/** Posição e largura (%) da barra de um cargo; largura mínima para cargos curtos ficarem visíveis. */
export function ganttBar(
  axis: GanttAxis,
  experience: Pick<Experience, "startDate" | "endDate">,
) {
  const span = axis.max - axis.min;
  const left = ((ymToIndex(experience.startDate) - axis.min) / span) * 100;
  const months = monthsBetween(
    experience.startDate,
    experience.endDate,
    axis.max,
  );
  return { left, width: Math.max((months / span) * 100, 1.2) };
}
