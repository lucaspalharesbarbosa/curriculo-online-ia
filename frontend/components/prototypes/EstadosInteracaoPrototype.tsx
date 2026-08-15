"use client";

import { Minimize2 } from "lucide-react";

function VariantLabel({ name }: { name: string }) {
  return <p className="mb-2 font-mono text-xs text-accent-400">{name}</p>;
}

function Frame({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-700/60 bg-black/20 p-5">
      <div className="flex items-center gap-4">{children}</div>
      <p className="mt-4 text-xs text-neutral-500">{hint}</p>
    </div>
  );
}

/** Botão de minimizar — atual vs. com anel de foco (focus-visible). */
function MinimizeCurrent() {
  return (
    <button
      type="button"
      aria-label="Minimizar chat"
      title="Minimizar"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--assist-line)] bg-[#0c2233] text-accent-200 transition-colors hover:border-accent-500/40 hover:bg-[#0f2a3d] hover:text-accent-100 active:scale-[0.97] active:bg-[#123247]"
    >
      <Minimize2 className="h-4 w-4" aria-hidden />
    </button>
  );
}

function MinimizeProposed() {
  return (
    <button
      type="button"
      aria-label="Minimizar chat"
      title="Minimizar"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--assist-line)] bg-[#0c2233] text-accent-200 transition-colors hover:border-accent-500/40 hover:bg-[#0f2a3d] hover:text-accent-100 active:scale-[0.97] active:bg-[#123247] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
    >
      <Minimize2 className="h-4 w-4" aria-hidden />
    </button>
  );
}

export function EstadosInteracaoPrototype() {
  return (
    <main className="min-h-screen bg-[#03070d] px-4 py-10 text-neutral-100 sm:px-8">
      <div className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-2">
          <p className="font-mono text-xs tracking-widest text-accent-400 uppercase">
            Protótipo — descartável, robots: noindex
          </p>
          <h1 className="text-2xl font-bold">
            Preview — foco por teclado e efeito de clique
          </h1>
          <p className="text-sm text-neutral-400">
            Não são variantes pra escolher — é o mesmo ajuste dos dois lados, só
            que &ldquo;Atual&rdquo; ainda não tem e &ldquo;Proposto&rdquo; já
            tem. Interaja de verdade: passe o mouse, clique e segure, e use Tab
            pra navegar até o botão e ver o foco.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-50">
            1. Botão de minimizar do chat
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <VariantLabel name="Atual" />
              <Frame hint="Clique e segure: já tem efeito de pressionado. Dê Tab até aqui: contorno azul padrão do navegador.">
                <MinimizeCurrent />
              </Frame>
            </div>
            <div>
              <VariantLabel name="Proposto (+ anel de foco)" />
              <Frame hint="Igual ao atual, mas dando Tab até aqui aparece o anel sutil com a cor de destaque do site, em vez do contorno azul do navegador.">
                <MinimizeProposed />
              </Frame>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-50">
            2. Botão de link (Educação / Certificações / Destaques)
          </h2>
          <p className="text-sm text-neutral-400">
            <span className="text-accent-400">Decidido: aplicado.</span> O
            `LinkButton` de produção já ganhou o efeito de pressionado
            (`active:scale-0.97`) e o anel de foco.
          </p>
        </section>
      </div>
    </main>
  );
}
