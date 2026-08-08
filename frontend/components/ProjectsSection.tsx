"use client";

import { Github, Hexagon, Newspaper } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { CollapsibleSection } from "@/components/CollapsibleSection";
import type { Article, Project } from "@/content/resume.schema";

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
    <CollapsibleSection
      headingId="projects-heading"
      title="Destaques"
      subtitle="Projetos e Artigos Publicados"
      icon={<Hexagon className="h-5 w-5" aria-hidden />}
      orbClassName="top-1/2 left-0 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl"
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {projects.map((project, index) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={cardEntranceTransition(index * 0.1)}
            whileHover={cardHover}
            className="project-card glass-card group rounded-2xl p-4 sm:p-5"
          >
            <span className="type-label mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/15 px-2.5 py-1 text-accent-400">
              Projeto
            </span>
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="type-item-title transition-colors group-hover:text-accent-400">
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

            <p className="type-body mb-4">{project.description}</p>

            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="type-chip rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-2 py-1 transition-colors hover:border-accent-500/30 hover:text-accent-300"
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
            transition={cardEntranceTransition((projects.length + index) * 0.1)}
            whileHover={cardHover}
            className="project-card glass-card group rounded-2xl border border-dashed border-accent-500/30 p-4 sm:p-5"
          >
            <span className="type-label mb-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-accent-500/40 bg-transparent px-2.5 py-1 text-accent-400">
              Artigo
            </span>
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="type-item-title transition-colors group-hover:text-accent-400">
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

            <p className="type-body mb-4">{article.description}</p>

            <span className="type-chip inline-block rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-2 py-1">
              {article.source}
            </span>
          </motion.div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
