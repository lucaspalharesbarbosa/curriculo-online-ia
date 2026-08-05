import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

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

const siteUrl = "https://curriculo-online-ia.vercel.app";
const title = `${resume.hero.name} — ${resume.hero.title}`;
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
      </body>
    </html>
  );
}
