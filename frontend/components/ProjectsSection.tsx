"use client";

import { motion } from "framer-motion";
import { Folder, Github, Newspaper, Sparkles } from "lucide-react";
import Link from "next/link";

import type { Article, Project } from "@/content/resume.schema";

// Wrapper motion do `next/link` — definido fora do componente para não ser
// recriado a cada render (evita remount/perda de estado de animação).
const MotionLink = motion.create(Link);

type ProjectsSectionProps = {
  projects: Project[];
  articles: Article[];
};

const cardEntranceTransition = (delay: number) => ({
  duration: 0.45,
  delay,
  ease: [0.16, 1, 0.3, 1] as const,
});

const cardHover = { y: -4, scale: 1.015 };
const cardHoverTransition = { duration: 0.2, ease: "easeOut" as const };

export function ProjectsSection({ projects, articles }: ProjectsSectionProps) {
  if (projects.length === 0 && articles.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="projects-heading">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass relative overflow-hidden rounded-3xl p-6 lg:p-8"
      >
        <div className="absolute top-1/2 left-0 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-accent-500/20 p-3 text-accent-400">
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="projects-heading"
                className="flex items-center gap-2 text-xl font-bold text-neutral-100"
              >
                Destaques
                <Sparkles className="h-4 w-4 text-accent-400" />
              </h2>
              <p className="text-xs text-neutral-400">
                Projetos e Artigos Publicados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={cardEntranceTransition(index * 0.1)}
                whileHover={cardHover}
                className="project-card glass-card group rounded-2xl p-5"
              >
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/15 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-accent-400 uppercase">
                  <Folder className="h-3 w-3" />
                  Projeto
                </span>
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-bold text-neutral-100 transition-colors group-hover:text-accent-400">
                    {project.title}
                  </h3>
                  <MotionLink
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Repositório de ${project.title}`}
                    whileHover={{ scale: 1.1 }}
                    transition={cardHoverTransition}
                    className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-2 transition-all hover:border-accent-500/30 hover:bg-accent-500/20"
                  >
                    <Github className="h-4 w-4 text-neutral-400 transition-colors hover:text-accent-400" />
                  </MotionLink>
                </div>

                <p className="mb-4 text-sm text-neutral-400">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-2 py-1 text-xs text-neutral-300 transition-colors hover:border-accent-500/30 hover:text-accent-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}

            {articles.map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={cardEntranceTransition(
                  (projects.length + index) * 0.1,
                )}
                whileHover={cardHover}
                className="project-card glass-card group rounded-2xl border border-dashed border-accent-500/30 p-5"
              >
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-accent-500/40 bg-transparent px-2.5 py-1 text-[10px] font-semibold tracking-wide text-accent-400 uppercase">
                  <Newspaper className="h-3 w-3" />
                  Artigo
                </span>
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-bold text-neutral-100 transition-colors group-hover:text-accent-400">
                    {article.title}
                  </h3>
                  <MotionLink
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ler artigo ${article.title}`}
                    whileHover={{ scale: 1.1 }}
                    transition={cardHoverTransition}
                    className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-2 transition-all hover:border-accent-500/30 hover:bg-accent-500/20"
                  >
                    <Newspaper className="h-4 w-4 text-neutral-400 transition-colors hover:text-accent-400" />
                  </MotionLink>
                </div>

                <p className="mb-4 text-sm text-neutral-400">
                  {article.description}
                </p>

                <span className="inline-block rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-2 py-1 text-xs text-neutral-300">
                  {article.source}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
