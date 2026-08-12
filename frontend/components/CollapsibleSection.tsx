"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { SectionHeading } from "@/components/SectionHeading";
import { cn } from "@/lib/utils";

type CollapsibleSectionProps = {
  headingId: string;
  /** Âncora para nav mobile / scroll-spy */
  sectionId?: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  defaultOpen?: boolean;
  /** Classe do orbe decorativo de fundo */
  orbClassName?: string;
  children: ReactNode;
};

export function CollapsibleSection({
  headingId,
  sectionId,
  title,
  subtitle,
  icon,
  defaultOpen = true,
  orbClassName,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <section id={sectionId} aria-labelledby={headingId} className="scroll-mt-4">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -32px 0px" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="glass relative overflow-hidden rounded-3xl p-5 sm:p-6 lg:p-8"
      >
        {orbClassName ? (
          <div className={cn("pointer-events-none absolute", orbClassName)} />
        ) : null}

        <div className="relative z-10">
          <button
            type="button"
            className="group -m-1 flex min-h-12 w-full items-center rounded-2xl p-1 text-left transition-colors hover:bg-accent-500/5 active:bg-accent-500/10 focus-visible:bg-accent-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            <SectionHeading
              id={headingId}
              title={title}
              subtitle={subtitle}
              icon={icon}
              trailing={
                <span
                  className={cn(
                    "ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-900/40 text-neutral-400 transition-all duration-300 group-hover:border-accent-500/40 group-hover:text-accent-400",
                    open && "border-accent-500/30 text-accent-400",
                  )}
                  aria-hidden
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      open && "rotate-180",
                    )}
                  />
                </span>
              }
            />
          </button>

          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                id={panelId}
                key="panel"
                initial={
                  reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
                }
                animate={
                  reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }
                }
                exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0.15 : 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="overflow-hidden"
              >
                <div className="pt-6">{children}</div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
