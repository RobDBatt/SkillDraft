import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/auth",
          "/auth/callback",
          "/skills",
          "/teams",
          "/collections/new",
          "/api/",
        ],
      },
    ],
    sitemap: "https://skilldraft.io/sitemap.xml",
  };
}
