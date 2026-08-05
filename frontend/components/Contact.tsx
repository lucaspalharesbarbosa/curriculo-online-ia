import type { Contact } from "@/content/resume.schema";

type ContactProps = {
  contact: Contact;
};

export function ContactSection({ contact }: ContactProps) {
  return (
    <section id="contact" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Contato
      </h2>
      <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <ul className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
          <li>
            <span className="font-medium">LinkedIn:</span>{" "}
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {contact.linkedin}
            </a>
          </li>
          {contact.email ? (
            <li>
              <span className="font-medium">E-mail:</span>{" "}
              <a
                href={`mailto:${contact.email}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {contact.email}
              </a>
            </li>
          ) : null}
          {contact.github ? (
            <li>
              <span className="font-medium">GitHub:</span>{" "}
              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {contact.github}
              </a>
            </li>
          ) : null}
        </ul>
        {contact.resumePdfUrl ? (
          <a
            href={contact.resumePdfUrl}
            download
            className="mt-5 inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Baixar currículo em PDF
          </a>
        ) : (
          <p className="mt-5 text-sm text-zinc-500 dark:text-zinc-400">
            PDF do currículo em breve.
          </p>
        )}
      </div>
    </section>
  );
}
