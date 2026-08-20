"use client";

import { motion } from "framer-motion";
import {
  AtSign,
  Cpu,
  Download,
  Github,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { RoleTypewriter } from "@/modules/resume/components/RoleTypewriter";
import type { Contact, Hero, SkillGroup } from "@/content/resume.schema";
import { buildSkillBlocks } from "@/modules/resume/lib/skill-blocks";
import { buildGoogleMapsUrl, parseHeroTitle } from "@/lib/utils";

type ResumeSidebarProps = {
  hero: Hero;
  contact: Contact;
  skills: SkillGroup[];
};

export function ResumeSidebar({ hero, contact, skills }: ResumeSidebarProps) {
  const { primary: primaryRoles, secondary: secondaryInfo } = parseHeroTitle(
    hero.title,
  );
  const skillBlocks = buildSkillBlocks(skills);

  return (
    <aside className="hidden w-full shrink-0 p-3 sm:p-4 lg:block lg:w-[340px] lg:min-h-screen lg:p-6 xl:w-[380px]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="glass space-y-5 rounded-3xl p-5 sm:space-y-6 sm:p-6 lg:sticky lg:top-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <div className="relative mb-4 inline-block">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-accent-400 via-accent-500 to-accent-400 opacity-40 blur-xl" />
            <div
              className="spin-slow absolute -inset-1.5 rounded-full opacity-70"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, var(--accent-500) 90deg, transparent 180deg, var(--accent-400) 270deg, transparent 360deg)",
              }}
              aria-hidden
            />
            <div className="pulse-glow relative h-28 w-28 rounded-full bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 p-[3px] transition-transform duration-300 hover:scale-105 lg:h-36 lg:w-36">
              {hero.photoUrl ? (
                <Image
                  src={hero.photoUrl}
                  alt={hero.name}
                  width={144}
                  height={144}
                  className="h-full w-full rounded-full object-cover object-top bg-surface"
                  priority
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center rounded-full bg-surface text-2xl font-bold text-accent-400"
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

          <h1 className="type-section-title font-display gradient-text glow-text mb-2">
            {hero.name}
          </h1>

          {primaryRoles.length > 0 ? (
            <div className="mb-2 flex flex-col items-center">
              <RoleTypewriter
                lines={primaryRoles}
                className="type-item-accent gradient-text font-semibold"
              />
            </div>
          ) : null}

          {secondaryInfo.length > 0 ? (
            <p className="type-label mb-3 text-neutral-500">
              {secondaryInfo.join(" · ")}
            </p>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="type-sidebar-heading flex items-center gap-2">
            <AtSign className="h-3.5 w-3.5 text-accent-400" aria-hidden />
            Contato
          </h2>

          {contact.email ? (
            <Link
              href={`mailto:${contact.email}`}
              className="glass-card group flex min-h-11 items-center gap-3 rounded-xl p-3 active:scale-[0.99]"
            >
              <div className="rounded-lg bg-accent-500/20 p-2 text-accent-400 transition-colors group-hover:bg-accent-500/30">
                <Mail className="h-4 w-4" />
              </div>
              <span className="type-sidebar-link truncate transition-colors group-hover:text-white">
                {contact.email}
              </span>
            </Link>
          ) : null}

          {contact.whatsapp ? (
            <Link
              href={contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card group flex min-h-11 items-center gap-3 rounded-xl p-3 active:scale-[0.99]"
            >
              <div className="rounded-lg bg-accent-500/20 p-2 text-accent-400 transition-colors group-hover:bg-accent-500/30">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="type-sidebar-link transition-colors group-hover:text-white">
                WhatsApp
              </span>
            </Link>
          ) : null}

          <Link
            href={buildGoogleMapsUrl(hero.location)}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card group flex min-h-11 items-center gap-3 rounded-xl p-3 active:scale-[0.99]"
          >
            <div className="rounded-lg bg-accent-500/20 p-2 text-accent-400 transition-colors group-hover:bg-accent-500/30">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="type-sidebar-link transition-colors group-hover:text-white">
              {hero.location}
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex justify-center gap-3"
        >
          {contact.github ? (
            <Link
              href={contact.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="glass-card group flex h-11 w-11 items-center justify-center rounded-xl transition-all hover:border-accent-500/30 hover:bg-accent-500/10"
            >
              <Github className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-accent-400" />
            </Link>
          ) : null}
          <Link
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="glass-card group flex h-11 w-11 items-center justify-center rounded-xl transition-all hover:border-accent-500/30 hover:bg-accent-500/10"
          >
            <Linkedin className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-accent-400" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-3"
        >
          <h2 className="type-sidebar-heading flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-accent-400" aria-hidden />
            Habilidades Técnicas
          </h2>

          <div className="flex flex-col gap-4" data-testid="skills-layout">
            {skillBlocks.map((block) => (
              <div key={block.key}>
                <h3 className="type-caption mb-1.5 font-semibold text-accent-400">
                  {block.title}
                </h3>
                {block.body}
              </div>
            ))}
          </div>
        </motion.div>

        {contact.resumePdfUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <a
              href={contact.resumePdfUrl}
              download
              className="group relative flex min-h-12 w-full items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-accent-300 via-accent-500 to-accent-600 p-1.5 shadow-[0_12px_32px_rgba(56,189,248,0.28)] transition-[transform,box-shadow] duration-300 hover:scale-[1.015] hover:shadow-[0_16px_40px_rgba(56,189,248,0.4)] active:scale-[0.99] focus-visible:outline-offset-4"
            >
              <span
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_35%,rgba(255,255,255,0.28)_50%,transparent_65%)] bg-[length:220%_100%] bg-[-80%_0] transition-[background-position] duration-700 group-hover:bg-[120%_0]"
                aria-hidden
              />
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-950/18 text-neutral-950 ring-1 ring-neutral-950/10">
                <Download className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="relative flex min-w-0 flex-1 flex-col items-start py-1.5 pr-2">
                <span className="text-sm font-semibold tracking-tight text-neutral-950 sm:text-[15px]">
                  Baixar CV
                </span>
                <span className="text-xs font-medium text-neutral-950/75">
                  PDF · currículo completo
                </span>
              </span>
            </a>
          </motion.div>
        ) : null}
      </motion.div>
    </aside>
  );
}
