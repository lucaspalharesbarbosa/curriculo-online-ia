import { describe, expect, it } from "vitest";

import { resume } from "@/content/resume";
import { ymToIndex } from "@/lib/period";

import { careerStats, ganttAxis, ganttBar, yearOffset } from "./career";

const REF = ymToIndex("2026-09");

describe("career", () => {
  it("calcula os contadores do hero a partir do currículo", () => {
    const stats = careerStats(resume, REF);

    expect(stats.careerYears).toBe(10);
    expect(stats.companies).toBe(
      new Set(resume.experiences.map((e) => e.company)).size,
    );
    expect(stats.certifications).toBe(resume.certifications.length);
    expect(stats.technologies).toBeGreaterThan(0);
  });

  it("monta o eixo do primeiro mês da carreira até o mês de referência", () => {
    const axis = ganttAxis(resume, REF);

    expect(axis.max).toBe(REF);
    expect(axis.years[0]).toBe(2015);
    expect(axis.years.at(-1)).toBe(2026);
  });

  it("posiciona ano e barras dentro de 0 a 100%", () => {
    const axis = ganttAxis(resume, REF);
    const current = ganttBar(axis, { startDate: "2026-03", endDate: null });
    const first = ganttBar(axis, { startDate: "2015-11", endDate: "2016-08" });

    expect(first.left).toBe(0);
    expect(current.left + current.width).toBeCloseTo(100, 5);
    expect(yearOffset(axis, 2026)).toBeGreaterThan(90);
  });

  it("garante largura mínima para cargo muito curto", () => {
    const axis = ganttAxis(resume, REF);

    const bar = ganttBar(axis, { startDate: "2020-01", endDate: "2020-01" });

    expect(bar.width).toBe(1.2);
  });
});
