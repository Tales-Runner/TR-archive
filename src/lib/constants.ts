// ── API ───────────────────────────────────────────────
export const API_BASE = "https://tr.rhaon.co.kr/webb";
export const SITE_BASE = "https://tr.rhaon.co.kr";
export const IMAGE_CDN = "https://trimage.rhaon.co.kr";

// ── Characters ────────────────────────────────────────
export const CHARACTER_CATEGORY = { RUNNER: 0, STORY: 1 } as const;
export const CHARACTER_CATEGORY_LABEL: Record<number, string> = {
  [CHARACTER_CATEGORY.RUNNER]: "런너",
  [CHARACTER_CATEGORY.STORY]: "스토리",
};

export const STAT_MAX = 6;
export const STAT_TOTAL_MAX = 16;

// ── Stories ───────────────────────────────────────────
export const STORY_CATEGORY = { WEBTOON: 1, VIDEO: 2 } as const;
export const STORY_CATEGORY_LABEL: Record<number, string> = {
  [STORY_CATEGORY.WEBTOON]: "웹툰",
  [STORY_CATEGORY.VIDEO]: "영상",
};

// ── Guide Categories ──────────────────────────────────
export const GUIDE_CATEGORY_NAMES: Record<number, string> = {
  1: "조작법",
  2: "커뮤니티",
  3: "시스템",
  4: "성장",
  5: "게임플레이",
  6: "팜",
  7: "공원",
  9: "레벨",
  10: "보안",
  11: "VIP",
  12: "시작하기",
  14: "광장",
};

// ── Search ────────────────────────────────────────────
export const SEARCH_TYPE_COLORS: Record<string, string> = {
  런너: "text-teal-300 bg-teal-600/20",
  맵: "text-red-300 bg-red-600/20",
  코스튬: "text-pink-300 bg-pink-600/20",
  가이드: "text-amber-300 bg-amber-600/20",
  스토리: "text-blue-300 bg-blue-600/20",
};

// ── Character Images ──────────────────────────────────
export const ELIMS_CIRCULAR =
  `${IMAGE_CDN}/images/trintro/character/circularImageUrl/6awBZmzKmUkV8JVC43yMRH.png`;
export const ELIMS_MAIN =
  `${IMAGE_CDN}/images/trintro/character/mainImageUrl/2d8NfCsBO9RRDObt3pw8NA.png`;
export const R_CIRCULAR =
  `${IMAGE_CDN}/images/trintro/character/circularImageUrl/56I8dLyaJYn91ixXLnYsAm.png`;
export const KAI_CIRCULAR =
  `${IMAGE_CDN}/images/trintro/character/circularImageUrl/0KztxwgQ2iCDS7LMFEz9Jd.png`;

// ── Animation ─────────────────────────────────────────
export const TYPEWRITER_SPEED_MS = 40;
