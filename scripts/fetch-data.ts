import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readSnapshot, validateSnapshot, writeSnapshot, type Snapshot } from "./data-snapshot";
import { API_BASE, UPSTREAM_USER_AGENT } from "@/lib/constants";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const DATA_DIR = join(ROOT, "src", "data");
type Save = (file: string, data: unknown) => void;
const DELAY = 500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api<T>(path: string, retries = 2): Promise<T> {
  const url = `${API_BASE}${path}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`  ↻ retry ${attempt} ${path}`);
        await sleep(1000 * attempt);
      } else {
        console.log(`  GET ${path}`);
      }
      const res = await fetch(url, {
        headers: { "User-Agent": UPSTREAM_USER_AGENT },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        console.warn(`  ⚠ ${res.status} ${res.statusText}`);
        throw new Error(`HTTP ${res.status} fetching ${path}`);
      }
      const json = await res.json();
      if (json.resCd !== "0000") {
        console.warn(`  ⚠ API error: ${json.resCd} ${json.rspMsg}`);
        throw new Error(`API ${json.resCd} fetching ${path}`);
      }
      if (!json.result || typeof json.result !== "object") throw new Error(`Missing result fetching ${path}`);
      return json.result as T;
    } catch (err) {
      console.warn(`  ⚠ fetch error: ${err}`);
      if (attempt === retries) throw err;
    }
  }
  throw new Error(`Failed to fetch ${path}`);
}

// ── Characters ───────────────────────────────────────

async function fetchCharacters(save: Save) {
  console.log("\n🎭 Characters");

  const listResult = await api<{ list: { id: number }[] }>(
    "/trintro/character/all"
  );

  const ids = listResult.list.map((c) => c.id);
  console.log(`  found ${ids.length} characters, fetching details...`);

  const characters: Record<string, unknown>[] = [];
  for (const id of ids) {
    await sleep(DELAY);
    const detail = await api<{ info: Record<string, unknown> }>(
      `/trintro/character/${id}`
    );
    if (!detail.info) throw new Error(`Missing character detail: ${id}`);
    characters.push(detail.info);
  }

  console.log(`  fetched ${characters.length} characters with details`);
  save("src/data/characters.json", characters);
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

async function fetchMaps(save: Save) {
  console.log("\n📍 Maps");

  const typesResult = await api<{ list: MapTypeRaw[]; totalCount: number }>(
    "/trlibrary/map/type"
  );
  const mapTypes = typesResult.list.map((t) => ({
    codeId: t.codeId,
    codeName: t.codeName,
  }));

  const listResult = await api<{ list: MapListYear[]; totalCount: number }>(
    "/trlibrary/map/list"
  );

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
    if (!detail.info) throw new Error(`Missing map detail: ${id}`);
    maps.push(detail.info);
  }

  save("src/data/map-types.json", mapTypes);
  save("src/data/maps.json", maps);
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

async function fetchCostumes(save: Save) {
  console.log("\n👗 Costumes");

  const listResult = await api<{ list: ClosetListYear[]; totalCount: number }>(
    "/trlibrary/closet/list"
  );

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
      if (!detail.info) throw new Error(`Missing costume detail: ${item.id}`);
      costumes.push({
        ...item,
        openYear: yearGroup.openYear,
        detail: detail.info,
      });
    }
  }

  console.log(`  fetched ${costumes.length} costume sets`);
  save("src/data/costumes.json", costumes);
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

async function fetchGuides(save: Save) {
  console.log("\n📖 Guides");

  const listResult = await api<{ list: GuideListItem[]; totalCount: number }>(
    "/trlibrary/guide?search-word="
  );

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
    if (!detail.info) throw new Error(`Missing guide detail: ${g.id}`);
    const parts = detail.info.partList ?? detail.partList;
    if (!Array.isArray(parts)) throw new Error(`Missing guide parts: ${g.id}`);
    guides.push({
      id: g.id,
      subject: detail.info.subject,
      category: detail.info.category,
      hashTagSubject: detail.info.hashTagSubject,
      partList: parts,
    });
  }

  save("src/data/guides.json", guides);
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

async function fetchStories(save: Save) {
  console.log("\n📚 Stories");

  const listResult = await api<{ list: StoryListYear[]; totalCount: number }>(
    "/trlibrary/trstory/list"
  );

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
    if (!Array.isArray(detail.info?.itemList)) throw new Error(`Missing story detail: ${item.id}`);
    const images = detail.info.itemList
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
  save("src/data/stories.json", stories);
}

// ── Probability ──────────────────────────────────────

const PROB_CATEGORIES = [
  { id: "trading-position", path: "/trlibrary/probability/trading/position", name: "변경권" },
  { id: "trading-level", path: "/trlibrary/probability/trading/level", name: "레벨 트레이딩" },
  { id: "machine", path: "/trlibrary/probability/machine", name: "캡슐 기계" },
  { id: "luckybox", path: "/trlibrary/probability/luckybox", name: "럭키 박스" },
  { id: "fishing", path: "/trlibrary/probability/fishing", name: "낚시" },
  { id: "cube", path: "/trlibrary/probability/cube", name: "큐브" },
  { id: "dice", path: "/trlibrary/probability/dice", name: "주사위" },
  { id: "humong", path: "/trlibrary/probability/humong", name: "휴몽 뽑기판" },
  { id: "personal", path: "/trlibrary/probability/personal", name: "개인 뽑기판" },
  { id: "selectshop", path: "/trlibrary/probability/selectshop", name: "셀렉트샵" },
] as const;

interface RawProbSubItem {
  sourceNm?: string;
  targetNm?: string;
  resultItemNm?: string;
  probability?: number;
}

interface RawProbItem {
  itemNm: string;
  itemList: RawProbSubItem[];
}

export function normalizeProbItems(items: RawProbItem[]) {
  return items.map((item) => ({
    itemNm: item.itemNm,
    itemList: item.itemList
      .filter((r) => (r.sourceNm ?? r.resultItemNm ?? "") !== "합계")
      .map((r) => {
        if (typeof r.probability !== "number" || !Number.isFinite(r.probability)) {
          throw new Error(`Missing or invalid probability: ${item.itemNm}`);
        }
        return {
          sourceNm: r.sourceNm ?? "",
          targetNm: r.targetNm ?? r.resultItemNm ?? "",
          probability: r.probability,
        };
      }),
  }));
}

async function fetchProbability(save: Save) {
  console.log("\n🎲 Probability");

  const categories: {
    id: string;
    name: string;
    comments: string;
    itemList: { itemNm: string; itemList: { sourceNm: string; targetNm: string; probability: number }[] }[];
  }[] = [];

  for (const cat of PROB_CATEGORIES) {
    await sleep(DELAY);
    // Endpoints return either { info: { comments, itemList } } or { info: { comments }, itemList: [...] }
    const raw = await api<Record<string, unknown>>(cat.path);

    const info = raw.info as Record<string, unknown> | undefined;
    const comments = (info?.comments as string) ?? "";
    const itemList =
      (info?.itemList as RawProbItem[]) ?? (raw.itemList as RawProbItem[]) ?? [];

    if (itemList.length === 0) {
      console.log(`  ⊘ ${cat.name}: empty`);
      continue;
    }

    categories.push({
      id: cat.id,
      name: cat.name,
      comments,
      itemList: normalizeProbItems(itemList),
    });
    console.log(`  ✓ ${cat.name}: ${itemList.length} items`);
  }

  console.log(`  fetched ${categories.length} categories`);

  if (categories.length === 0) throw new Error("All probability categories are empty");

  const meta: { id: string; name: string; comments: string; itemCount: number }[] = [];
  for (const cat of categories) {
    save(`public/data/probability/${cat.id}.json`, cat.itemList);
    console.log(`  ✓ public/data/probability/${cat.id}.json`);
    meta.push({ id: cat.id, name: cat.name, comments: cat.comments, itemCount: cat.itemList.length });
  }
  save("src/data/probability-meta.json", meta);
}

// ── Main ─────────────────────────────────────────────

export async function collectData(): Promise<Snapshot> {
  const snapshot: Snapshot = new Map();
  const save: Save = (file, data) => { snapshot.set(file, data); };
  await fetchCharacters(save);
  await fetchMaps(save);
  await fetchCostumes(save);
  await fetchGuides(save);
  await fetchStories(save);
  await fetchProbability(save);
  return snapshot;
}

async function main() {
  const output = process.argv[2];
  if (!output) throw new Error("Usage: npm run data:collect -- <new-snapshot-directory>");
  console.log(`Collecting candidate data; current data: ${DATA_DIR}`);
  const snapshot = await collectData();
  validateSnapshot(snapshot, readSnapshot(ROOT));
  writeSnapshot(resolve(output), snapshot);
  console.log(`Candidate saved to ${resolve(output)}. Run data:validate and data:apply before publishing.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error("Fatal:", err);
    process.exitCode = 1;
  });
}
