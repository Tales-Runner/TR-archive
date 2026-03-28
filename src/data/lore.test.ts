import { describe, it, expect } from "vitest";
import { STORY_ARCS, matchArcStories } from "./lore";

describe("STORY_ARCS 데이터 무결성", () => {
  it("스토리 아크가 1개 이상 존재", () => {
    expect(STORY_ARCS.length).toBeGreaterThan(0);
  });

  it("모든 아크에 필수 필드가 존재", () => {
    for (const arc of STORY_ARCS) {
      expect(arc.id).toBeTruthy();
      expect(arc.title).toBeTruthy();
      expect(arc.period).toBeTruthy();
      expect(arc.episodes).toBeGreaterThan(0);
      expect(typeof arc.hasVideo).toBe("boolean");
      expect(Array.isArray(arc.characters)).toBe(true);
      expect(Array.isArray(arc.storyTags)).toBe(true);
      expect(arc.storyTags.length).toBeGreaterThan(0);
      expect(arc.summary).toBeTruthy();
      expect(arc.elimsComment).toBeTruthy();
    }
  });

  it("아크 ID가 중복되지 않음", () => {
    const ids = STORY_ARCS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("matchArcStories", () => {
  const mockStories = [
    { id: 1, hashTagSubject: "카오스제너레이션, 액션" },
    { id: 2, hashTagSubject: "테일즈프론티어" },
    { id: 3, hashTagSubject: "일상, 코미디" },
    { id: 4, hashTagSubject: "카오스제너레이션" },
  ];

  it("태그가 매칭되는 스토리 ID를 반환", () => {
    const chaosGen = STORY_ARCS.find((a) => a.id === "chaos-gen")!;
    const result = matchArcStories(chaosGen, mockStories);
    expect(result).toContain(1);
    expect(result).toContain(4);
    expect(result).not.toContain(3);
  });

  it("매칭되는 스토리가 없으면 빈 배열", () => {
    const chaosGen = STORY_ARCS.find((a) => a.id === "chaos-gen")!;
    const result = matchArcStories(chaosGen, [
      { id: 10, hashTagSubject: "관련없는태그" },
    ]);
    expect(result).toEqual([]);
  });

  it("프론티어 아크는 테일즈프론티어 태그 매칭", () => {
    const frontier = STORY_ARCS.find((a) => a.id === "frontier")!;
    const result = matchArcStories(frontier, mockStories);
    expect(result).toContain(2);
    expect(result).toHaveLength(1);
  });
});
