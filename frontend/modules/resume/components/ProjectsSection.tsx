import { FaGithub } from "react-icons/fa";

import type { Article, Project } from "@/content/resume.schema";

import { Reveal } from "./Reveal";
import { SectionTitle } from "./SectionTitle";

type ProjectsSectionProps = {
  projects: Project[];
  articles: Article[];
};

const CARD = "rounded-[10px] border border-border-subtle bg-surface-raised p-5";

export function ProjectsSection({ projects, articles }: ProjectsSectionProps) {
  return (
    <section
      id="projetos"
      className="scroll-mt-20 px-4 py-12 sm:px-8"
      aria-labelledby="projetos-titulo"
    >
      <SectionTitle
        id="projetos-titulo"
        kicker="// projetos"
        title="Projetos e artigos"
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {projects.map((project) => (
          <Reveal key={project.title} className={`${CARD} lg:col-span-2`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="font-display text-xl font-semibold">
                {project.title}
              </h3>
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="tap-target inline-flex min-h-11 items-center gap-2 rounded-full border border-border-subtle px-4 text-sm font-medium hover:bg-surface"
              >
                <FaGithub aria-hidden /> Repositório
                <span className="sr-only"> de {project.title}</span>
              </a>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              {project.description}
            </p>
            <ul
              className="mt-3 flex flex-wrap gap-1.5"
              aria-label="Tecnologias"
            >
              {project.technologies.map((tech) => (
                <li
                  key={tech}
                  className="rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[11px]"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
        {articles.map((article) => (
          <Reveal key={article.url} className={CARD}>
            <p className="font-mono text-[11px] tracking-wider text-accent uppercase">
              artigo · {article.source}
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-base font-semibold underline-offset-4 hover:underline"
            >
              {article.title}
            </a>
            <p className="mt-1 text-sm text-muted">{article.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
