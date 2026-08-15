import type { NextConfig } from "next";

// US-08-07 (achado M2 de QA-005): headers de seguranca HTTP aplicados a
// todas as rotas do frontend. `next/font/google` (Inter/Outfit, ver
// app/layout.tsx) faz self-host das fontes em build time — nenhum request de
// runtime a fonts.googleapis.com/fonts.gstatic.com, entao a CSP nao precisa
// de font-src externo. Imagens (logos/foto do resume.json) sao sempre paths
// locais em public/ (sem `images.remotePatterns` configurado) — img-src
// cobre so 'self'/data:. O chat e proxied same-origin via app/api/chat
// (fetch server-side ao backend, fora do alcance da CSP do browser) — sem
// necessidade de connect-src externo.
//
// script-src ganha 'unsafe-eval' so fora de producao: o dev server (webpack
// eval devtool / HMR do Turbopack) depende disso para hot reload; producao
// (Vercel) fica estrita, sem 'unsafe-eval'.
//
// style-src mantem 'unsafe-inline': framer-motion anima via manipulacao
// direta do atributo style do elemento (whileHover/whileInView usados em
// varios componentes desde a Fase 07) — sem 'unsafe-inline' as animacoes
// quebrariam sob CSP. Risco aceito: injecao de estilo tem impacto bem menor
// que injecao de script, que continua bloqueada.
const isProduction = process.env.NODE_ENV === "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

// X-Frame-Options: DENY escolhido em vez de `frame-ancestors 'none'` dentro
// da CSP (CA-001 aceita as duas formas) — compatibilidade mais ampla
// (funciona mesmo se a CSP acima for removida/mal configurada no futuro) e
// mais simples de confirmar isoladamente via `curl -I`.
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Strict-Transport-Security NAO e adicionado aqui de proposito (CA-004):
  // ja vem por default da Vercel (confirmado em QA-005), duplicar/sobrescrever
  // arrisca uma politica pior que a da plataforma.
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
