"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Cpu,
  Download,
  FileText,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { RoleTypewriter } from "@/components/RoleTypewriter";
import { SkillsBottomSheet } from "@/components/SkillsBottomSheet";
import type { Contact, Hero, SkillGroup } from "@/content/resume.schema";
import { parseHeroTitle } from "@/lib/utils";

type MobileHeroProps = {
  hero: Hero;
  contact: Contact;
  skills: SkillGroup[];
};

export function MobileHero({ hero, contact, skills }: MobileHeroProps) {
  const [skillsOpen, setSkillsOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { primary: primaryRoles, secondary: secondaryInfo } = parseHeroTitle(
    hero.title,
  );

  return (
    <>
      <header className="relative isolate overflow-hidden px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-5 lg:hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -top-24 left-1/2 h-56 w-[120%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.18),transparent_65%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,14,0)_0%,rgba(4,8,14,0.85)_70%,var(--background)_100%)]" />
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-start gap-4"
        >
          <div className="relative shrink-0">
            <div
              className="absolute -inset-1 rounded-full opacity-70"
              style={{
                background:
                  "conic-gradient(from 200deg, transparent, var(--accent-500), transparent 55%)",
              }}
              aria-hidden
            />
            <div className="relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full border-2 border-accent-500/40 bg-surface shadow-[0_0_28px_rgba(56,189,248,0.25)]">
              {hero.photoUrl ? (
                <Image
                  src={hero.photoUrl}
                  alt={hero.name}
                  width={72}
                  height={72}
                  className="h-full w-full object-cover object-top"
                  priority
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-lg font-bold text-accent-400"
                  aria-hidden
                >
                  {hero.name
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="mb-1 text-xs font-medium tracking-[0.14em] text-accent-400/90 uppercase">
              Currículo
            </p>
            <h1 className="font-display text-[1.65rem] leading-[1.1] font-semibold tracking-tight text-neutral-50">
              <span className="gradient-text">{hero.name}</span>
            </h1>
            {primaryRoles.length > 0 ? (
              <div className="mt-1.5">
                <RoleTypewriter
                  lines={primaryRoles}
                  className="type-item-accent font-medium"
                />
              </div>
            ) : null}
            {secondaryInfo.length > 0 ? (
              <p className="mt-1 text-xs text-neutral-500">
                {secondaryInfo.join(" · ")}
              </p>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 grid grid-cols-4 gap-2"
        >
          {contact.whatsapp ? (
            <Link
              href={contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl border border-[#16324a] bg-[#0a1520]/90 text-accent-200 active:scale-[0.97] active:border-accent-500/40"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              <span className="text-xs font-medium">WhatsApp</span>
            </Link>
          ) : null}
          {contact.email ? (
            <Link
              href={`mailto:${contact.email}`}
              className="tap-target flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl border border-[#16324a] bg-[#0a1520]/90 text-accent-200 active:scale-[0.97] active:border-accent-500/40"
            >
              <Mail className="h-4 w-4" aria-hidden />
              <span className="text-xs font-medium">E-mail</span>
            </Link>
          ) : null}
          <Link
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl border border-[#16324a] bg-[#0a1520]/90 text-accent-200 active:scale-[0.97] active:border-accent-500/40"
          >
            <Linkedin className="h-4 w-4" aria-hidden />
            <span className="text-xs font-medium">LinkedIn</span>
          </Link>
          {contact.github ? (
            <Link
              href={contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl border border-[#16324a] bg-[#0a1520]/90 text-accent-200 active:scale-[0.97] active:border-accent-500/40"
            >
              <Github className="h-4 w-4" aria-hidden />
              <span className="text-xs font-medium">GitHub</span>
            </Link>
          ) : null}
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 flex flex-col gap-2.5"
        >
          {contact.resumePdfUrl ? (
            <Link
              href={contact.resumePdfUrl}
              download
              className="tap-target group relative flex min-h-12 w-full items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-accent-300 via-accent-500 to-accent-600 p-1.5 shadow-[0_12px_32px_rgba(56,189,248,0.28)] active:scale-[0.98]"
            >
              <span
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_35%,rgba(255,255,255,0.28)_50%,transparent_65%)] bg-[length:220%_100%] bg-[-80%_0]"
                aria-hidden
              />
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950/18 text-neutral-950 ring-1 ring-neutral-950/10">
                <Download className="h-5 w-5" strokeWidth={2.25} aria-hidden />
              </span>
              <span className="relative flex min-w-0 flex-1 flex-col items-start py-1 pr-2">
                <span className="text-sm font-semibold tracking-tight text-neutral-950">
                  Baixar CV em PDF
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-950/75">
                  <FileText className="h-3 w-3" aria-hidden />
                  Currículo completo
                </span>
              </span>
            </Link>
          ) : null}

          <button
            type="button"
            onClick={() => setSkillsOpen(true)}
            className="tap-target inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1e3a52] bg-[#071018]/80 px-4 text-sm font-medium text-neutral-300 active:border-accent-500/40 active:text-accent-200"
          >
            <Cpu className="h-4 w-4 text-accent-400" aria-hidden />
            Ver habilidades técnicas
          </button>
        </motion.div>
      </header>

      <SkillsBottomSheet
        open={skillsOpen}
        onClose={() => setSkillsOpen(false)}
        skills={skills}
      />
    </>
  );
}
