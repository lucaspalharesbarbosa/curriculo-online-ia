import { Download, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";

import type { Contact } from "@/content/resume.schema";

type ContactLinksProps = {
  contact: Contact;
  className?: string;
};

/** Ícones de contato (LinkedIn, GitHub, WhatsApp, e-mail), cada um com nome acessível. */
export function ContactLinks({ contact, className = "" }: ContactLinksProps) {
  const items: { href: string; label: string; icon: ReactNode }[] = [
    {
      href: contact.linkedin,
      label: "LinkedIn",
      icon: <FaLinkedin size={16} aria-hidden />,
    },
  ];
  if (contact.github) {
    items.push({
      href: contact.github,
      label: "GitHub",
      icon: <FaGithub size={16} aria-hidden />,
    });
  }
  if (contact.whatsapp) {
    items.push({
      href: contact.whatsapp,
      label: "WhatsApp",
      icon: <FaWhatsapp size={16} aria-hidden />,
    });
  }
  if (contact.email) {
    items.push({
      href: `mailto:${contact.email}`,
      label: "E-mail",
      icon: <Mail size={16} aria-hidden />,
    });
  }

  return (
    <ul className={`flex items-center gap-1 ${className}`}>
      {items.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            target={item.href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer"
            aria-label={item.label}
            title={item.label}
            className="tap-target flex h-11 w-11 items-center justify-center rounded-full text-neutral-100 transition hover:-translate-y-0.5 hover:bg-surface-raised"
          >
            {item.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}

type PdfLinkProps = {
  href: string | null;
  className?: string;
};

export function PdfLink({ href, className = "" }: PdfLinkProps) {
  if (!href) return null;
  return (
    <a
      href={href}
      download
      className={`tap-target inline-flex min-h-11 items-center gap-2 rounded-full border border-border-subtle px-5 text-sm font-semibold text-neutral-100 transition hover:-translate-y-0.5 hover:bg-surface-raised ${className}`}
    >
      <Download size={16} aria-hidden /> Baixar CV (PDF)
    </a>
  );
}
