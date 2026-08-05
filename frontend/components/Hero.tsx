import type { Hero as HeroData } from "@/content/resume.schema";

type HeroProps = {
  hero: HeroData;
  about: string;
};

export function Hero({ hero, about }: HeroProps) {
  return (
    <section id="about" className="scroll-mt-20 space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {hero.location}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          {hero.name}
        </h1>
        <p className="max-w-3xl text-lg text-zinc-700 dark:text-zinc-300">
          {hero.title}
        </p>
        <p className="max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
          {hero.summary}
        </p>
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sobre
        </h2>
        <p className="max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
          {about}
        </p>
      </div>
    </section>
  );
}
