import type { MetadataRoute } from "next";

const BASE = "https://tr-archive.vercel.app";

// Top-level routes. Individual items (stories, maps, costumes) all live
// under these pages as query params or in-page state, not as distinct
// dynamic routes — so the sitemap stays flat.
const ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/stories", changeFrequency: "weekly", priority: 0.9 },
  { path: "/characters", changeFrequency: "weekly", priority: 0.9 },
  { path: "/maps", changeFrequency: "weekly", priority: 0.9 },
  { path: "/closet", changeFrequency: "weekly", priority: 0.8 },
  { path: "/guides", changeFrequency: "weekly", priority: 0.8 },
  { path: "/probability", changeFrequency: "weekly", priority: 0.8 },
  { path: "/exp", changeFrequency: "monthly", priority: 0.6 },
  { path: "/stats", changeFrequency: "weekly", priority: 0.6 },
  { path: "/relationships", changeFrequency: "monthly", priority: 0.6 },
  { path: "/lore", changeFrequency: "monthly", priority: 0.7 },
  { path: "/channels", changeFrequency: "monthly", priority: 0.5 },
  { path: "/notices", changeFrequency: "daily", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
