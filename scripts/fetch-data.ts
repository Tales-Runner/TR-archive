import { writeFileSync } from "fs";
import { join } from "path";

const BASE = "https://tr.rhaon.co.kr/webb";
const DATA_DIR = join(new URL(".", import.meta.url).pathname, "..", "src", "data");
const DELAY = 500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api<T>(path: string, retries = 2): Promise<T | null> {
  const url = `${BASE}${path}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`  ↻ retry ${attempt} ${path}`);
        await sleep(1000 * attempt);
      } else {
        console.log(`  GET ${path}`);
      }
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`  ⚠ ${res.status} ${res.statusText}`);
        if (attempt === retries) return null;
        continue;
      }
      const json = await res.json();
      if (json.resCd !== "0000") {
        console.warn(`  ⚠ API error: ${json.resCd} ${json.rspMsg}`);
        return null;
      }
      return json.result as T;
    } catch (err) {
      console.warn(`  ⚠ fetch error: ${err}`);
      if (attempt === retries) return null;
    }
  }
  return null;
}

function save(filename: string, data: unknown) {
  const path = join(DATA_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  ✓ saved ${filename}`);
}

// ── Maps ──────────────────────────────────────────────

interface MapTypeRaw {
  mainCodeId: string;
  codeId: number;
  codeName: string;
  imageUrl: string | null;
}

interface MapListYear {
  openYear: string;
  itemList: {
    id: number;
    subject: string;
    mapTypeCd: number | null;
    openDt: string;
    hashTagSubject: string;
    thumbnail: string;
    movieUrl: string | null;
    summary: string | null;
  }[];
}

interface MapDetail {
  id: number;
  subject: string;
  mapTypeCd: number;
  openDt: string;
  hashTagSubject: string;
  thumbnail: string;
  movieUrl: string | null;
  summary: string | null;
  contents: string | null;
  startAt: string | null;
  recommendDataList: unknown[];
}

async function fetchMaps() {
  console.log("\n📍 Maps");

  const typesResult = await api<{ list: MapTypeRaw[]; totalCount: number }>(
    "/trlibrary/map/type"
  );
  if (!typesResult) return;
  const mapTypes = typesResult.list.map((t) => ({
    codeId: t.codeId,
    codeName: t.codeName,
  }));

  const listResult = await api<{ list: MapListYear[]; totalCount: number }>(
    "/trlibrary/map/list"
  );
  if (!listResult) return;

  const allIds: number[] = [];
  for (const yearGroup of listResult.list) {
    for (const item of yearGroup.itemList) {
      allIds.push(item.id);
    }
  }
  console.log(`  found ${allIds.length} maps, fetching details...`);

  const maps: MapDetail[] = [];
  for (const id of allIds) {
    await sleep(DELAY);
    const detail = await api<{ info: MapDetail }>(`/trlibrary/map/${id}`);
    if (detail?.info) {
      maps.push(detail.info);
    }
  }

  save("map-types.json", mapTypes);
  save("maps.json", maps);
}

// ── Costumes ──────────────────────────────────────────

interface ClosetListYear {
  openYear: string;
  itemList: {
    id: number;
    subject: string;
    thumbnail: string;
    openDt: string;
    hashTagSubject: string;
  }[];
}

interface ClosetDetailItem {
  motionId: number;
  itemId: number;
  id: number;
  itemSubject: string;
  imageUrl: string;
  motionImageUrl: string | null;
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ClosetDetail {
  id: number | null;
  subject: string;
  backgroundImageUrl: string;
  titleImageUrl: string;
  oldButtonImageUrl: string | null;
  oldBtnPosition: { btnTop: number; btnLeft: number; btnWidth: number; btnHeight: number } | null;
  itemButtonImageUrl: string | null;
  itemButtonLink: string | null;
  itemList: ClosetDetailItem[];
}

async function fetchCostumes() {
  console.log("\n👗 Costumes");

  const listResult = await api<{ list: ClosetListYear[]; totalCount: number }>(
    "/trlibrary/closet/list"
  );
  if (!listResult) return;

  const costumes: {
    id: number;
    subject: string;
    thumbnail: string;
    openDt: string;
    hashTagSubject: string;
    openYear: string;
    detail: ClosetDetail | null;
  }[] = [];

  for (const yearGroup of listResult.list) {
    for (const item of yearGroup.itemList) {
      await sleep(DELAY);
      const detail = await api<{ info: ClosetDetail }>(
        `/trlibrary/closet/${item.id}`
      );
      costumes.push({
        ...item,
        openYear: yearGroup.openYear,
        detail: detail?.info ?? null,
      });
    }
  }

  console.log(`  fetched ${costumes.length} costume sets`);
  save("costumes.json", costumes);
}

// ── Guides ────────────────────────────────────────────

interface GuideListItem {
  id: number;
  subject: string;
  category: number;
  categoryName: string;
  hashTagSubject: string;
  isView: boolean;
}

interface GuidePart {
  partId: number;
  subject: string;
  contents: string;
  chapterList: { subject: string; contents: string }[];
}

interface GuideDetailResult {
  info: {
    gameGuideId: number;
    subject: string;
    category: number;
    hashTagSubject: string;
    partList?: GuidePart[];
  };
  partList?: GuidePart[];
}

async function fetchGuides() {
  console.log("\n📖 Guides");

  const listResult = await api<{ list: GuideListItem[]; totalCount: number }>(
    "/trlibrary/guide?search-word="
  );
  if (!listResult) return;

  const visibleGuides = listResult.list.filter((g) => g.isView);
  console.log(`  found ${visibleGuides.length} visible guides, fetching details...`);

  const guides: {
    id: number;
    subject: string;
    category: number;
    hashTagSubject: string;
    partList: GuidePart[];
  }[] = [];

  for (const g of visibleGuides) {
    await sleep(DELAY);
    const detail = await api<GuideDetailResult>(`/trlibrary/guide/${g.id}`);
    if (detail) {
      const parts = detail.info.partList ?? detail.partList ?? [];
      guides.push({
        id: g.id,
        subject: detail.info.subject,
        category: detail.info.category,
        hashTagSubject: detail.info.hashTagSubject,
        partList: parts,
      });
    }
  }

  save("guides.json", guides);
}

// ── Stories ───────────────────────────────────────────

interface StoryListYear {
  openYear: string;
  itemList: {
    id: number;
    subject: string;
    category: number;
    categoryName: string | null;
    openYearType: string | null;
    openDt: string;
    hashTagSubject: string;
    thumbnail: string;
  }[];
}

interface StoryDetailItem {
  itemId: number;
  id: number;
  viewOrder: number;
  movieUrl: string | null;
  imageUrl: string;
  comments: string;
}

interface StoryDetailResult {
  info: {
    subject: string;
    openDt: string;
    hashTagSubject: string;
    itemList: StoryDetailItem[];
  };
}

async function fetchStories() {
  console.log("\n📚 Stories");

  const listResult = await api<{ list: StoryListYear[]; totalCount: number }>(
    "/trlibrary/trstory/list"
  );
  if (!listResult) return;

  const stories: {
    id: number;
    subject: string;
    category: number;
    openDt: string;
    openYear: string;
    hashTagSubject: string;
    thumbnail: string;
    images: { imageUrl: string; movieUrl: string | null; viewOrder: number }[];
  }[] = [];

  const allItems: { item: StoryListYear["itemList"][0]; openYear: string }[] = [];
  for (const yearGroup of listResult.list) {
    for (const item of yearGroup.itemList) {
      allItems.push({ item, openYear: yearGroup.openYear });
    }
  }

  console.log(`  found ${allItems.length} stories, fetching details...`);

  for (const { item, openYear } of allItems) {
    await sleep(DELAY);
    const detail = await api<StoryDetailResult>(`/trlibrary/trstory/${item.id}`);
    const images = (detail?.info?.itemList ?? [])
      .sort((a, b) => a.viewOrder - b.viewOrder)
      .map((i) => ({
        imageUrl: i.imageUrl,
        movieUrl: i.movieUrl,
        viewOrder: i.viewOrder,
      }));

    stories.push({
      id: item.id,
      subject: item.subject,
      category: item.category,
      openDt: item.openDt,
      openYear,
      hashTagSubject: item.hashTagSubject,
      thumbnail: item.thumbnail,
      images,
    });
  }

  console.log(`  fetched ${stories.length} stories with images`);
  save("stories.json", stories);
}

// ── Main ─────────────────────────────────────────────

async function main() {
  console.log("🚀 TR Utils — data fetcher");
  console.log(`   target: ${DATA_DIR}\n`);

  await fetchMaps();
  await fetchCostumes();
  await fetchGuides();
  await fetchStories();

  console.log("\n✅ Done!");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
