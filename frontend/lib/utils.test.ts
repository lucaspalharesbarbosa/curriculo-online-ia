import { describe, expect, it } from "vitest";

import resumeContent from "@/content/resume.json";
import {
  formatResumePeriod,
  formatYear,
  getExperienceHighlightKind,
  groupCertificationsByIssuer,
  groupExperiencesByCompany,
  parseHeroTitle,
  splitAboutNarrative,
} from "./utils";

describe("parseHeroTitle", () => {
  it("divide cargos (antes do —) e informações complementares (depois do —), cada lado por |", () => {
    expect(
      parseHeroTitle(
        "Tech Lead | Senior Software Engineer — AI Engineering | Agentic AI | Java • Python | AWS Certified",
      ),
    ).toEqual({
      primary: ["Tech Lead", "Senior Software Engineer"],
      secondary: [
        "AI Engineering",
        "Agentic AI",
        "Java • Python",
        "AWS Certified",
      ],
    });
  });

  it("usa só o lado dos cargos quando não há —", () => {
    expect(parseHeroTitle("Tech Lead | Engenheiro de Software Sênior")).toEqual(
      {
        primary: ["Tech Lead", "Engenheiro de Software Sênior"],
        secondary: [],
      },
    );
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

describe("formatYear", () => {
  it("extrai só o ano de uma data AAAA-MM", () => {
    expect(formatYear("2024-07")).toBe("2024");
  });
});

describe("groupExperiencesByCompany", () => {
  it("mantém empresas diferentes em grupos separados", () => {
    const groups = groupExperiencesByCompany([
      {
        company: "Engineering Brasil",
        role: "Tech Lead",
        startDate: "2026-03",
        endDate: null,
        location: "São Paulo, SP",
        modality: "Remoto",
        highlights: ["h1"],
        technologies: ["Python"],
        logoUrl: "/engineeringbr_logo.jpg",
      },
      {
        company: "Banco BV",
        role: "Senior Software Engineer",
        startDate: "2025-10",
        endDate: "2026-01",
        location: "São Paulo, SP",
        modality: "Remoto",
        highlights: ["h2"],
        technologies: ["Java"],
        logoUrl: null,
      },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].roles).toHaveLength(1);
    expect(groups[1].roles).toHaveLength(1);
  });

  it("agrupa cargos consecutivos na mesma empresa (promoção) num único grupo/logo", () => {
    const groups = groupExperiencesByCompany([
      {
        company: "WebPic",
        role: "Web Developer",
        startDate: "2018-05",
        endDate: "2020-09",
        location: "São José do Rio Preto, SP",
        modality: "Presencial",
        highlights: ["h1"],
        technologies: ["C#"],
        logoUrl: "/grupowebpic_logo.jpg",
      },
      {
        company: "WebPic",
        role: "Junior Web Developer",
        startDate: "2016-11",
        endDate: "2018-05",
        location: "São José do Rio Preto, SP",
        modality: "Presencial",
        highlights: ["h2"],
        technologies: ["C#"],
        logoUrl: "/grupowebpic_logo.jpg",
      },
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].logoUrl).toBe("/grupowebpic_logo.jpg");
    expect(groups[0].roles.map((role) => role.role)).toEqual([
      "Web Developer",
      "Junior Web Developer",
    ]);
  });

  it("não agrupa a mesma empresa quando as passagens não são consecutivas", () => {
    const groups = groupExperiencesByCompany([
      {
        company: "Shift",
        role: "Web Developer",
        startDate: "2021-07",
        endDate: "2022-07",
        location: "São José do Rio Preto, SP",
        modality: "Presencial",
        highlights: ["h1"],
        technologies: ["Java"],
        logoUrl: "/shift_logo.jpg",
      },
      {
        company: "Itaú Unibanco",
        role: "Software Engineer",
        startDate: "2022-07",
        endDate: "2025-09",
        location: "São Paulo, SP",
        modality: "Remoto",
        highlights: ["h2"],
        technologies: ["Java"],
        logoUrl: "/itau_logo.jpg",
      },
      {
        company: "Shift",
        role: "Junior Web Developer",
        startDate: "2020-09",
        endDate: "2021-07",
        location: "São José do Rio Preto, SP",
        modality: "Presencial",
        highlights: ["h3"],
        technologies: ["Java"],
        logoUrl: "/shift_logo.jpg",
      },
    ]);

    expect(groups).toHaveLength(3);
  });
});

describe("groupCertificationsByIssuer", () => {
  it("agrupa certificações do mesmo emissor, mais recente primeiro", () => {
    const groups = groupCertificationsByIssuer([
      {
        name: "Formação Angular",
        issuer: "Alura",
        issuedAt: "2021-03",
        expiresAt: null,
        logoUrl: "/alura-logo.png",
        credentialUrl: null,
      },
      {
        name: "SOLID com Java",
        issuer: "Alura",
        issuedAt: "2022-03",
        expiresAt: null,
        logoUrl: null,
        credentialUrl: null,
      },
      {
        name: "AWS Certified Cloud Practitioner",
        issuer: "AWS",
        issuedAt: "2024-07",
        expiresAt: "2027-07",
        logoUrl: "/aws-logo.png",
        credentialUrl: null,
      },
    ]);

    expect(groups).toHaveLength(2);
    const alura = groups.find((group) => group.issuer === "Alura");
    expect(alura?.logoUrl).toBe("/alura-logo.png");
    expect(alura?.items.map((item) => item.name)).toEqual([
      "SOLID com Java",
      "Formação Angular",
    ]);
  });
});

describe("splitAboutNarrative", () => {
  it("separa lead, corpo e ênfases entre travessões", () => {
    expect(
      splitAboutNarrative(
        "Lead aqui. Corpo com AI Engineering — Context Engineering, Agentic AI — no ciclo.",
      ),
    ).toEqual({
      lead: "Lead aqui.",
      body: "Corpo com AI Engineering no ciclo.",
      accents: ["Context Engineering", "Agentic AI"],
    });
  });

  it("sem travessão: lead e corpo pela primeira sentença, sem ênfases", () => {
    expect(
      splitAboutNarrative("Lead sem travessão. Corpo normal aqui."),
    ).toEqual({
      lead: "Lead sem travessão.",
      body: "Corpo normal aqui.",
      accents: [],
    });
  });

  it("sem nenhum terminador de frase: tudo vira lead, corpo nulo", () => {
    expect(splitAboutNarrative("Só uma frase sem ponto final")).toEqual({
      lead: "Só uma frase sem ponto final",
      body: null,
      accents: [],
    });
  });

  it("múltiplos travessões: só o primeiro par vira ênfase, os demais ficam no corpo", () => {
    expect(
      splitAboutNarrative("Lead aqui. Primeiro — A, B — meio — C, D — fim."),
    ).toEqual({
      lead: "Lead aqui.",
      body: "Primeiro meio — C, D — fim.",
      accents: ["A", "B"],
    });
  });

  it("produz o mesmo resultado para o about real de content/resume.json", () => {
    const about = (resumeContent as { about: string }).about;

    const result = splitAboutNarrative(about);

    expect(result.accents).toEqual([
      "Context Engineering",
      "Prompt Engineering",
      "Harness Engineering",
      "Agentic AI",
      "Spec-Driven Development (SDD)",
    ]);
    expect(result.lead).toBe(
      "Tech Lead e Senior Software Engineer com mais de 10 anos de experiência desenvolvendo soluções escaláveis para grandes empresas dos setores bancário, telecomunicações e saúde.",
    );
    expect(result.body).toContain(
      "aplicando práticas de AI Engineering na construção de AI Agents",
    );
    expect(result.body).not.toContain("—");
  });
});

describe("getExperienceHighlightKind", () => {
  it("classifica PRAD, mérito e padrão", () => {
    expect(
      getExperienceHighlightKind("Reconhecido por Alto Desempenho (2023)"),
    ).toBe("prad");
    expect(getExperienceHighlightKind("Reconhecimento de Mérito (2024)")).toBe(
      "merit",
    );
    expect(getExperienceHighlightKind("Entreguei o MVP")).toBe("default");
  });
});
