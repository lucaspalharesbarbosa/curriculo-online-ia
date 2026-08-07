import Link from "next/link";

export const NAV_SECTIONS = [
  { id: "about", label: "Sobre" },
  { id: "experience", label: "Experiência" },
  { id: "education", label: "Formação" },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certificações" },
  { id: "projects", label: "Projetos" },
  { id: "contact", label: "Contato" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
      >
        <Link
          href="#about"
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Lucas Palhares Barbosa
        </Link>
        <ul className="flex w-full flex-wrap items-center justify-start gap-1 sm:w-auto sm:justify-end sm:gap-2">
          {NAV_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 sm:px-3 sm:text-sm dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
