export interface Character {
  id: number;
  characterNm: string;
  category: number; // 0 = runner, 1 = story
  catchPhrase: string;
  mainImageUrl: string;
  squareImageUrl: string;
  circularImageUrl: string;
  comments: string;
  ingameId: number;
  uniqueAbility: string;
  ageInfo: string;
  height: string;
  weight: string;
  mbti: string;
  bloodType: string;
  job: string;
  jobDetail: string | null;
  birthDayInfo: string;
  maximumSpeed: number;
  power: number;
  control: number;
  acceleration: number;
  revivalMotion: string;
  hurdleMotion: string;
  landingMotion: string;
  angryMotion: string;
  swimmingMotion: string;
  beehiveMotion: string;
  electricShockMotion: string;
  stunMotion: string;
  isView: boolean;
  viewOrder: number;
}

export interface ProbabilityItem {
  itemNm: string;
  itemList: {
    sourceNm: string;
    targetNm: string | null;
    probability: number;
  }[];
}

export interface ProbabilityData {
  comments: string;
  itemList: ProbabilityItem[];
}

export type SortKey =
  | "characterNm"
  | "maximumSpeed"
  | "power"
  | "control"
  | "acceleration"
  | "totalStat"
  | "revivalMotion"
  | "hurdleMotion"
  | "landingMotion"
  | "angryMotion"
  | "swimmingMotion"
  | "beehiveMotion"
  | "electricShockMotion"
  | "stunMotion";

export type SortDir = "asc" | "desc";

// ── Maps ──────────────────────────────────────────────

export interface MapType {
  codeId: number;
  codeName: string;
}

export interface MapItem {
  id: number;
  subject: string;
  mapTypeCd: number | null;
  openDt: string;
  hashTagSubject: string;
  thumbnail: string;
  movieUrl: string | null;
  summary: string | null;
  contents: string | null;
  startAt: string | null;
  recommendDataList: unknown[];
}

// ── Costumes ──────────────────────────────────────────

export interface CostumeDetailItem {
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

export interface CostumeDetail {
  id: number | null;
  subject: string;
  backgroundImageUrl: string;
  titleImageUrl: string;
  oldButtonImageUrl: string | null;
  oldBtnPosition: {
    btnTop: number;
    btnLeft: number;
    btnWidth: number;
    btnHeight: number;
  } | null;
  itemButtonImageUrl: string | null;
  itemButtonLink: string | null;
  itemList: CostumeDetailItem[];
}

export interface CostumeItem {
  id: number;
  subject: string;
  thumbnail: string;
  openDt: string;
  hashTagSubject: string;
  openYear: string;
  detail: CostumeDetail | null;
}

// ── Guides ────────────────────────────────────────────

export interface GuidePart {
  partId: number;
  subject: string;
  contents: string;
  chapterList: { subject: string; contents: string }[];
}

export interface GuideItem {
  id: number;
  subject: string;
  category: number;
  hashTagSubject: string;
  partList: GuidePart[];
}

// ── Stories ───────────────────────────────────────────

export interface StoryImage {
  imageUrl: string;
  movieUrl: string | null;
  viewOrder: number;
}

export interface StoryItem {
  id: number;
  subject: string;
  category: number; // 1 = webtoon, 2 = video
  openDt: string;
  openYear: string;
  hashTagSubject: string;
  thumbnail: string;
  images: StoryImage[];
}
