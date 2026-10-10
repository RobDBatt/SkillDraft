import type { Metadata } from "next";

const TITLE = "Verify any SKILL.md: free security scan + quality score";
const DESC =
  "Paste a SKILL.md from anywhere and check it for prompt injection, dangerous commands, and exfiltration, plus a 0–100 quality score. Free, no sign-up.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "https://skilldraft.io/verify" },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "https://skilldraft.io/verify",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESC,
  },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
