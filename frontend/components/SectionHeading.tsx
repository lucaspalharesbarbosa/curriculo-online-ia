import type { ReactNode } from "react";

type SectionHeadingProps = {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  /** Controle opcional à direita (ex.: chevron de collapse) */
  trailing?: ReactNode;
};

/** Cabeçalho visual compartilhado das seções — ícone geométrico + título. */
export function SectionHeading({
  id,
  title,
  subtitle,
  icon,
  trailing,
}: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        <div
          className="absolute inset-0 rotate-45 rounded-lg border border-accent-500/35 bg-accent-500/10"
          aria-hidden
        />
        <div className="relative text-accent-400">{icon}</div>
      </div>
      <div className="min-w-0 flex-1">
        <h2
          id={id}
          className="text-xl font-bold tracking-tight text-neutral-100"
        >
          {title}
        </h2>
        <p className="text-xs text-neutral-400">{subtitle}</p>
      </div>
      {trailing}
    </div>
  );
}
