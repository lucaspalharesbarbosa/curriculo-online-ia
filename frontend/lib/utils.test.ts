import { describe, expect, it } from "vitest";

import { deriveProfileBadges, formatResumePeriod } from "./utils";

describe("deriveProfileBadges", () => {
  it("extrai até dois trechos do título separados por |", () => {
    expect(
      deriveProfileBadges("Tech Lead | Engenheiro de Software Sênior — AI"),
    ).toEqual(["Tech Lead", "Engenheiro de Software Sênior — AI"]);
  });
});

describe("formatResumePeriod", () => {
  it("usa Atual quando endDate é null", () => {
    expect(formatResumePeriod("2026-03", null)).toBe("2026-03 – Atual");
  });

  it("formata intervalo completo", () => {
    expect(formatResumePeriod("2022-07", "2025-09")).toBe("2022-07 – 2025-09");
  });
});
