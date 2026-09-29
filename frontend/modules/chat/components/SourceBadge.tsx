import { Globe, ShieldCheck } from "lucide-react";

import type { ChatSource } from "../lib/chat-client";

/** Selo de origem da resposta: currículo (verde) ou web (âmbar). */
export function SourceBadge({ source }: { source: ChatSource }) {
  const isWeb = source === "web";
  const Icon = isWeb ? Globe : ShieldCheck;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        isWeb
          ? "border-web/40 bg-web/10 text-web"
          : "border-ok/40 bg-ok/10 text-ok"
      }`}
    >
      <Icon size={13} aria-hidden />
      {isWeb ? "Fonte: web" : "Fonte: currículo"}
    </span>
  );
}
