import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ChatWidget } from "@/components/ChatWidget";
import { SiteHeader } from "@/components/SiteHeader";
import { resume } from "@/content/resume";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// mesma URL documentada em frontend/README.md (seção Deploy) — ajustar as
// duas juntas se o domínio mudar; override possível via env var, sem precisar editar código
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://curriculo-online-ia.vercel.app";
// primeiro cargo de hero.title (antes do "|") mantém o <title> dentro do
// limite recomendado (~60 chars) sem truncar nos resultados de busca
const shortRole = resume.hero.title.split("|")[0].trim();
const title = `${resume.hero.name} — ${shortRole}`;
const description = resume.hero.summary;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: resume.hero.name,
    locale: "pt_BR",
    type: "profile",
    // placeholder até uma imagem de OG dedicada existir — ver US-04-01, fora de escopo
    images: ["/globe.svg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <SiteHeader />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
