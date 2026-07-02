import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      data-theme="light"
      data-corners="sharp"
      data-bg="glow"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {/* Arms the scroll-reveal hidden state before paint; without JS the
            `html.js` rules never apply and all content stays visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        {children}
        <FeedbackWidget />
        <Analytics />
      </body>
    </html>
  );
}
