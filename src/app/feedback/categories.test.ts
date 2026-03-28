import { describe, it, expect } from "vitest";
import { FEEDBACK_CATEGORIES, CATEGORY_LABEL_MAP } from "./categories";

describe("FEEDBACK_CATEGORIES", () => {
  it("4개 카테고리가 정의되어 있음", () => {
    expect(FEEDBACK_CATEGORIES).toHaveLength(4);
  });

  it("모든 카테고리에 value, label, desc가 있음", () => {
    for (const cat of FEEDBACK_CATEGORIES) {
      expect(cat.value).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(cat.desc).toBeTruthy();
    }
  });

  it("bug, feature, data, other 카테고리가 포함", () => {
    const values = FEEDBACK_CATEGORIES.map((c) => c.value);
    expect(values).toContain("bug");
    expect(values).toContain("feature");
    expect(values).toContain("data");
    expect(values).toContain("other");
  });

  it("레이블이 한국어", () => {
    for (const cat of FEEDBACK_CATEGORIES) {
      expect(cat.label).toMatch(/[\uAC00-\uD7AF]/);
    }
  });
});

describe("CATEGORY_LABEL_MAP", () => {
  it("FEEDBACK_CATEGORIES와 동일한 매핑", () => {
    for (const cat of FEEDBACK_CATEGORIES) {
      expect(CATEGORY_LABEL_MAP[cat.value]).toBe(cat.label);
    }
  });

  it("bug -> 버그 제보", () => {
    expect(CATEGORY_LABEL_MAP["bug"]).toBe("버그 제보");
  });
});
