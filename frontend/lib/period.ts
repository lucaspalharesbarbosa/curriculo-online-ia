/**
 * Datas do currículo no formato "AAAA-MM" (mês corrido) e duração em português.
 * Genérico o bastante para ser usado pelo domínio `resume` e pelo `chat`
 * (cards das tools), sem um depender do outro.
 */

const MONTHS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** "2026-03" vira um índice contínuo de meses (ano * 12 + mês - 1). */
export function ymToIndex(ym: string): number {
  const [year, month] = ym.split("-").map(Number);
  return year * 12 + (month - 1);
}

/** Índice de meses do mês corrente. */
export function currentMonthIndex(now: Date = new Date()): number {
  return now.getFullYear() * 12 + now.getMonth();
}

/** "2026-03" vira "mar/2026". */
export function formatYm(ym: string): string {
  const [year, month] = ym.split("-").map(Number);
  return `${MONTHS[month - 1]}/${year}`;
}

/** Intervalo curto para exibição: "mar/2026 → atual". */
export function formatPeriod(start: string, end: string | null): string {
  return `${formatYm(start)} → ${end ? formatYm(end) : "atual"}`;
}

/** 44 vira "3 anos e 8 meses". */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "ano" : "anos"}`);
  if (rest > 0) parts.push(`${rest} ${rest === 1 ? "mês" : "meses"}`);
  return parts.join(" e ") || "menos de 1 mês";
}

/** Meses entre dois "AAAA-MM"; fim nulo conta até `refIndex`. */
export function monthsBetween(
  start: string,
  end: string | null,
  refIndex: number,
): number {
  return (end ? ymToIndex(end) : refIndex) - ymToIndex(start);
}
