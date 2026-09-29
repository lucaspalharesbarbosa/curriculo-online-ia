import type { SkillGroup } from "@/content/resume.schema";

import { Reveal } from "./Reveal";
import { SectionTitle } from "./SectionTitle";

type SkillsSectionProps = {
  skills: SkillGroup[];
};

export function LevelDots({ level }: { level: number }) {
  return (
    <span
      className="inline-flex gap-0.5"
      role="img"
      aria-label={`nível ${level} de 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 w-1.5 rounded-full ${index < level ? "bg-accent" : "bg-border-subtle"}`}
        />
      ))}
    </span>
  );
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section
      id="stack"
      className="scroll-mt-20 px-4 py-12 sm:px-8"
      aria-labelledby="stack-titulo"
    >
      <SectionTitle
        id="stack-titulo"
        kicker="// stack"
        title="Matriz de habilidades"
      />
      <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {skills.map((group, index) => (
          <li key={group.category}>
            <Reveal
              delay={(index % 3) * 0.05}
              className="h-full rounded-[10px] border border-border-subtle bg-surface-raised p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-mono text-xs tracking-wider text-accent uppercase">
                  {group.category}
                </h3>
                <span className="font-mono text-[11px] text-muted">
                  {group.items.length}
                </span>
              </div>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="truncate">{item.name}</span>
                    <LevelDots level={item.level} />
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-xs text-muted">
        Nível = autoavaliação de 1 a 5, conforme o currículo.
      </p>
    </section>
  );
}
