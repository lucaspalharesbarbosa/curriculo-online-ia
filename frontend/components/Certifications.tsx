import type { Certification } from "@/content/resume.schema";

type CertificationsProps = {
  items: Certification[];
};

function formatMonthYear(value: string): string {
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

export function Certifications({ items }: CertificationsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section id="certifications" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Certificações
      </h2>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.name}
            className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {item.name}
            </h3>
            <p className="text-base text-zinc-700 dark:text-zinc-300">
              {item.issuer}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Emitido em {formatMonthYear(item.issuedAt)}
              {item.expiresAt
                ? ` · Expira em ${formatMonthYear(item.expiresAt)}`
                : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
