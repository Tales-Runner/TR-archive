import { describe, it, expect } from "vitest";
import {
  getLevelRank,
  getLevelLabel,
  LEVEL_RANKS,
  RANK_COLORS,
  CHARACTER_CATEGORY,
  CHARACTER_CATEGORY_LABEL,
  STORY_CATEGORY,
  STORY_CATEGORY_LABEL,
  GUIDE_CATEGORY_NAMES,
  MAP_TYPE_NAMES,
} from "./constants";

describe("LEVEL_RANKS", () => {
  it("모든 레벨 계급이 연속적으로 정의되어 있음", () => {
    for (let i = 0; i < LEVEL_RANKS.length - 1; i++) {
      expect(LEVEL_RANKS[i].maxLevel + 1).toBe(LEVEL_RANKS[i + 1].minLevel);
    }
  });

  it("각 계급의 범위가 정확히 7레벨", () => {
    for (const rank of LEVEL_RANKS) {
      expect(rank.maxLevel - rank.minLevel + 1).toBe(7);
    }
  });

  it("첫 계급은 레벨 1에서 시작", () => {
    expect(LEVEL_RANKS[0].minLevel).toBe(1);
  });
});

describe("RANK_COLORS", () => {
  it("7색이 정의되어 있음", () => {
    expect(RANK_COLORS).toHaveLength(7);
  });

  it("모든 색상에 이름과 hex 코드가 있음", () => {
    for (const color of RANK_COLORS) {
      expect(color.name).toBeTruthy();
      expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("getLevelRank", () => {
  it("레벨 1 = 병아리 / 빨강", () => {
    const result = getLevelRank(1);
    expect(result.rank).toBe("병아리");
    expect(result.color).toBe("빨강");
  });

  it("레벨 7 = 병아리 / 보라 (계급의 마지막 색상)", () => {
    const result = getLevelRank(7);
    expect(result.rank).toBe("병아리");
    expect(result.color).toBe("보라");
  });

  it("레벨 8 = 발바닥 / 빨강 (다음 계급)", () => {
    const result = getLevelRank(8);
    expect(result.rank).toBe("발바닥");
    expect(result.color).toBe("빨강");
  });

  it("레벨 126 = 인페르노윙부츠 (최고 레벨)", () => {
    const result = getLevelRank(126);
    expect(result.rank).toBe("인페르노윙부츠");
  });

  it("범위를 벗어난 레벨은 ???", () => {
    const result = getLevelRank(999);
    expect(result.rank).toBe("???");
    expect(result.hex).toBe("#888");
  });

  it("레벨 0은 범위 밖이므로 ???", () => {
    const result = getLevelRank(0);
    expect(result.rank).toBe("???");
  });
});

describe("getLevelLabel", () => {
  it("레벨 1의 라벨 = '빨강 병아리'", () => {
    expect(getLevelLabel(1)).toBe("빨강 병아리");
  });

  it("레벨 15의 라벨 = '빨강 양말'", () => {
    expect(getLevelLabel(15)).toBe("빨강 양말");
  });

  it("레벨 29의 라벨 = '빨강 운동화'", () => {
    expect(getLevelLabel(29)).toBe("빨강 운동화");
  });
});

describe("카테고리 상수", () => {
  it("CHARACTER_CATEGORY에 RUNNER(0)와 STORY(1) 정의", () => {
    expect(CHARACTER_CATEGORY.RUNNER).toBe(0);
    expect(CHARACTER_CATEGORY.STORY).toBe(1);
  });

  it("CHARACTER_CATEGORY_LABEL이 한국어 레이블 포함", () => {
    expect(CHARACTER_CATEGORY_LABEL[0]).toBe("런너");
    expect(CHARACTER_CATEGORY_LABEL[1]).toBe("스토리");
  });

  it("STORY_CATEGORY에 WEBTOON(1)과 VIDEO(2) 정의", () => {
    expect(STORY_CATEGORY.WEBTOON).toBe(1);
    expect(STORY_CATEGORY.VIDEO).toBe(2);
  });

  it("STORY_CATEGORY_LABEL이 한국어 레이블 포함", () => {
    expect(STORY_CATEGORY_LABEL[1]).toBe("웹툰");
    expect(STORY_CATEGORY_LABEL[2]).toBe("영상");
  });

  it("GUIDE_CATEGORY_NAMES에 최소 5개 카테고리 정의", () => {
    expect(Object.keys(GUIDE_CATEGORY_NAMES).length).toBeGreaterThanOrEqual(5);
  });

  it("MAP_TYPE_NAMES에 PVP(0) 포함", () => {
    expect(MAP_TYPE_NAMES[0]).toBe("PVP");
  });
});
