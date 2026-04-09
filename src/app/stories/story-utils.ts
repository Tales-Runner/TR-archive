import type { StoryItem } from "@/lib/types";

export const PAGE_SIZE = 12;
const GENERIC_TAGS = new Set(["웹툰", "영상", ""]);
export const BRIGHTNESS_KEY = "elims-viewer-brightness";
export const ZOOM_LEVELS = [1, 1.5, 2] as const;

export interface SeriesInfo {
  name: string;
  episodes: StoryItem[];
}

export function getSeriesKey(story: StoryItem): string {
  const tags = story.hashTagSubject
    .split(",")
    .map((t) => t.trim())
    .filter((t) => !GENERIC_TAGS.has(t));
  return tags.join(", ") || "";
}

export function buildSeriesMap(stories: StoryItem[]): Map<string, SeriesInfo> {
  const map = new Map<string, SeriesInfo>();
  for (let i = stories.length - 1; i >= 0; i--) {
    const s = stories[i];
    if (s.images.length === 0) continue;
    const key = getSeriesKey(s);
    if (!key) continue;
    const existing = map.get(key);
    if (existing) existing.episodes.push(s);
    else map.set(key, { name: key, episodes: [s] });
  }
  return map;
}

export function getSeriesOptions(
  seriesMap: Map<string, SeriesInfo>,
): { name: string; count: number }[] {
  return [...seriesMap.values()]
    .map((s) => ({ name: s.name, count: s.episodes.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
