import type { Education } from "@/content/resume.schema";

type EducationProps = {
  items: Education[];
};

export function EducationSection({ items }: EducationProps) {
  return (
    <section id="education" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Formação Acadêmica
      </h2>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={`${item.institution}-${item.degree}`}
            className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {item.degree}
            </h3>
            <p className="text-base text-zinc-700 dark:text-zinc-300">
              {item.institution}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {item.startDate} — {item.endDate}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
