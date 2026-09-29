"use client";

import {
  BookOpen,
  Calculator,
  Building2,
  Globe,
  Layers,
  Route,
  Search,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useId, useState } from "react";

import type { ChatToolCall } from "../lib/chat-client";
import { toolLabel } from "../lib/tool-results";

const TOOL_ICONS: Record<string, LucideIcon> = {
  calculate_experience: Calculator,
  find_technology: Layers,
  get_experience: Building2,
  career_timeline: Route,
  list_adrs: BookOpen,
  read_adr: BookOpen,
  search_resume: Search,
  search_web: Globe,
};

type ToolChipsProps = {
  tools: ChatToolCall[];
};

/** Um chip por tool usada; cada um expande o detalhe técnico (nome, argumentos, resultado). */
export function ToolChips({ tools }: ToolChipsProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (tools.length === 0) return null;

  const opened = openIndex === null ? null : tools[openIndex];

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap gap-1.5" aria-label="Ferramentas usadas">
        {tools.map((tool, index) => {
          const Icon = TOOL_ICONS[tool.name] ?? Wrench;
          const isOpen = openIndex === index;
          return (
            <li key={`${tool.name}-${index}`}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${baseId}-detalhe`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="tap-target inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border-subtle bg-surface-raised px-3 py-1 text-left font-mono text-xs text-muted transition-colors hover:border-accent hover:text-neutral-100 aria-expanded:border-accent aria-expanded:text-neutral-100"
              >
                <Icon size={13} aria-hidden />
                {toolLabel(tool.name)}
              </button>
            </li>
          );
        })}
      </ul>
      <div id={`${baseId}-detalhe`}>
        {opened ? (
          <div className="rounded-[10px] border border-border-subtle bg-surface-raised p-3 font-mono text-xs leading-relaxed text-muted">
            <p>
              <span className="text-accent">{opened.name}</span>
              <span className="sr-only"> (nome da ferramenta)</span>
            </p>
            <p className="mt-1 break-words">
              <span className="text-neutral-400">argumentos: </span>
              {JSON.stringify(opened.arguments)}
            </p>
            <pre
              tabIndex={0}
              aria-label={`Resultado de ${opened.name}`}
              className="mt-2 max-h-48 overflow-auto rounded-md bg-surface p-2 break-words whitespace-pre-wrap"
            >
              {opened.result}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}
