import type { Project } from "@/content/resume.schema";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        <a
          href={project.repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {project.title}
        </a>
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.technologies.map((technology) => (
          <span
            key={technology}
            className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {technology}
          </span>
        ))}
      </div>
    </article>
  );
}

type ProjectsSectionProps = {
  projects: Project[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section id="projects" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Projetos / Portfólio
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
