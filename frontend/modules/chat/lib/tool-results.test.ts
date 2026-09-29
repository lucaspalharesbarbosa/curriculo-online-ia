import { describe, expect, it } from "vitest";

import {
  parseCalculateExperience,
  parseCareerTimeline,
  parseFindTechnology,
  parseGetExperience,
  parseToolResult,
  toolLabel,
} from "./tool-results";
import { FIXTURES } from "./tool-results.fixtures";

describe("toolLabel", () => {
  it("traduz cada tool conhecida e trata nome desconhecido", () => {
    expect(toolLabel("calculate_experience")).toBe("Calculou experiência");
    expect(toolLabel("find_technology")).toBe("Buscou tecnologia");
    expect(toolLabel("get_experience")).toBe("Consultou a empresa");
    expect(toolLabel("career_timeline")).toBe("Montou a linha do tempo");
    expect(toolLabel("list_adrs")).toBe("Leu as decisões de arquitetura");
    expect(toolLabel("read_adr")).toBe("Leu as decisões de arquitetura");
    expect(toolLabel("search_resume")).toBe("Consultou o currículo");
    expect(toolLabel("search_web")).toBe("Pesquisou na web");
    expect(toolLabel("nova_tool")).toBe("Usou uma ferramenta");
  });
});

describe("parseCalculateExperience", () => {
  it("extrai tecnologia, duração, total de meses e cargos considerados", () => {
    const parsed = parseCalculateExperience(FIXTURES.calculate);

    expect(parsed).toMatchObject({
      subject: "Python",
      durationLabel: "3 anos e 8 meses",
      totalMonths: 44,
    });
    expect(parsed?.roles).toEqual([
      {
        role: "Tech Lead | Senior Software Engineer",
        company: "Engineering Brasil",
        start: "2026-03",
        end: null,
      },
      {
        role: "Software Engineer",
        company: "Itaú Unibanco",
        start: "2022-07",
        end: "2025-09",
      },
    ]);
  });

  it("ignora o cargo cortado no fim do resultado", () => {
    const cut = FIXTURES.calculate.slice(0, FIXTURES.calculate.length - 30);

    const parsed = parseCalculateExperience(cut);

    expect(parsed?.roles).toHaveLength(1);
  });

  it("devolve null quando a tool não achou nada", () => {
    expect(
      parseCalculateExperience(
        "Nenhuma experiência profissional com 'Cobol' aparece no currículo.",
      ),
    ).toBeNull();
  });
});

describe("parseFindTechnology", () => {
  it("extrai uso profissional e os cargos", () => {
    const parsed = parseFindTechnology(FIXTURES.technology);

    expect(parsed?.technology).toBe("Kubernetes");
    expect(parsed?.usage).toEqual({
      jobCount: 2,
      durationLabel: "9 meses",
      totalMonths: 9,
    });
    expect(parsed?.roles.map((role) => role.company)).toEqual([
      "Banco BV",
      "Engineering Brasil",
    ]);
    expect(parsed?.roles[1].end).toBeNull();
  });

  it("aceita tecnologia sem cargo, só com skills e projetos", () => {
    const parsed = parseFindTechnology(
      [
        "Tecnologia 'Docker':",
        "- Uso profissional: nenhum cargo lista essa tecnologia.",
        "- Skills declaradas: DevOps: Docker (avançado).",
        "- Projetos: Currículo online.",
      ].join("\n"),
    );

    expect(parsed?.usage).toBeNull();
    expect(parsed?.notes).toEqual([
      "Skills declaradas: DevOps: Docker (avançado).",
      "Projetos: Currículo online.",
    ]);
  });

  it("devolve null para a mensagem de tecnologia inexistente", () => {
    expect(
      parseFindTechnology("Nenhum registro de 'Cobol' no currículo."),
    ).toBeNull();
  });
});

describe("parseGetExperience", () => {
  it("extrai cargo, período, local e tecnologias", () => {
    const parsed = parseGetExperience(FIXTURES.company);

    expect(parsed).toHaveLength(1);
    expect(parsed?.[0]).toMatchObject({
      company: "Banco BV",
      role: "Senior Software Engineer (Outsourcing)",
      start: "2025-10",
      end: "2026-01",
      location: "São Paulo, SP (Remoto)",
    });
    expect(parsed?.[0].technologies).toContain("Kubernetes");
    expect(parsed?.[0].technologies).toContain("Google Cloud Platform (GKE)");
  });

  it("separa vários cargos da mesma empresa", () => {
    const second = FIXTURES.company
      .replace("Senior Software Engineer (Outsourcing)", "Tech Lead")
      .replace("2025-10 a 2026-01", "2026-03 a o momento");

    const parsed = parseGetExperience(`${FIXTURES.company}\n\n${second}`);

    expect(parsed).toHaveLength(2);
    expect(parsed?.[1].end).toBeNull();
  });

  it("devolve null quando a empresa não consta", () => {
    expect(
      parseGetExperience("Empresa 'X' não consta no currículo."),
    ).toBeNull();
  });
});

describe("parseCareerTimeline", () => {
  it("extrai as 8 posições em ordem", () => {
    const parsed = parseCareerTimeline(FIXTURES.timeline);

    expect(parsed?.entries).toHaveLength(8);
    expect(parsed?.entries[0]).toMatchObject({
      order: 1,
      company: "Grupo WDG",
      role: "Junior Web Developer",
      start: "2015-11",
      end: "2016-08",
      place: "São José do Rio Preto, SP (Presencial)",
    });
    expect(parsed?.entries[6].role).toBe(
      "Senior Software Engineer (Outsourcing)",
    );
    expect(parsed?.entries[7].end).toBeNull();
    expect(parsed?.around).toBeNull();
  });

  it("extrai quem veio antes e depois quando há around", () => {
    const parsed = parseCareerTimeline(
      `${FIXTURES.timeline}\n${FIXTURES.around}`,
    );

    expect(parsed?.around).toEqual({
      company: "Itaú Unibanco",
      before: "Shift (Web Developer, 2021-07 a 2022-07)",
      after:
        "Banco BV (Senior Software Engineer (Outsourcing), 2025-10 a 2026-01)",
    });
  });

  it("devolve null para texto fora do formato", () => {
    expect(parseCareerTimeline("qualquer coisa")).toBeNull();
  });
});

describe("parseToolResult", () => {
  it("despacha para o parser de cada tool", () => {
    expect(
      parseToolResult("calculate_experience", FIXTURES.calculate)?.kind,
    ).toBe("experience");
    expect(parseToolResult("find_technology", FIXTURES.technology)?.kind).toBe(
      "technology",
    );
    expect(parseToolResult("get_experience", FIXTURES.company)?.kind).toBe(
      "company",
    );
    expect(parseToolResult("career_timeline", FIXTURES.timeline)?.kind).toBe(
      "timeline",
    );
  });

  it("devolve null para tool sem card e para formato desconhecido", () => {
    expect(parseToolResult("search_resume", "- [skills] texto")).toBeNull();
    expect(parseToolResult("calculate_experience", "formato novo")).toBeNull();
  });
});
