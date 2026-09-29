import { SectionTitle } from "./SectionTitle";

type AboutSectionProps = {
  about: string;
};

export function AboutSection({ about }: AboutSectionProps) {
  const paragraphs = about
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section
      id="sobre"
      className="scroll-mt-20 px-4 py-12 sm:px-8"
      aria-labelledby="sobre-titulo"
    >
      <SectionTitle id="sobre-titulo" kicker="// sobre" title="Perfil" />
      <div className="max-w-3xl space-y-4 text-base leading-relaxed text-muted">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
