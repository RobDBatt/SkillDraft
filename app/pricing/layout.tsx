import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — SkillDraft",
  description:
    "Start free with 5 credits. Buy more when you need them, or go Pro for 50 credits a month.",
  openGraph: {
    title: "Pricing — SkillDraft",
    description:
      "Start free with 5 credits. Buy more when you need them, or go Pro for 50 credits a month.",
    url: "https://skilldraft.io/pricing",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Pricing — SkillDraft",
    description:
      "Start free with 5 credits. Buy more when you need them, or go Pro for 50 credits a month.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
