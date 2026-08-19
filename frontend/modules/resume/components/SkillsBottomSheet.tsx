"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { buildSkillBlocks } from "@/modules/resume/lib/skill-blocks";
import type { SkillGroup } from "@/content/resume.schema";
import { useVisualViewportOffset } from "@/hooks/useVisualViewportOffset";

type SkillsBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  skills: SkillGroup[];
};

export function SkillsBottomSheet({
  open,
  onClose,
  skills,
}: SkillsBottomSheetProps) {
  const reduceMotion = useReducedMotion();
  const viewportOffset = useVisualViewportOffset();
  const blocks = buildSkillBlocks(skills);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key="skills-backdrop"
            type="button"
            aria-label="Fechar habilidades"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
            className="fixed inset-0 z-[220] bg-black/55 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
          <motion.div
            key="skills-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="skills-sheet-title"
            initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 36,
              mass: 0.85,
            }}
            style={{ bottom: viewportOffset }}
            className="fixed inset-x-0 z-[230] flex max-h-[min(88dvh,720px)] flex-col rounded-t-[1.75rem] border border-b-0 border-[#16324a] bg-[#060d16] shadow-[0_-20px_60px_rgba(0,0,0,0.55)] lg:hidden"
          >
            <div className="relative flex shrink-0 items-center justify-between gap-3 border-b border-[#16324a] px-4 pt-5 pb-3">
              <div
                className="absolute top-2.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-neutral-600/80"
                aria-hidden
              />
              <h2
                id="skills-sheet-title"
                className="font-display text-lg font-semibold tracking-tight text-neutral-50"
              >
                Habilidades
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#16324a] bg-[#0b1a28] text-neutral-300 active:bg-accent-500/15 active:text-accent-200"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
              {blocks.map((block) => (
                <div key={block.key}>
                  <h3 className="type-caption mb-2.5 font-semibold text-accent-400">
                    {block.title}
                  </h3>
                  {block.body}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
