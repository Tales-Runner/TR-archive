import type { ProbabilityItem } from "@/lib/types";

/**
 * Probability that at least one success occurs in `tries` independent trials
 * where each trial succeeds with `singleProb` percent.
 *
 * Edge cases: 100% → always 100, 0% → always 0. Both short-circuit to avoid
 * floating-point noise at the boundaries (e.g. `1 - Math.pow(0, tries)` is
 * technically defined but we'd rather not explain NaN if tries === 0).
 */
export function calcCumulativeProb(singleProb: number, tries: number): number {
  if (singleProb >= 100) return 100;
  if (singleProb <= 0) return 0;
  return (1 - Math.pow(1 - singleProb / 100, tries)) * 100;
}

/**
 * Group trading-category probability items by inferred series name so the
 * UI can show a sub-selector ("New.2 트레이딩", "아틀리에", …) instead of a
 * 139-row flat dropdown.
 */
export function groupItems(items: ProbabilityItem[]): Record<string, ProbabilityItem[]> {
  const groups: Record<string, ProbabilityItem[]> = {};
  for (const item of items) {
    const nm = item.itemNm;
    let group: string;
    if (nm.startsWith("New.2")) group = "New.2 트레이딩";
    else if (nm.startsWith("New.1")) group = "New.1 트레이딩";
    else if (nm.startsWith("5th")) group = "5th 트레이딩";
    else if (nm.startsWith("4th")) group = "4th 트레이딩";
    else if (nm.startsWith("3rd")) group = "3rd 트레이딩";
    else if (nm.startsWith("2nd")) group = "2nd 트레이딩";
    else if (nm.startsWith("1st")) group = "1st 트레이딩";
    else if (nm.startsWith("21-23")) group = "21-23 트레이딩";
    else if (nm.includes("아틀리에")) group = "아틀리에";
    else if (nm.includes("트레이딩 변경권")) group = "연도별 트레이딩";
    else group = "기타";
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  }
  return groups;
}

/** Keep only rows that describe an actual transition (skip totals headers). */
export function getTransitions(item: ProbabilityItem) {
  return item.itemList.filter((r) => r.targetNm && r.sourceNm !== "합계");
}

export function isTrading(catId: string): boolean {
  return catId.startsWith("trading");
}
