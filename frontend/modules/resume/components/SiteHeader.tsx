import type { Contact } from "@/content/resume.schema";

import { ContactLinks } from "./ContactLinks";

export const SECTION_NAV = [
  { href: "#trajetoria", label: "Trajetória" },
  { href: "#stack", label: "Stack" },
  { href: "#projetos", label: "Projetos" },
  { href: "#formacao", label: "Formação" },
] as const;

type SiteHeaderProps = {
  contact: Contact;
};

export function SiteHeader({ contact }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border-subtle bg-background/85 px-4 backdrop-blur sm:px-8">
      <span className="font-mono text-sm font-semibold text-accent">
        lucas@cv:~$
      </span>
      <nav
        aria-label="Seções do currículo"
        className="ml-auto hidden items-center gap-1 md:flex"
      >
        {SECTION_NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="tap-target rounded-md px-3 py-2 text-sm text-muted transition hover:bg-surface-raised hover:text-neutral-100"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <ContactLinks contact={contact} className="ml-auto md:ml-2" />
    </header>
  );
}
