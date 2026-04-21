import { describe, it, expect } from "vitest";
import {
  calcCumulativeProb,
  getTransitions,
  groupItems,
  isTrading,
} from "./probability-utils";
import type { ProbabilityItem } from "@/lib/types";

function item(itemNm: string, rows: ProbabilityItem["itemList"] = []): ProbabilityItem {
  return { itemNm, itemList: rows };
}

describe("calcCumulativeProb", () => {
  it("100% 는 시행 수와 무관하게 100 반환", () => {
    expect(calcCumulativeProb(100, 1)).toBe(100);
    expect(calcCumulativeProb(100, 50)).toBe(100);
  });

  it("0% 는 시행 수와 무관하게 0 반환", () => {
    expect(calcCumulativeProb(0, 1)).toBe(0);
    expect(calcCumulativeProb(0, 999)).toBe(0);
  });

  it("10% 1회 → 10%", () => {
    expect(calcCumulativeProb(10, 1)).toBeCloseTo(10, 5);
  });

  it("10% 10회 → 약 65.13%", () => {
    expect(calcCumulativeProb(10, 10)).toBeCloseTo(65.132, 2);
  });

  it("50% 2회 → 75%", () => {
    expect(calcCumulativeProb(50, 2)).toBeCloseTo(75, 5);
  });

  it("시행 수 증가 시 단조 증가", () => {
    const p = 5;
    let prev = 0;
    for (const n of [1, 2, 5, 10, 100]) {
      const cur = calcCumulativeProb(p, n);
      expect(cur).toBeGreaterThan(prev);
      prev = cur;
    }
  });

  it("100 을 넘지 않음", () => {
    expect(calcCumulativeProb(99.99, 1000)).toBeLessThanOrEqual(100);
  });
});

describe("groupItems", () => {
  it("New.2 / New.1 / n-th 시리즈를 별도 그룹으로 분리", () => {
    const items = [
      item("New.2 변경권"),
      item("New.1 변경권"),
      item("5th 변경권"),
      item("4th 변경권"),
      item("3rd 변경권"),
      item("2nd 변경권"),
      item("1st 변경권"),
    ];
    const groups = groupItems(items);
    expect(Object.keys(groups)).toHaveLength(7);
    expect(groups["New.2 트레이딩"]).toHaveLength(1);
    expect(groups["5th 트레이딩"]).toHaveLength(1);
  });

  it("아틀리에 포함 아이템은 아틀리에 그룹", () => {
    const groups = groupItems([item("아틀리에 변경권 A"), item("아틀리에 B")]);
    expect(groups["아틀리에"]).toHaveLength(2);
  });

  it("매칭 안 되는 아이템은 기타 그룹", () => {
    const groups = groupItems([item("알 수 없는 변경권")]);
    expect(groups["기타"]).toHaveLength(1);
  });

  it("빈 배열 → 빈 그룹", () => {
    expect(groupItems([])).toEqual({});
  });

  it("같은 그룹의 아이템은 누적됨", () => {
    const groups = groupItems([item("3rd A"), item("3rd B"), item("3rd C")]);
    expect(groups["3rd 트레이딩"]).toHaveLength(3);
  });
});

describe("getTransitions", () => {
  it("targetNm 없는 행은 제외", () => {
    const rows = [
      { sourceNm: "A", targetNm: "B", probability: 10 },
      { sourceNm: "A", targetNm: "", probability: 0 },
    ];
    expect(getTransitions(item("t", rows))).toHaveLength(1);
  });

  it("sourceNm=합계 헤더는 제외", () => {
    const rows = [
      { sourceNm: "합계", targetNm: "B", probability: 100 },
      { sourceNm: "A", targetNm: "B", probability: 10 },
    ];
    const out = getTransitions(item("t", rows));
    expect(out).toHaveLength(1);
    expect(out[0].sourceNm).toBe("A");
  });
});

describe("isTrading", () => {
  it("trading- 접두어만 true", () => {
    expect(isTrading("trading-level")).toBe(true);
    expect(isTrading("trading-position")).toBe(true);
    expect(isTrading("selectshop")).toBe(false);
    expect(isTrading("")).toBe(false);
  });
});
