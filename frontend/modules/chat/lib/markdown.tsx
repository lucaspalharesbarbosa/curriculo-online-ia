import type { ReactNode } from "react";

/**
 * Renderizador mínimo de markdown para as respostas do assistente.
 *
 * O LLM responde com `**negrito**`, `*itálico*`, `` `código` ``, listas e links.
 * Sem renderizar, o visitante via os asteriscos literais. Cobre só esse
 * subconjunto, sem dependência nova (payload da home, US-08-10) e sem
 * `dangerouslySetInnerHTML`: tudo vira elemento React, então HTML na resposta
 * é exibido como texto, nunca interpretado. Links só aceitam http(s).
 */

type Block =
  | { kind: "paragraph"; lines: string[] }
  | { kind: "unordered"; items: string[] }
  | { kind: "ordered"; items: string[]; start: number };

const UNORDERED_ITEM = /^\s*[-*•]\s+(.*)$/;
const ORDERED_ITEM = /^\s*\d+[.)]\s+(.*)$/;

// Ordem importa: `código` e **negrito** antes de *itálico*, para o `**` não
// ser lido como dois `*`.
const INLINE_PATTERN =
  /(`([^`\n]+)`)|(\*\*([^*\n]+?)\*\*|__([^_\n]+?)__)|(\*([^*\s][^*\n]*?)\*)|(\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\))/g;

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
    const unordered = UNORDERED_ITEM.exec(line);
    const ordered = unordered ? null : ORDERED_ITEM.exec(line);
    const listMatch = unordered ?? ordered;
    const last = blocks.at(-1);

    if (listMatch) {
      if (last && last.kind === (unordered ? "unordered" : "ordered")) {
        last.items.push(listMatch[1]);
      } else if (unordered) {
        blocks.push({ kind: "unordered", items: [listMatch[1]] });
      } else {
        // Mantém o número da fonte: "1. a / - sub / 2. b" vira <ol>, <ul>, <ol
        // start=2>, senão a numeração reiniciaria em 1 depois do sub-item.
        const start = Number.parseInt(/\d+/.exec(line)?.[0] ?? "1", 10);
        blocks.push({ kind: "ordered", items: [listMatch[1]], start });
      }
      continue;
    }

    if (line.trim() === "") {
      // Linha em branco encerra o bloco corrente (parágrafo vazio = separador).
      if (last) blocks.push({ kind: "paragraph", lines: [] });
      continue;
    }

    if (last && last.kind === "paragraph") {
      last.lines.push(line);
    } else {
      blocks.push({ kind: "paragraph", lines: [line] });
    }
  }
  return blocks.filter(
    (block) => block.kind !== "paragraph" || block.lines.length > 0,
  );
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(text.slice(cursor, start));
    const key = `${keyPrefix}-${index++}`;

    if (match[1]) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.9em]"
        >
          {match[2]}
        </code>,
      );
    } else if (match[3]) {
      nodes.push(
        <strong key={key} className="font-semibold text-white">
          {match[4] ?? match[5]}
        </strong>,
      );
    } else if (match[6]) {
      nodes.push(<em key={key}>{match[7]}</em>);
    } else {
      nodes.push(
        <a
          key={key}
          href={match[10]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-400 underline underline-offset-2"
        >
          {match[9]}
        </a>,
      );
    }
    cursor = start + match[0].length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function renderMarkdown(text: string): ReactNode {
  return parseBlocks(text).map((block, blockIndex) => {
    const key = `b${blockIndex}`;
    if (block.kind === "paragraph") {
      return (
        <p key={key}>
          {block.lines.map((line, lineIndex) => (
            <span key={`${key}-${lineIndex}`}>
              {lineIndex > 0 ? <br /> : null}
              {renderInline(line, `${key}-${lineIndex}`)}
            </span>
          ))}
        </p>
      );
    }
    const items = block.items.map((item, itemIndex) => (
      <li key={`${key}-${itemIndex}`}>
        {renderInline(item, `${key}-${itemIndex}`)}
      </li>
    ));
    if (block.kind === "ordered") {
      return (
        <ol
          key={key}
          start={block.start}
          className="list-decimal space-y-1 pl-5"
        >
          {items}
        </ol>
      );
    }
    return (
      <ul key={key} className="list-disc space-y-1 pl-5">
        {items}
      </ul>
    );
  });
}
