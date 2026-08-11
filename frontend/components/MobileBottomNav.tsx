"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Award,
  BriefcaseBusiness,
  GraduationCap,
  ScanFace,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";

import { MOBILE_NAV_SECTIONS, type MobileNavSectionId } from "@/lib/mobile-nav";
import { cn } from "@/lib/utils";

const ICONS: Record<
  MobileNavSectionId,
  ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  perfil: ScanFace,
  experiencia: BriefcaseBusiness,
  educacao: GraduationCap,
  certificacoes: Award,
  reconhecimentos: Trophy,
  destaques: Sparkles,
};

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const media = (query: string) => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  el.scrollIntoView({
    behavior:
      media("(prefers-reduced-motion: reduce)") || media("(max-width: 1023px)")
        ? "auto"
        : "smooth",
    block: "start",
  });
}

export function MobileBottomNav() {
  const [active, setActive] = useState<MobileNavSectionId>("perfil");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const nodes = MOBILE_NAV_SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((node): node is HTMLElement => Boolean(node));

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          );
        const top = visible[0];
        if (!top?.target.id) return;
        const id = top.target.id as MobileNavSectionId;
        if (MOBILE_NAV_SECTIONS.some((s) => s.id === id)) {
          setActive((current) => (current === id ? current : id));
        }
      },
      {
        root: null,
        rootMargin: "-18% 0px -62% 0px",
        threshold: 0.2,
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Seções do currículo"
      className="mobile-dock fixed inset-x-0 bottom-0 z-[180] lg:hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-full h-10 bg-gradient-to-t from-[rgba(4,8,14,0.95)] to-transparent" />
      <div className="border-t border-[#16324a]/80 bg-[#04080e]/92 px-1 pt-1.5 backdrop-blur-md pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
          {MOBILE_NAV_SECTIONS.map((section) => {
            const Icon = ICONS[section.id];
            const isActive = active === section.id;
            return (
              <li key={section.id} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setActive(section.id);
                    scrollToSection(section.id);
                  }}
                  className={cn(
                    "tap-target relative flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[11px] font-medium transition-colors",
                    isActive
                      ? "text-accent-300"
                      : "text-neutral-500 active:text-neutral-300",
                  )}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={section.label}
                >
                  <AnimatePresence>
                    {isActive ? (
                      <motion.span
                        layoutId={reduceMotion ? undefined : "mobile-nav-pill"}
                        className="absolute inset-x-1 inset-y-1 -z-10 rounded-xl bg-accent-500/12 ring-1 ring-accent-500/25"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    ) : null}
                  </AnimatePresence>
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="truncate">{section.short}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
