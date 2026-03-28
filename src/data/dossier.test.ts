import { describe, it, expect } from "vitest";
import { getDossier, getRelatedCharacterIds, DOSSIERS } from "./dossier";

describe("DOSSIERS 데이터 무결성", () => {
  it("도시에가 1개 이상 존재", () => {
    expect(DOSSIERS.length).toBeGreaterThan(0);
  });

  it("모든 도시에에 필수 필드가 존재", () => {
    for (const d of DOSSIERS) {
      expect(d.characterId).toBeTypeOf("number");
      expect(d.name).toBeTruthy();
      expect(Array.isArray(d.relations)).toBe(true);
      expect(Array.isArray(d.storyArcIds)).toBe(true);
      expect(Array.isArray(d.trivia)).toBe(true);
      expect(d.elimsNote).toBeTruthy();
    }
  });

  it("characterId가 중복되지 않음", () => {
    const ids = DOSSIERS.map((d) => d.characterId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("모든 관계의 type이 유효한 RelationType", () => {
    const validTypes = ["가족", "창조", "동료", "적대", "보호", "동행", "소속", "연관"];
    for (const d of DOSSIERS) {
      for (const r of d.relations) {
        expect(validTypes).toContain(r.type);
      }
    }
  });
});

describe("getDossier", () => {
  it("카이(50)의 도시에를 찾음", () => {
    const d = getDossier(50);
    expect(d).toBeDefined();
    expect(d!.name).toBe("카이");
  });

  it("R(60)의 도시에를 찾음", () => {
    const d = getDossier(60);
    expect(d).toBeDefined();
    expect(d!.name).toBe("R");
  });

  it("존재하지 않는 ID는 undefined", () => {
    expect(getDossier(99999)).toBeUndefined();
  });
});

describe("getRelatedCharacterIds", () => {
  it("카이(50)의 관련 캐릭터에 하루(54)와 R(60) 포함", () => {
    const ids = getRelatedCharacterIds(50);
    expect(ids).toContain(54);
    expect(ids).toContain(60);
  });

  it("존재하지 않는 캐릭터는 빈 배열 반환", () => {
    expect(getRelatedCharacterIds(99999)).toEqual([]);
  });

  it("targetId가 없는 관계는 결과에 포함되지 않음", () => {
    const ids = getRelatedCharacterIds(50);
    expect(ids.every((id) => typeof id === "number")).toBe(true);
  });

  it("연오(63)는 관계가 없으므로 빈 배열", () => {
    expect(getRelatedCharacterIds(63)).toEqual([]);
  });
});
