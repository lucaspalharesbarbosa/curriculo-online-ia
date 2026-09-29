"use client";

import { MapPin } from "lucide-react";

import {
  currentMonthIndex,
  formatDuration,
  formatPeriod,
  monthsBetween,
} from "@/lib/period";

import type { ChatToolCall } from "../lib/chat-client";
import {
  parseToolResult,
  type CompanyResult,
  type ExperienceResult,
  type TechnologyResult,
  type TimelineResult,
  type ToolRole,
} from "../lib/tool-results";

const CARD =
  "rounded-2xl border border-border-subtle bg-surface-raised p-4 shadow-[0_8px_24px_rgba(0,0,0,0.25)]";
const CAPTION = "text-xs text-muted";
const BIG_NUMBER =
  "mt-1 font-display text-3xl leading-tight font-semibold text-accent";

function RoleBars({
  roles,
  refIndex,
}: {
  roles: ToolRole[];
  refIndex: number;
}) {
  const rows = roles.map((role) => ({
    role,
    months: monthsBetween(role.start, role.end, refIndex),
  }));
  const max = Math.max(1, ...rows.map((row) => row.months));
  return (
    <ul className="mt-3 space-y-3">
      {rows.map(({ role, months }) => (
        <li key={`${role.company}-${role.start}`} className="text-xs">
          <div className="mb-1 flex justify-between gap-2">
            <span className="min-w-0">
              <span className="font-medium text-neutral-100">
                {role.company}
              </span>
              <span className="block text-muted">
                {role.role.split("|")[0].trim()} ·{" "}
                {formatPeriod(role.start, role.end)}
              </span>
            </span>
            <span className="shrink-0 text-muted">
              {formatDuration(months)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-border-subtle" aria-hidden>
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${(months / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ExperienceCard({
  data,
  refIndex,
}: {
  data: ExperienceResult;
  refIndex: number;
}) {
  return (
    <div className={CARD}>
      <p className={CAPTION}>Experiência com {data.subject} (cálculo exato)</p>
      <p className={BIG_NUMBER}>{data.durationLabel}</p>
      <p className="font-mono text-xs text-muted">
        {data.totalMonths} meses, sem contar períodos sobrepostos duas vezes
      </p>
      {data.roles.length > 0 ? (
        <>
          <p className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">
            Cargos considerados
          </p>
          <RoleBars roles={data.roles} refIndex={refIndex} />
        </>
      ) : null}
    </div>
  );
}

function TechnologyCard({
  data,
  refIndex,
}: {
  data: TechnologyResult;
  refIndex: number;
}) {
  return (
    <div className={CARD}>
      <p className={CAPTION}>Onde aparece {data.technology}</p>
      {data.usage ? (
        <>
          <p className={BIG_NUMBER}>{data.usage.durationLabel}</p>
          <p className="font-mono text-xs text-muted">
            {data.usage.jobCount}{" "}
            {data.usage.jobCount === 1 ? "cargo" : "cargos"} · uso profissional
          </p>
          {data.roles.length > 0 ? (
            <RoleBars roles={data.roles} refIndex={refIndex} />
          ) : null}
        </>
      ) : (
        <p className="mt-1 text-sm text-neutral-100">
          Nenhum cargo lista essa tecnologia.
        </p>
      )}
      {data.notes.length > 0 ? (
        <ul className="mt-3 space-y-1 border-t border-border-subtle pt-3 text-xs text-muted">
          {data.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const MAX_TECH_CHIPS = 10;

function CompanyCard({ entry }: { entry: CompanyResult }) {
  const extra = entry.technologies.length - MAX_TECH_CHIPS;
  return (
    <div className={CARD}>
      <p className="font-semibold text-neutral-100">{entry.company}</p>
      <p className="text-sm text-accent-400">{entry.role}</p>
      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
        <span>{formatPeriod(entry.start, entry.end)}</span>
        {entry.location ? (
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} aria-hidden /> {entry.location}
          </span>
        ) : null}
      </p>
      {entry.technologies.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tecnologias">
          {entry.technologies.slice(0, MAX_TECH_CHIPS).map((tech) => (
            <li
              key={tech}
              className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-neutral-100"
            >
              {tech}
            </li>
          ))}
          {extra > 0 ? (
            <li className="rounded-full px-2 py-0.5 text-xs text-muted">
              +{extra}
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

/** Empresas na ordem devolvida pela tool; cargos seguidos na mesma empresa viram um só item. */
function groupByCompany(timeline: TimelineResult) {
  const groups: { company: string; entries: TimelineResult["entries"] }[] = [];
  for (const entry of timeline.entries) {
    const last = groups.at(-1);
    if (last && last.company === entry.company) {
      last.entries.push(entry);
    } else {
      groups.push({ company: entry.company, entries: [entry] });
    }
  }
  return groups;
}

function TimelineCard({ data }: { data: TimelineResult }) {
  const groups = groupByCompany(data);
  return (
    <div className={CARD}>
      <p className={CAPTION}>Da mais antiga para a mais recente</p>
      <ol className="mt-3 space-y-3 border-l border-border-subtle pl-4">
        {groups.map((group, index) => {
          const isLast = index === groups.length - 1;
          const isAround = data.around?.company === group.company;
          return (
            <li
              key={`${group.company}-${index}`}
              className="relative text-sm"
              aria-current={isAround ? "true" : undefined}
            >
              <span
                aria-hidden
                className={`absolute top-1.5 -left-[1.3125rem] h-2.5 w-2.5 rounded-full ${
                  isAround || (!data.around && isLast)
                    ? "bg-accent shadow-[0_0_0_4px_var(--accent-soft)]"
                    : "bg-border-subtle"
                }`}
              />
              <p className="leading-snug font-semibold text-neutral-100">
                {group.company}
              </p>
              <ul className="text-xs leading-snug text-muted">
                {group.entries.map((entry) => (
                  <li key={`${entry.order}`}>
                    {entry.role} · {formatPeriod(entry.start, entry.end)}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
      {data.around ? (
        <dl className="mt-4 space-y-1 border-t border-border-subtle pt-3 text-xs text-muted">
          <div>
            <dt className="inline font-semibold text-neutral-100">
              Antes de {data.around.company}:{" "}
            </dt>
            <dd className="inline">{data.around.before}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-neutral-100">
              Depois de {data.around.company}:{" "}
            </dt>
            <dd className="inline">{data.around.after}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}

type ToolCardsProps = {
  tools: ChatToolCall[];
};

/** Cards ricos das tools que têm parser; formato desconhecido é ignorado (o detalhe fica no chip). */
export default function ToolCards({ tools }: ToolCardsProps) {
  const refIndex = currentMonthIndex();
  const cards = tools.flatMap((tool, index) => {
    const parsed = parseToolResult(tool.name, tool.result);
    if (!parsed) return [];
    const key = `${tool.name}-${index}`;
    switch (parsed.kind) {
      case "experience":
        return [
          <ExperienceCard key={key} data={parsed.data} refIndex={refIndex} />,
        ];
      case "technology":
        return [
          <TechnologyCard key={key} data={parsed.data} refIndex={refIndex} />,
        ];
      case "company":
        return parsed.data.map((entry, entryIndex) => (
          <CompanyCard key={`${key}-${entryIndex}`} entry={entry} />
        ));
      case "timeline":
        return [<TimelineCard key={key} data={parsed.data} />];
    }
  });
  if (cards.length === 0) return null;
  return <div className="flex flex-col gap-3">{cards}</div>;
}
