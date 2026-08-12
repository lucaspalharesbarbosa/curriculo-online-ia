import { MotionConfig } from "framer-motion";
import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";

import { resume } from "@/content/resume";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

// mesma URL documentada em frontend/README.md (seção Deploy)
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lucas-palhares-cv.vercel.app";
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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#04080e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        {/* reducedMotion="user" — US-07-06: whileHover/whileInView do
        framer-motion (não cobertos pela media query CSS) também respeitam
        prefers-reduced-motion do SO, em todo o app */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
