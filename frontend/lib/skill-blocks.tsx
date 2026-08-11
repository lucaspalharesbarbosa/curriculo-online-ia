"use client";

import type { ReactNode } from "react";

import type { SkillGroup, SkillItem } from "@/content/resume.schema";
import { getSkillIcon } from "@/lib/skill-icons";
import { formatSkillLevel } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SKILL_LEVEL_SEGMENTS = [1, 2, 3, 4, 5] as const;

export const SQL_CATEGORY = "Banco de Dados (SQL)";
export const NOSQL_CATEGORY = "Banco de Dados (NoSQL)";

type SkillChipProps = {
  skill: SkillItem;
  icon: ReactNode;
  compact?: boolean;
};

export function SkillChip({ skill, icon, compact = false }: SkillChipProps) {
  return (
    <div
      className={cn(
        "skill-tag type-chip flex cursor-default items-center gap-2 rounded-lg border border-neutral-700/50 bg-neutral-800/50 text-neutral-200 active:border-accent-500/50 active:bg-accent-500/10 active:text-accent-300 hover:border-accent-500/50 hover:bg-accent-500/10 hover:text-accent-300",
        compact ? "px-2 py-1.5" : "min-h-11 px-2.5 py-2",
      )}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-500/15 text-accent-300">
        {icon}
      </span>
      <span className="min-w-0 flex-1 leading-tight" title={skill.name}>
        {skill.name}
      </span>
      <span
        className="flex shrink-0 items-center gap-[3px]"
        role="img"
        aria-label={`Nível: ${formatSkillLevel(skill.level)}`}
        title={formatSkillLevel(skill.level)}
      >
        {SKILL_LEVEL_SEGMENTS.map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-[5px] w-2 rounded-full",
              segment <= skill.level
                ? "bg-gradient-to-r from-accent-400 to-accent-500"
                : "bg-neutral-700/60",
            )}
          />
        ))}
      </span>
    </div>
  );
}

export type SkillBlock = {
  key: string;
  title: string;
  body: ReactNode;
};

export function buildSkillBlocks(skills: SkillGroup[]): SkillBlock[] {
  const blocks: SkillBlock[] = [];

  skills.forEach((category) => {
    if (category.category === NOSQL_CATEGORY) {
      return;
    }

    if (category.category === SQL_CATEGORY) {
      const nosqlCategory = skills.find((c) => c.category === NOSQL_CATEGORY);
      blocks.push({
        key: "banco-de-dados",
        title: "Banco de Dados",
        body: (
          <div className="space-y-2">
            <div className="relative overflow-hidden rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-2.5 pt-3">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent-400 to-transparent" />
              <h4 className="type-label mb-2 text-neutral-400">
                Relacional (SQL)
              </h4>
              <div className="space-y-1.5">
                {category.items.map((skill) => {
                  const SkillIcon = getSkillIcon(skill.name);
                  return (
                    <SkillChip
                      key={skill.name}
                      skill={skill}
                      icon={<SkillIcon className="h-3.5 w-3.5" aria-hidden />}
                    />
                  );
                })}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-2.5 pt-3">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent-600 to-transparent" />
              <h4 className="type-label mb-2 text-neutral-400">
                Não-relacional (NoSQL)
              </h4>
              <div className="space-y-1.5">
                {(nosqlCategory?.items ?? []).map((skill) => {
                  const SkillIcon = getSkillIcon(skill.name);
                  return (
                    <SkillChip
                      key={skill.name}
                      skill={skill}
                      icon={<SkillIcon className="h-3.5 w-3.5" aria-hidden />}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ),
      });
      return;
    }

    blocks.push({
      key: category.category,
      title: category.category,
      body: (
        <div className="space-y-1.5">
          {category.items.map((skill) => {
            const SkillIcon = getSkillIcon(skill.name);
            return (
              <SkillChip
                key={skill.name}
                skill={skill}
                icon={<SkillIcon className="h-3.5 w-3.5" aria-hidden />}
              />
            );
          })}
        </div>
      ),
    });
  });

  return blocks;
}
