import type { Experience } from "@/content/resume.schema";

function formatPeriod(startDate: string, endDate: string | null): string {
  const start = formatDateLabel(startDate);
  const end = endDate ? formatDateLabel(endDate) : "Atual";
  return `${start} — ${end}`;
}

function formatDateLabel(value: string): string {
  if (/^\d{4}$/.test(value)) {
    return value;
  }

  const [year, month] = value.split("-");
  const monthNames = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];
  const monthIndex = Number(month) - 1;

  if (monthIndex >= 0 && monthIndex < 12) {
    return `${monthNames[monthIndex]}/${year}`;
  }

  return value;
}

type ExperienceCardProps = {
  experience: Experience;
};

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {experience.role}
          </h3>
          <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
            {experience.company}
          </p>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {formatPeriod(experience.startDate, experience.endDate)}
        </p>
      </div>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {experience.location} · {experience.modality}
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {experience.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        {experience.technologies.map((technology) => (
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

type ExperienceSectionProps = {
  experiences: Experience[];
};

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <section id="experience" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Experiência Profissional
      </h2>
      <div className="space-y-4">
        {experiences.map((experience) => (
          <ExperienceCard
            key={`${experience.company}-${experience.role}-${experience.startDate}`}
            experience={experience}
          />
        ))}
      </div>
    </section>
  );
}
