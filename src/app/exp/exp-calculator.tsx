"use client";

import { useState, useMemo } from "react";
import { getLevelLabel, getLevelRank, RANK_COLORS } from "@/lib/constants";

interface LevelEntry {
  level: number;
  exp: number;
}

function formatExp(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function ExpCalculator({ levels }: { levels: LevelEntry[] }) {
  const maxLv = levels[levels.length - 1].level;

  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentExp, setCurrentExp] = useState(0);
  const [targetLevel, setTargetLevel] = useState(10);

  const result = useMemo(() => {
    const cur = levels.find((l) => l.level === currentLevel);
    const tgt = levels.find((l) => l.level === targetLevel);
    if (!cur || !tgt || targetLevel <= currentLevel) return null;

    const totalNeeded = tgt.exp - cur.exp;
    const remaining = Math.max(0, totalNeeded - currentExp);

    // 구간별 경험치
    const segments: { from: number; to: number; exp: number }[] = [];
    for (let i = 0; i < levels.length - 1; i++) {
      if (levels[i].level >= currentLevel && levels[i].level < targetLevel) {
        segments.push({
          from: levels[i].level,
          to: levels[i + 1].level,
          exp: levels[i + 1].exp - levels[i].exp,
        });
      }
    }

    return { totalNeeded, remaining, segments };
  }, [levels, currentLevel, currentExp, targetLevel]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-surface-card p-4">
          <label className="block text-xs text-white/40 mb-1">현재 레벨</label>
          <select
            value={currentLevel}
            onChange={(e) => {
              const v = Number(e.target.value);
              setCurrentLevel(v);
              if (v >= targetLevel) setTargetLevel(Math.min(v + 1, maxLv));
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-white/90 outline-none focus:border-teal-500/50 appearance-none"
          >
            {levels.slice(0, -1).map((l) => (
              <option key={l.level} value={l.level}>
                {getLevelLabel(l.level)}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-white/10 bg-surface-card p-4">
          <label className="block text-xs text-white/40 mb-1">
            현재 경험치 (이번 레벨 내)
          </label>
          <input
            type="number"
            min={0}
            value={currentExp}
            onChange={(e) => setCurrentExp(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base font-bold text-white/90 tabular-nums outline-none focus:border-teal-500/50 sm:text-lg"
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-surface-card p-4">
          <label className="block text-xs text-white/40 mb-1">목표 레벨</label>
          <select
            value={targetLevel}
            onChange={(e) => setTargetLevel(Number(e.target.value))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-white/90 outline-none focus:border-teal-500/50 appearance-none"
          >
            {levels.filter((l) => l.level > currentLevel).map((l) => (
              <option key={l.level} value={l.level}>
                {getLevelLabel(l.level)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-white/10 bg-surface-card p-5">
          <div className="grid gap-4 sm:grid-cols-2 mb-5">
            <div>
              <div className="text-xs text-white/40">총 필요 경험치</div>
              <div className="text-2xl font-bold text-white/90 tabular-nums">
                {result.totalNeeded.toLocaleString()}
              </div>
              <div className="text-xs text-white/30">
                ({formatExp(result.totalNeeded)})
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">남은 경험치</div>
              <div className="text-2xl font-bold text-teal-300 tabular-nums">
                {result.remaining.toLocaleString()}
              </div>
              <div className="text-xs text-white/30">
                ({formatExp(result.remaining)})
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {result.totalNeeded > 0 && (
            <div className="mb-5">
              <div className="flex justify-between text-xs text-white/30 mb-1">
                <span>진행률</span>
                <span>
                  {((1 - result.remaining / result.totalNeeded) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all"
                  style={{
                    width: `${((1 - result.remaining / result.totalNeeded) * 100).toFixed(1)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Segment table */}
          {result.segments.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-white/40 mb-2">
                구간별 경험치
              </h3>
              <div className="max-h-[300px] overflow-y-auto rounded-lg border border-white/5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-white/30">
                      <th className="px-3 py-2 text-left">구간</th>
                      <th className="px-3 py-2 text-right">필요 경험치</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.segments.map((s) => (
                      <tr
                        key={s.from}
                        className="border-b border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="px-3 py-1.5 text-white/70 tabular-nums">
                          <span className="text-white/40 text-xs mr-1">{getLevelLabel(s.from)}</span>
                          → <span className="text-white/40 text-xs ml-1">{getLevelLabel(s.to)}</span>
                        </td>
                        <td className="px-3 py-1.5 text-right text-white/60 tabular-nums">
                          {s.exp.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Level table */}
      <div className="rounded-xl border border-white/10 bg-surface-card overflow-hidden">
        <div className="border-b border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/50">
          전체 레벨 테이블
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-card">
              <tr className="border-b border-white/10 text-xs text-white/30">
                <th className="px-3 py-2 text-left">레벨</th>
                <th className="px-3 py-2 text-left">계급</th>
                <th className="px-3 py-2 text-right">누적 경험치</th>
                <th className="px-3 py-2 text-right">구간 경험치</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((l, i) => (
                <tr
                  key={l.level}
                  className={`border-b border-white/5 ${
                    l.level >= currentLevel && l.level <= targetLevel
                      ? "bg-teal-950/20"
                      : ""
                  }`}
                >
                  <td className="px-3 py-1.5 text-white/70 tabular-nums">
                    {l.level}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-white/40">
                    {getLevelLabel(l.level)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-white/50 tabular-nums">
                    {l.exp.toLocaleString()}
                  </td>
                  <td className="px-3 py-1.5 text-right text-white/40 tabular-nums">
                    {i > 0
                      ? (l.exp - levels[i - 1].exp).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
