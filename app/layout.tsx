import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillDraft — Quality-scored SKILL.md files for every AI agent",
  description:
    "Generate production-ready SKILL.md files for Claude Code, Cursor, Windsurf, Codex CLI, and Gemini CLI. Quality scored on 7 dimensions. Security scanned. One-command install.",
  metadataBase: new URL("https://skilldraft.io"),
  openGraph: {
    title: "SkillDraft — Quality-scored SKILL.md files for every AI agent",
    description: "Generate production-ready SKILL.md files for Claude Code, Cursor, Windsurf, Codex CLI, and Gemini CLI. Quality scored, security scanned, one-command install.",
    url: "https://skilldraft.io",
    siteName: "SkillDraft",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillDraft — Quality-scored SKILL.md files for every AI agent",
    description: "Generate production-ready SKILL.md files for Claude Code, Cursor, Windsurf, and more. Free, quality scored, security scanned.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
