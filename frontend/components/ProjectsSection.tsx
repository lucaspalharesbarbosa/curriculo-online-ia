"use client";

import { motion } from "framer-motion";
import { Folder, Github, Sparkles } from "lucide-react";
import Link from "next/link";

import type { Project } from "@/content/resume.schema";

type ProjectsSectionProps = {
  projects: Project[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (projects.length === 0) {
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
                Trabalhos Recentes e Contribuições
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="project-card glass-card group rounded-2xl p-5"
              >
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-bold text-neutral-100 transition-colors group-hover:text-accent-400">
                    {project.title}
                  </h3>
                  <Link
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Repositório de ${project.title}`}
                    className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-2 transition-all hover:border-accent-500/30 hover:bg-accent-500/20"
                  >
                    <Github className="h-4 w-4 text-neutral-400 transition-colors hover:text-accent-400" />
                  </Link>
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
          </div>
        </div>
      </motion.div>
    </section>
  );
}
