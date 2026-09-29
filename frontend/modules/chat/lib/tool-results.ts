/**
 * Metadados e parsers das tools do backend (ADR-018).
 *
 * O backend devolve o resultado de cada tool como texto (formato estável, em
 * `backend/app/tools`). Os parsers abaixo extraem dados estruturados desse
 * texto só para desenhar cards. São funções puras e defensivas: qualquer
 * formato não reconhecido (ou resultado cortado no meio) devolve `null` e a
 * UI cai no bloco de detalhe simples, sem quebrar.
 */

export const TOOL_LABELS: Record<string, string> = {
  calculate_experience: "Calculou experiência",
  find_technology: "Buscou tecnologia",
  get_experience: "Consultou a empresa",
  career_timeline: "Montou a linha do tempo",
  list_adrs: "Leu as decisões de arquitetura",
  read_adr: "Leu as decisões de arquitetura",
  search_resume: "Consultou o currículo",
  search_web: "Pesquisou na web",
};

/** Rótulo amigável da tool; nome desconhecido (tool nova no backend) não quebra a UI. */
export function toolLabel(name: string): string {
  return TOOL_LABELS[name] ?? "Usou uma ferramenta";
}

export type ToolPeriod = { start: string; end: string | null };

export type ToolRole = ToolPeriod & {
  role: string;
  company: string;
};

export type ExperienceResult = {
  subject: string;
  durationLabel: string;
  totalMonths: number;
  roles: ToolRole[];
};

export type TechnologyResult = {
  technology: string;
  /** `null` quando nenhum cargo lista a tecnologia. */
  usage: {
    jobCount: number;
    durationLabel: string;
    totalMonths: number;
  } | null;
  roles: ToolRole[];
  /** Linhas extras ("Skills declaradas", "Projetos") em texto livre. */
  notes: string[];
};

export type CompanyResult = {
  company: string;
  role: string;
  start: string;
  end: string | null;
  location: string | null;
  technologies: string[];
};

export type TimelineEntry = ToolPeriod & {
  order: number;
  company: string;
  role: string;
  place: string;
};

export type TimelineResult = {
  entries: TimelineEntry[];
  /** Presente quando a tool foi chamada com `around`. */
  around: { company: string; before: string; after: string } | null;
};

export type ToolCardData =
  | { kind: "experience"; data: ExperienceResult }
  | { kind: "technology"; data: TechnologyResult }
  | { kind: "company"; data: CompanyResult[] }
  | { kind: "timeline"; data: TimelineResult };

const END_NOW = "o momento";

function toEnd(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === END_NOW ? null : trimmed;
}

/** "Cargo na Empresa (2022-07 a 2025-09)" -> partes. Ignora trechos cortados. */
const ROLE_AT_COMPANY =
  /^(.+) na (.+) \((\d{4}-\d{2}) a (\d{4}-\d{2}|o momento)\)$/;

function parseRoleAtCompany(text: string): ToolRole | null {
  const match = ROLE_AT_COMPANY.exec(text.trim());
  if (!match) return null;
  return {
    role: match[1],
    company: match[2],
    start: match[3],
    end: toEnd(match[4]),
  };
}

const EXPERIENCE_HEAD =
  /^Experiência profissional com '(.+?)': (.+?) \(total de (\d+) meses/;

export function parseCalculateExperience(
  result: string,
): ExperienceResult | null {
  const head = EXPERIENCE_HEAD.exec(result.trim());
  if (!head) return null;
  const marker = "Cargos considerados:";
  const at = result.indexOf(marker);
  const roles: ToolRole[] = [];
  if (at >= 0) {
    const list = result
      .slice(at + marker.length)
      .trim()
      .replace(/\.$/, "");
    for (const part of list.split(";")) {
      const role = parseRoleAtCompany(part);
      if (role) roles.push(role);
    }
  }
  return {
    subject: head[1],
    durationLabel: head[2],
    totalMonths: Number(head[3]),
    roles,
  };
}

const TECH_HEAD = /^Tecnologia '(.+?)':/;
const TECH_USAGE =
  /^- Uso profissional: (\d+) cargo\(s\), (.+?) no total \((\d+) meses/;

export function parseFindTechnology(result: string): TechnologyResult | null {
  const lines = result.split("\n");
  const head = TECH_HEAD.exec(lines[0]?.trim() ?? "");
  if (!head) return null;

  let usage: TechnologyResult["usage"] = null;
  const roles: ToolRole[] = [];
  const notes: string[] = [];
  for (const line of lines.slice(1)) {
    const usageMatch = TECH_USAGE.exec(line.trim());
    if (usageMatch) {
      usage = {
        jobCount: Number(usageMatch[1]),
        durationLabel: usageMatch[2],
        totalMonths: Number(usageMatch[3]),
      };
    } else if (line.startsWith("  - ")) {
      const role = parseRoleAtCompany(line.slice(4));
      if (role) roles.push(role);
    } else if (
      line.startsWith("- ") &&
      !line.startsWith("- Uso profissional:")
    ) {
      notes.push(line.slice(2).trim());
    }
  }
  if (!usage && notes.length === 0) return null;
  return { technology: head[1], usage, roles, notes };
}

function field(block: string, label: string): string | null {
  const match = new RegExp(`^\\s*${label}: (.+)$`, "m").exec(block);
  return match ? match[1].trim() : null;
}

export function parseGetExperience(result: string): CompanyResult[] | null {
  const blocks = result
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.startsWith("Empresa:"));
  const entries: CompanyResult[] = [];
  for (const block of blocks) {
    const company = field(block, "Empresa");
    const role = field(block, "Cargo");
    const period = /^\s*Período: (\d{4}-\d{2}) a (\d{4}-\d{2}|o momento)/m.exec(
      block,
    );
    if (!company || !role || !period) continue;
    const technologies = field(block, "Tecnologias usadas");
    entries.push({
      company,
      role,
      start: period[1],
      end: toEnd(period[2]),
      location: field(block, "Local"),
      technologies: technologies
        ? technologies
            .split(", ")
            .map((tech) => tech.trim())
            .filter(Boolean)
        : [],
    });
  }
  return entries.length > 0 ? entries : null;
}

const TIMELINE_LINE =
  /^(\d+)\. (.+?): (.+) \((\d{4}-\d{2}) a (\d{4}-\d{2}|o momento)\), (.+)$/;
const AROUND_HEAD = /^Sobre (.+):$/;

export function parseCareerTimeline(result: string): TimelineResult | null {
  const lines = result.split("\n").map((line) => line.trim());
  const entries: TimelineEntry[] = [];
  for (const line of lines) {
    const match = TIMELINE_LINE.exec(line);
    if (!match) continue;
    entries.push({
      order: Number(match[1]),
      company: match[2],
      role: match[3],
      start: match[4],
      end: toEnd(match[5]),
      place: match[6],
    });
  }
  if (entries.length === 0) return null;

  let around: TimelineResult["around"] = null;
  const aroundAt = lines.findIndex((line) => AROUND_HEAD.test(line));
  if (aroundAt >= 0) {
    const company = AROUND_HEAD.exec(lines[aroundAt])?.[1] ?? "";
    const before = lines
      .find((line) => line.startsWith("- Imediatamente antes:"))
      ?.replace("- Imediatamente antes:", "")
      .trim();
    const after = lines
      .find((line) => line.startsWith("- Imediatamente depois:"))
      ?.replace("- Imediatamente depois:", "")
      .trim();
    around = { company, before: before ?? "", after: after ?? "" };
  }
  return { entries, around };
}

/** Escolhe o parser da tool e devolve os dados do card, ou `null` para o fallback. */
export function parseToolResult(
  name: string,
  result: string,
): ToolCardData | null {
  switch (name) {
    case "calculate_experience": {
      const data = parseCalculateExperience(result);
      return data ? { kind: "experience", data } : null;
    }
    case "find_technology": {
      const data = parseFindTechnology(result);
      return data ? { kind: "technology", data } : null;
    }
    case "get_experience": {
      const data = parseGetExperience(result);
      return data ? { kind: "company", data } : null;
    }
    case "career_timeline": {
      const data = parseCareerTimeline(result);
      return data ? { kind: "timeline", data } : null;
    }
    default:
      return null;
  }
}
