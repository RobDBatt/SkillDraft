import type { MetadataRoute } from "next";

const BASE = "https://skilldraft.io";

const CATEGORIES = [
  "development",
  "frontend-design",
  "content-writing",
  "data-integrations",
  "project-workflows",
  "devops-infrastructure",
  "security",
  "backend-frameworks",
  "custom-other",
] as const;

const PLATFORMS = [
  "claude-code",
  "cursor",
  "windsurf",
  "codex",
  "gemini-cli",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/generate`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/improve`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/explore`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE}/collections`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/install`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${BASE}/explore/c/${cat}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const platformPages: MetadataRoute.Sitemap = PLATFORMS.map((platform) => ({
    url: `${BASE}/explore/for/${platform}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...platformPages];
}
