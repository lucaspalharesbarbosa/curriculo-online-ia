"use client";

import { motion } from "framer-motion";
import {
  Download,
  Github,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Contact, Hero, SkillGroup } from "@/content/resume.schema";
import { deriveProfileBadges } from "@/lib/utils";

type ResumeSidebarProps = {
  hero: Hero;
  contact: Contact;
  skills: SkillGroup[];
};

export function ResumeSidebar({ hero, contact, skills }: ResumeSidebarProps) {
  const badges = deriveProfileBadges(hero.title);

  return (
    <aside className="w-full shrink-0 p-4 lg:w-[340px] lg:min-h-screen lg:p-6 xl:w-[380px]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="glass space-y-6 rounded-3xl p-6 lg:sticky lg:top-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <div className="relative mb-4 inline-block">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-accent-400 via-accent-500 to-accent-400 opacity-40 blur-xl" />
            <div className="relative h-28 w-28 rounded-full bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 p-[3px] lg:h-36 lg:w-36">
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

          <h1 className="gradient-text mb-1 text-xl font-bold lg:text-2xl">
            {hero.name}
          </h1>
          <p className="mb-3 text-sm font-medium text-accent-400">
            {hero.title}
          </p>

          {badges.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2">
              {badges.map((badge, index) => (
                <span
                  key={badge}
                  className={
                    index === 0
                      ? "rounded-full border border-accent-500/30 bg-accent-500/20 px-3 py-1 text-xs text-accent-300"
                      : "rounded-full border border-neutral-600/50 bg-neutral-700/50 px-3 py-1 text-xs text-neutral-300"
                  }
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            <Sparkles className="h-3 w-3 text-accent-400" />
            Contato
          </h2>

          {contact.email ? (
            <Link
              href={`mailto:${contact.email}`}
              className="glass-card group flex items-center gap-3 rounded-xl p-3"
            >
              <div className="rounded-lg bg-accent-500/20 p-2 text-accent-400 transition-colors group-hover:bg-accent-500/30">
                <Mail className="h-4 w-4" />
              </div>
              <span className="truncate text-xs text-neutral-300 transition-colors group-hover:text-white">
                {contact.email}
              </span>
            </Link>
          ) : null}

          {contact.whatsapp ? (
            <Link
              href={contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card group flex items-center gap-3 rounded-xl p-3"
            >
              <div className="rounded-lg bg-accent-500/20 p-2 text-accent-400 transition-colors group-hover:bg-accent-500/30">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="text-xs text-neutral-300 transition-colors group-hover:text-white">
                WhatsApp
              </span>
            </Link>
          ) : null}

          <div className="glass-card flex items-center gap-3 rounded-xl p-3">
            <div className="rounded-lg bg-neutral-700/50 p-2 text-neutral-300">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-xs text-neutral-300">{hero.location}</span>
          </div>
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
              className="glass-card group rounded-xl p-3 transition-all hover:border-accent-500/30 hover:bg-accent-500/10"
            >
              <Github className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-accent-400" />
            </Link>
          ) : null}
          <Link
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="glass-card group rounded-xl p-3 transition-all hover:border-accent-500/30 hover:bg-accent-500/10"
          >
            <Linkedin className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-accent-400" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            <Sparkles className="h-3 w-3 text-accent-400" />
            Habilidades Técnicas
          </h2>

          {skills.map((category, catIndex) => (
            <div key={category.category} className="space-y-2">
              <h3 className="text-xs font-medium text-accent-400">
                {category.category}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {category.items.map((skill, skillIndex) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.5 + catIndex * 0.1 + skillIndex * 0.02,
                    }}
                    className="skill-tag cursor-default rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-2.5 py-1 text-xs text-neutral-300 hover:border-accent-500/50 hover:bg-accent-500/10 hover:text-accent-300"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {contact.resumePdfUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <Link
              href={contact.resumePdfUrl}
              download
              className="neon-glow flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-400 via-accent-500 to-accent-400 bg-[length:200%_100%] py-3.5 text-sm font-medium text-neutral-900 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-lg hover:shadow-accent-500/25"
            >
              <Download className="h-4 w-4" />
              Download CV
            </Link>
          </motion.div>
        ) : null}
      </motion.div>
    </aside>
  );
}
