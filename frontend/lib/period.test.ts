import { describe, expect, it } from "vitest";

import {
  currentMonthIndex,
  formatDuration,
  formatPeriod,
  formatYm,
  monthsBetween,
  ymToIndex,
} from "./period";

describe("period", () => {
  it("converte ano-mês em índice contínuo de meses", () => {
    expect(ymToIndex("2026-03")).toBe(2026 * 12 + 2);
  });

  it("calcula o índice do mês corrente a partir de uma data", () => {
    expect(currentMonthIndex(new Date(2026, 8, 15))).toBe(2026 * 12 + 8);
  });

  it("formata mês abreviado e intervalo com fim em aberto", () => {
    expect(formatYm("2026-03")).toBe("mar/2026");
    expect(formatPeriod("2022-07", "2025-09")).toBe("jul/2022 → set/2025");
    expect(formatPeriod("2026-03", null)).toBe("mar/2026 → atual");
  });

  it("formata duração com singular, plural e menos de um mês", () => {
    expect(formatDuration(44)).toBe("3 anos e 8 meses");
    expect(formatDuration(12)).toBe("1 ano");
    expect(formatDuration(1)).toBe("1 mês");
    expect(formatDuration(0)).toBe("menos de 1 mês");
  });

  it("conta meses até a referência quando o fim é nulo", () => {
    expect(monthsBetween("2026-03", null, ymToIndex("2026-09"))).toBe(6);
    expect(monthsBetween("2025-10", "2026-01", 0)).toBe(3);
  });
});
