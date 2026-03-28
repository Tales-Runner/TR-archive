"use client";

import { useState, useMemo } from "react";
import type { ProbabilityData, ProbabilityItem } from "@/lib/types";

function groupItems(items: ProbabilityItem[]) {
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

function getTransitions(item: ProbabilityItem) {
  return item.itemList.filter((r) => r.targetNm && r.sourceNm !== "합계");
}

function calcCumulativeProb(singleProb: number, tries: number): number {
  if (singleProb >= 100) return 100;
  if (singleProb <= 0) return 0;
  return (1 - Math.pow(1 - singleProb / 100, tries)) * 100;
}

function ProbBar({ pct, label }: { pct: number; label: string }) {
  const color =
    pct >= 90
      ? "bg-emerald-500"
      : pct >= 50
        ? "bg-yellow-500"
        : pct >= 20
          ? "bg-orange-400"
          : "bg-red-400";
  return (
    <div className="flex items-center gap-3">
      <div className="h-3 flex-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="w-20 text-right text-sm font-medium tabular-nums text-white/80">
        {label}
      </span>
    </div>
  );
}

export function ProbabilityCalculator({ data }: { data: ProbabilityData }) {
  const groups = useMemo(() => groupItems(data.itemList), [data]);
  const groupNames = Object.keys(groups);

  const [selectedGroup, setSelectedGroup] = useState(groupNames[0]);
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const [tries, setTries] = useState(10);
  const [targetGrade, setTargetGrade] = useState<string | null>(null);

  const currentItems = groups[selectedGroup] ?? [];
  const currentItem = currentItems[selectedItemIdx];
  const transitions = currentItem ? getTransitions(currentItem) : [];

  const targetGrades = useMemo(() => {
    const set = new Set<string>();
    for (const t of transitions) {
      if (t.targetNm) set.add(t.targetNm);
    }
    return Array.from(set);
  }, [transitions]);

  const handleItemChange = (idx: number) => {
    setSelectedItemIdx(idx);
    setTargetGrade(null);
    setTries(10);
  };

  const handleGroupChange = (g: string) => {
    setSelectedGroup(g);
    setSelectedItemIdx(0);
    setTargetGrade(null);
    setTries(10);
  };

  const simulationResult = useMemo(() => {
    if (!targetGrade || !currentItem) return null;
    const matching = transitions.filter((t) => t.targetNm === targetGrade);
    return matching.map((m) => ({
      source: m.sourceNm,
      target: m.targetNm!,
      singleProb: m.probability,
      cumulative: calcCumulativeProb(m.probability, tries),
    }));
  }, [targetGrade, currentItem, transitions, tries]);

  return (
    <div className="space-y-6">
      {/* Group selector */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        {groupNames.map((g) => (
          <button
            key={g}
            onClick={() => handleGroupChange(g)}
            className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-colors ${
              selectedGroup === g
                ? "border-teal-500 bg-teal-600 text-white"
                : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Item selector */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/40">
          변경권 선택
        </label>
        <select
          value={selectedItemIdx}
          onChange={(e) => handleItemChange(Number(e.target.value))}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/80 outline-none focus:border-teal-500/50"
        >
          {currentItems.map((item, i) => (
            <option key={i} value={i}>
              {item.itemNm}
            </option>
          ))}
        </select>
      </div>

      {/* Probability table */}
      {currentItem && (
        <div className="rounded-xl border border-white/10 bg-surface-card overflow-hidden">
          <p className="text-center text-[10px] text-white/40 py-0.5 sm:hidden">&larr; 좌우로 스크롤 &rarr;</p>
          <div className="overflow-x-auto">
          <div className="border-b border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/70">
            {currentItem.itemNm} — 확률표
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-white/40">
                <th className="px-4 py-2.5">현재 등급</th>
                <th className="px-4 py-2.5">결과 등급</th>
                <th className="px-4 py-2.5 text-right">확률</th>
              </tr>
            </thead>
            <tbody>
              {transitions.map((t, i) => (
                <tr
                  key={i}
                  className={`border-b border-white/5 ${targetGrade === t.targetNm ? "bg-teal-500/10" : ""}`}
                >
                  <td className="px-4 py-2.5 text-white/50">{t.sourceNm}</td>
                  <td className="px-4 py-2.5 font-medium text-white/80">
                    {t.targetNm}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-white/60">
                    {t.probability.toFixed(4)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Simulator */}
      {transitions.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-surface-card p-5 space-y-5">
          <h3 className="font-semibold text-white/80">기대값 시뮬레이터</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/40">
                목표 등급
              </label>
              <select
                value={targetGrade ?? ""}
                onChange={(e) => setTargetGrade(e.target.value || null)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/80 outline-none focus:border-teal-500/50"
              >
                <option value="">선택하세요</option>
                {targetGrades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/40">
                시행 횟수
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={tries}
                onChange={(e) =>
                  setTries(Math.max(1, Math.min(1000, Number(e.target.value))))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/80 outline-none focus:border-teal-500/50"
              />
            </div>
          </div>

          {simulationResult && simulationResult.length > 0 && (
            <div className="space-y-3 pt-2">
              {simulationResult.map((r, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="text-xs text-white/40">
                    {r.source} → {r.target} (1회: {r.singleProb.toFixed(4)}%)
                  </div>
                  <ProbBar
                    pct={r.cumulative}
                    label={`${r.cumulative.toFixed(2)}%`}
                  />
                  <div className="text-xs text-white/40">
                    {tries}회 시행 시 1번 이상 나올 확률
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-xs font-medium text-white/40 mb-2">
                  횟수별 누적 확률
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                  {[1, 5, 10, 20, 50].map((n) => {
                    const r = simulationResult[0];
                    const cum = calcCumulativeProb(r.singleProb, n);
                    return (
                      <div
                        key={n}
                        className="rounded-lg bg-white/5 p-2.5 text-center"
                      >
                        <div className="font-medium text-white/60">{n}회</div>
                        <div className="tabular-nums text-white/40">
                          {cum.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
