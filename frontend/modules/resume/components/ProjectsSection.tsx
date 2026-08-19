"use client";

import { ExternalLink, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { CollapsibleSection } from "@/modules/resume/components/CollapsibleSection";
import { LinkButton } from "@/modules/resume/components/LinkButton";
import type { Article, Project } from "@/content/resume.schema";

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

export function ProjectsSection({ projects, articles }: ProjectsSectionProps) {
  if (projects.length === 0 && articles.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection
      headingId="projects-heading"
      sectionId="destaques"
      title="Destaques"
      subtitle="Projetos e Artigos Publicados"
      icon={<Sparkles className="h-5 w-5" aria-hidden />}
      orbClassName="top-1/2 left-0 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 blur-3xl max-md:opacity-40"
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
            className="project-card glass-card group flex flex-col rounded-2xl p-4 sm:p-5"
          >
            <span className="project-kind-badge mb-3 w-fit self-start border-accent-500/30 bg-accent-500/15 text-accent-400">
              Projeto
            </span>

            <h3 className="type-item-title mb-3 transition-colors group-hover:text-accent-400">
              {project.title}
            </h3>

            <p className="type-body mb-4 flex-1">{project.description}</p>

            <div className="mt-auto flex flex-col gap-4">
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

              <LinkButton
                href={project.repositoryUrl}
                label="Ver repositório"
                icon={<ExternalLink className="h-3.5 w-3.5" aria-hidden />}
                ariaLabel={`Ver repositório de ${project.title}`}
              />
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
            className="project-card glass-card group flex flex-col rounded-2xl border border-dashed border-accent-500/30 p-4 sm:p-5"
          >
            <span className="project-kind-badge mb-3 w-fit self-start border-dashed border-accent-500/35 bg-transparent text-accent-400">
              Artigo
            </span>

            <h3 className="type-item-title mb-3 transition-colors group-hover:text-accent-400">
              {article.title}
            </h3>

            <p className="type-body mb-4 flex-1">{article.description}</p>

            <div className="mt-auto flex flex-col gap-4">
              <span className="type-chip w-fit rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-2 py-1">
                {article.source}
              </span>

              <LinkButton
                href={article.url}
                label="Ler artigo"
                icon={<ExternalLink className="h-3.5 w-3.5" aria-hidden />}
                ariaLabel={`Ler artigo ${article.title}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
