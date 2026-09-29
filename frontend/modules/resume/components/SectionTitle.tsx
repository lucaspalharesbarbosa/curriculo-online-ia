type SectionTitleProps = {
  id: string;
  kicker: string;
  title: string;
};

export function SectionTitle({ id, kicker, title }: SectionTitleProps) {
  return (
    <div className="mb-5 border-b border-border-subtle pb-3">
      <p className="font-mono text-xs tracking-widest text-accent uppercase">
        {kicker}
      </p>
      <h2
        id={id}
        className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        {title}
      </h2>
    </div>
  );
}
