import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Rate-limited / non-cacheable endpoints — no value to crawlers.
        disallow: ["/api/", "/feedback"],
      },
    ],
    sitemap: "https://tr-archive.vercel.app/sitemap.xml",
    host: "https://tr-archive.vercel.app",
  };
}
