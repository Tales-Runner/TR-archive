// ── API ───────────────────────────────────────────────
export const API_BASE = "https://tr.rhaon.co.kr/webb";
export const SITE_BASE = "https://tr.rhaon.co.kr";
export const IMAGE_CDN = "https://trimage.rhaon.co.kr";

/**
 * Browser-like UA sent on every upstream request to tr.rhaon.co.kr.
 *
 * Defensive: upstream 이 향후 non-browser UA 를 차단하더라도 살아남도록.
 * 과거 `/webb/main/*` 장애 디버깅 중 UA 필터 가설이 나왔으나 최종 원인은
 * 업스트림 504 게이트웨이 타임아웃 + 리전 불일치로 판명. UA 자체가
 * 필수인지는 여전히 미확정 — 그래도 무해하고 로그/오남용 식별에 도움.
 */
export const UPSTREAM_USER_AGENT =
  "Mozilla/5.0 (compatible; tr-archive/1.0; +https://tr-archive.vercel.app)";

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

// ── Map Types ─────────────────────────────────────────
export const MAP_TYPE_NAMES: Record<number, string> = {
  0: "PVP", 1: "협동", 2: "하드코어", 3: "트레이닝", 4: "럼블", 5: "서바이벌", 6: "아케이드",
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

// ── Level Ranks ───────────────────────────────────────
export const LEVEL_RANKS: { name: string; minLevel: number; maxLevel: number }[] = [
  { name: "병아리", minLevel: 1, maxLevel: 7 },
  { name: "발바닥", minLevel: 8, maxLevel: 14 },
  { name: "양말", minLevel: 15, maxLevel: 21 },
  { name: "슬리퍼", minLevel: 22, maxLevel: 28 },
  { name: "운동화", minLevel: 29, maxLevel: 35 },
  { name: "윙부츠", minLevel: 36, maxLevel: 42 },
  { name: "데빌윙부츠", minLevel: 43, maxLevel: 49 },
  { name: "엔젤윙부츠", minLevel: 50, maxLevel: 56 },
  { name: "파워윙부츠", minLevel: 57, maxLevel: 63 },
  { name: "썬더윙부츠", minLevel: 64, maxLevel: 70 },
  { name: "루나윙부츠", minLevel: 71, maxLevel: 77 },
  { name: "쏠라윙부츠", minLevel: 78, maxLevel: 84 },
  { name: "스텔라윙부츠", minLevel: 85, maxLevel: 91 },
  { name: "갤럭시윙부츠", minLevel: 92, maxLevel: 98 },
  { name: "홀리윙부츠", minLevel: 99, maxLevel: 105 },
  { name: "프라우드윙부츠", minLevel: 106, maxLevel: 112 },
  { name: "크로노스윙부츠", minLevel: 113, maxLevel: 119 },
  { name: "인페르노윙부츠", minLevel: 120, maxLevel: 126 },
];

// 7색 순서 (각 계급 내 레벨 순서)
export const RANK_COLORS: { name: string; hex: string }[] = [
  { name: "빨강", hex: "#ef4444" },
  { name: "주황", hex: "#f97316" },
  { name: "노랑", hex: "#eab308" },
  { name: "초록", hex: "#22c55e" },
  { name: "파랑", hex: "#3b82f6" },
  { name: "남색", hex: "#6366f1" },
  { name: "보라", hex: "#a855f7" },
];

export function getLevelRank(level: number): { rank: string; color: string; hex: string } {
  const tier = LEVEL_RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel);
  if (!tier) return { rank: "???", color: "", hex: "#888" };
  const idx = (level - tier.minLevel) % 7;
  return { rank: tier.name, color: RANK_COLORS[idx].name, hex: RANK_COLORS[idx].hex };
}

export function getLevelLabel(level: number): string {
  const { rank, color } = getLevelRank(level);
  return `${color} ${rank}`;
}

// ── Animation ─────────────────────────────────────────
export const TYPEWRITER_SPEED_MS = 40;
