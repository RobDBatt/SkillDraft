import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/learn";

const BASE = "https://skilldraft.io";

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
      url: `${BASE}/verify`,
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
    {
      url: `${BASE}/learn`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // /explore/c/* and /explore/for/* are deliberately NOT listed. There are 14
  // public skills spread across 17 such URLs, so each renders ~320 characters
  // of which most is the shared "Browse by category / platform" nav — the same
  // boilerplate on more than half the site's URLs. Google discovered every one
  // and indexed none (24 "Discovered — currently not indexed" on 2026-08-22),
  // and the crawl budget they consumed kept the substantive /learn articles
  // out of the index as well. They stay crawlable and internally linked; they
  // just don't get advertised. Put them back when the skill corpus is large
  // enough that a category page stands on its own.
  const articlePages: MetadataRoute.Sitemap = getAllArticles().map((a) => ({
    url: `${BASE}/learn/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages];
}
