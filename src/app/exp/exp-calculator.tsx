"use client";

import { useState, useMemo } from "react";
import { LEVEL_RANKS, RANK_COLORS, getLevelLabel, getLevelRank } from "@/lib/constants";

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

function levelFromRank(rankIdx: number, colorIdx: number): number {
  const rank = LEVEL_RANKS[rankIdx];
  if (!rank) return 1;
  return rank.minLevel + colorIdx;
}

const selectClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-white/90 outline-none focus:border-teal-500/50";

function ColorBar({ colors, value, onChange }: { colors: typeof RANK_COLORS; value: number; onChange: (i: number) => void }) {
  return (
    <div className="flex gap-1">
      {colors.map((c, i) => (
        <button
          key={c.name}
          onClick={() => onChange(i)}
          title={c.name}
          className={`flex-1 h-8 rounded-md transition-all ${
            value === i
              ? "ring-2 ring-white/60 scale-110 z-10"
              : "opacity-60 hover:opacity-90"
          }`}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}

export function ExpCalculator({ levels }: { levels: LevelEntry[] }) {
  const maxLv = levels[levels.length - 1].level;

  // Current level = rank + color
  const [curRankIdx, setCurRankIdx] = useState(0);
  const [curColorIdx, setCurColorIdx] = useState(0);
  const [curPercent, setCurPercent] = useState(0);

  // Target level = rank + color
  const [tgtRankIdx, setTgtRankIdx] = useState(1);
  const [tgtColorIdx, setTgtColorIdx] = useState(0);

  // Fish EXP
  const [fishExp, setFishExp] = useState(0);

  // Average EXP per game
  const [expPerGame, setExpPerGame] = useState(0);

  const currentLevel = levelFromRank(curRankIdx, curColorIdx);
  const targetLevel = levelFromRank(tgtRankIdx, tgtColorIdx);

  const currentLevelData = useMemo(() => levels.find((l) => l.level === currentLevel), [levels, currentLevel]);
  const nextLevelData = useMemo(() => levels.find((l) => l.level === currentLevel + 1), [levels, currentLevel]);
  const currentExp = useMemo(() => {
    if (!currentLevelData || !nextLevelData) return 0;
    const segmentExp = nextLevelData.exp - currentLevelData.exp;
    return Math.floor(segmentExp * (curPercent / 100));
  }, [currentLevelData, nextLevelData, curPercent]);

  // Fish result
  const fishResult = useMemo(() => {
    if (fishExp <= 0 || !currentLevelData) return null;
    const totalCurExp = currentLevelData.exp + currentExp + fishExp;
    const afterLevel = levels.filter((l) => l.exp <= totalCurExp).pop();
    if (!afterLevel) return null;
    const nextAfter = levels.find((l) => l.level === afterLevel.level + 1);
    const afterPercent = nextAfter
      ? ((totalCurExp - afterLevel.exp) / (nextAfter.exp - afterLevel.exp)) * 100
      : 100;
    return {
      level: afterLevel.level,
      label: getLevelLabel(afterLevel.level),
      percent: Math.min(afterPercent, 99.99),
    };
  }, [levels, currentLevelData, currentExp, fishExp]);

  // Level diff calculation
  const result = useMemo(() => {
    if (targetLevel <= currentLevel) return null;
    const cur = levels.find((l) => l.level === currentLevel);
    const tgt = levels.find((l) => l.level === targetLevel);
    if (!cur || !tgt) return null;

    const totalNeeded = tgt.exp - cur.exp;
    const remaining = Math.max(0, totalNeeded - currentExp);

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

    const gamesNeeded = expPerGame > 0 ? Math.ceil(remaining / expPerGame) : null;

    return { totalNeeded, remaining, segments, gamesNeeded };
  }, [levels, currentLevel, currentExp, targetLevel, expPerGame]);

  function colorsForRank(rankIdx: number) {
    const rank = LEVEL_RANKS[rankIdx];
    if (!rank) return [];
    const count = rank.maxLevel - rank.minLevel + 1;
    return RANK_COLORS.slice(0, count);
  }

  return (
    <div className="space-y-6">
      {/* Current level */}
      <div className="rounded-xl border border-white/10 bg-surface-card p-4">
        <h3 className="text-sm font-medium text-white/50 mb-3">현재 레벨</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-[11px] text-white/30 mb-1">계급</label>
            <select
              value={curRankIdx}
              onChange={(e) => {
                setCurRankIdx(Number(e.target.value));
                setCurColorIdx(0);
              }}
              className={selectClass}
            >
              {LEVEL_RANKS.map((r, i) => (
                <option key={r.name} value={i}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-white/30 mb-1">색상</label>
            <ColorBar
              colors={colorsForRank(curRankIdx)}
              value={curColorIdx}
              onChange={setCurColorIdx}
            />
          </div>
          <div>
            <label className="block text-[11px] text-white/30 mb-1">진행률 (%)</label>
            <input
              type="number"
              min={0}
              max={99.99}
              step={0.01}
              value={curPercent}
              onChange={(e) => setCurPercent(Math.max(0, Math.min(99.99, Number(e.target.value))))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base font-bold text-white/90 tabular-nums outline-none focus:border-teal-500/50 sm:text-sm sm:py-2.5"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-white/60 flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLevelRank(currentLevel).hex }} />
          {getLevelLabel(currentLevel)} ({curPercent}%)
        </p>
      </div>

      {/* Fish EXP */}
      <div className="rounded-xl border border-white/10 bg-surface-card p-4">
        <h3 className="text-sm font-medium text-white/50 mb-3">어획물 경험치</h3>
        <input
          type="number"
          min={0}
          value={fishExp || ""}
          onChange={(e) => setFishExp(Math.max(0, Number(e.target.value)))}
          placeholder="교환할 어획물 EXP 입력"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base font-bold text-white/90 tabular-nums outline-none focus:border-teal-500/50 placeholder:text-white/20 placeholder:font-normal sm:text-sm sm:py-2.5"
        />
        {fishResult && (
          <div className="mt-3 rounded-lg bg-teal-950/30 border border-teal-500/20 px-4 py-3">
            <div className="text-xs text-white/40">교환 후 예상</div>
            <div className="text-lg font-bold text-teal-300">
              {fishResult.label}
              <span className="text-sm font-normal text-white/50 ml-2">
                ({fishResult.percent.toFixed(2)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Average EXP per game */}
      <div className="rounded-xl border border-white/10 bg-surface-card p-4">
        <h3 className="text-sm font-medium text-white/50 mb-3">게임당 평균 경험치</h3>
        <input
          type="number"
          min={0}
          value={expPerGame || ""}
          onChange={(e) => setExpPerGame(Math.max(0, Number(e.target.value)))}
          placeholder="한 판당 얻는 평균 EXP 입력"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base font-bold text-white/90 tabular-nums outline-none focus:border-teal-500/50 placeholder:text-white/20 placeholder:font-normal sm:text-sm sm:py-2.5"
        />
        <p className="mt-1.5 text-[11px] text-white/25">
          입력 시 목표까지 필요한 게임 수를 계산합니다.
        </p>
      </div>

      {/* Target level */}
      <div className="rounded-xl border border-white/10 bg-surface-card p-4">
        <h3 className="text-sm font-medium text-white/50 mb-3">목표 레벨</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] text-white/30 mb-1">계급</label>
            <select
              value={tgtRankIdx}
              onChange={(e) => {
                setTgtRankIdx(Number(e.target.value));
                setTgtColorIdx(0);
              }}
              className={selectClass}
            >
              {LEVEL_RANKS.map((r, i) => (
                <option key={r.name} value={i}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-white/30 mb-1">색상</label>
            <ColorBar
              colors={colorsForRank(tgtRankIdx)}
              value={tgtColorIdx}
              onChange={setTgtColorIdx}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-white/60 flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLevelRank(targetLevel).hex }} />
          {getLevelLabel(targetLevel)}
        </p>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-white/10 bg-surface-card p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2 mb-5">
            <div>
              <div className="text-xs text-white/40">총 필요 경험치</div>
              <div className="text-xl sm:text-2xl font-bold text-white/90 tabular-nums">
                {result.totalNeeded.toLocaleString()}
              </div>
              <div className="text-xs text-white/30">
                ({formatExp(result.totalNeeded)})
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">남은 경험치</div>
              <div className="text-xl sm:text-2xl font-bold text-teal-300 tabular-nums">
                {result.remaining.toLocaleString()}
              </div>
              <div className="text-xs text-white/30">
                ({formatExp(result.remaining)})
              </div>
            </div>
          </div>

          {result.gamesNeeded !== null && (
            <div className="mb-5 rounded-lg bg-teal-950/30 border border-teal-500/20 px-4 py-3">
              <div className="text-xs text-white/40">필요한 게임 수</div>
              <div className="text-xl sm:text-2xl font-bold text-teal-300 tabular-nums">
                {result.gamesNeeded.toLocaleString()}
                <span className="text-sm font-normal text-white/40 ml-1">판</span>
              </div>
              <div className="text-xs text-white/25 mt-0.5">
                게임당 {expPerGame.toLocaleString()} EXP 기준
              </div>
            </div>
          )}

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
                        <td className="px-3 py-1.5 text-xs text-white/50">
                          {getLevelLabel(s.from)} → {getLevelLabel(s.to)}
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
                  <td className="px-3 py-1.5 text-xs text-white/60">
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
