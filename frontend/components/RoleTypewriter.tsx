"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type RoleTypewriterProps = {
  /** Cada cargo em uma linha (ex.: Tech Lead / Senior Software Engineer). */
  lines: string[];
  className?: string;
};

const TYPE_MS = 48;
const DELETE_MS = 32;
const HOLD_MS = 1800;
const GAP_MS = 500;
const LINE_PAUSE_MS = 220;

type Phase = "typing" | "holding" | "deleting" | "gap";

function normalizeLines(lines: string[]): string[] {
  return lines.map((line) => line.trim()).filter(Boolean);
}

/**
 * Prompt de terminal em pilha: `>_` na 1ª linha; linhas seguintes com conector.
 * Escreve / apaga linha a linha em loop. Com prefers-reduced-motion, mostra tudo estático.
 */
export function RoleTypewriter({ lines, className = "" }: RoleTypewriterProps) {
  const reduceMotion = useReducedMotion();
  const safeLines = normalizeLines(lines);
  const linesKey = safeLines.join("\0");
  const label = safeLines.join(" e ");
  const [visibleChars, setVisibleChars] = useState<number[]>(() =>
    safeLines.map(() => 0),
  );
  const [caretLine, setCaretLine] = useState(0);

  useEffect(() => {
    if (reduceMotion || safeLines.length === 0) {
      return;
    }

    let cancelled = false;
    let timeoutId = 0;
    let lineIndex = 0;
    let phase: Phase = "typing";
    const lengths = safeLines.map((line) => line.length);
    let chars = lengths.map(() => 0);

    const paint = () => {
      setVisibleChars([...chars]);
      setCaretLine(lineIndex);
    };

    const schedule = (fn: () => void, ms: number) => {
      timeoutId = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const tick = () => {
      if (cancelled) return;

      if (phase === "gap") {
        chars = lengths.map(() => 0);
        lineIndex = 0;
        paint();
        phase = "typing";
        schedule(tick, TYPE_MS);
        return;
      }

      if (phase === "typing") {
        const target = lengths[lineIndex] ?? 0;
        if (chars[lineIndex] < target) {
          chars[lineIndex] += 1;
          paint();
          schedule(tick, TYPE_MS);
          return;
        }
        if (lineIndex < safeLines.length - 1) {
          lineIndex += 1;
          paint();
          schedule(tick, LINE_PAUSE_MS);
          return;
        }
        phase = "holding";
        schedule(tick, HOLD_MS);
        return;
      }

      if (phase === "holding") {
        phase = "deleting";
        lineIndex = safeLines.length - 1;
        paint();
        schedule(tick, TYPE_MS);
        return;
      }

      if (chars[lineIndex] > 0) {
        chars[lineIndex] -= 1;
        paint();
        schedule(tick, DELETE_MS);
        return;
      }
      if (lineIndex > 0) {
        lineIndex -= 1;
        paint();
        schedule(tick, LINE_PAUSE_MS);
        return;
      }
      phase = "gap";
      schedule(tick, GAP_MS);
    };

    schedule(tick, GAP_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [reduceMotion, linesKey]);

  const displayChars = reduceMotion
    ? safeLines.map((line) => line.length)
    : visibleChars;

  if (safeLines.length === 0) {
    return null;
  }

  return (
    <div
      className={`role-type-stack inline-flex max-w-full flex-col items-center ${className}`}
      aria-label={label}
    >
      {safeLines.map((line, index) => {
        const count = displayChars[index] ?? 0;
        const shown = line.slice(0, count);
        const showCaret = reduceMotion
          ? index === safeLines.length - 1
          : index === caretLine;

        return (
          <p
            key={`${index}-${line}`}
            className="role-type-line inline-flex max-w-full items-baseline gap-1.5 font-mono"
          >
            <span
              className={
                index === 0
                  ? "shrink-0 text-accent-400"
                  : "shrink-0 text-accent-400/40"
              }
              aria-hidden
            >
              {index === 0 ? ">_" : "·"}
            </span>
            <span className="role-type-loop min-w-0 truncate text-left">
              {shown}
              {showCaret ? (
                <span className="role-type-caret" aria-hidden>
                  |
                </span>
              ) : null}
            </span>
          </p>
        );
      })}
    </div>
  );
}
