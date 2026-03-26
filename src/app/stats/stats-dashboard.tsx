"use client";

import { useMemo, useState } from "react";
import type { Character, MapItem, CostumeItem, StoryItem, ProbabilityData } from "@/lib/types";
import { CHARACTER_CATEGORY_LABEL, STORY_CATEGORY_LABEL, getLevelLabel } from "@/lib/constants";

interface Props {
  characters: Character[];
  maps: MapItem[];
  costumes: CostumeItem[];
  stories: StoryItem[];
  probability: ProbabilityData;
  levels: { level: number; exp: number }[];
}

function Bar({ value, max, color = "bg-teal-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 flex-1 rounded-full bg-white/5 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-card p-4 sm:p-5 animate-fade-in">
      <h3 className="text-sm font-bold text-accent-light mb-4">{title}</h3>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3 text-center">
      <div className="text-2xl font-bold text-white/90 tabular-nums">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
      {sub && <div className="text-[10px] text-white/25 mt-0.5">{sub}</div>}
    </div>
  );
}

export function StatsDashboard({ characters, maps, costumes, stories, probability, levels }: Props) {
  const [tab, setTab] = useState<"overview" | "characters" | "content" | "gacha" | "exp">("overview");

  const visibleChars = useMemo(() => characters.filter((c) => c.isView), [characters]);

  // Character stats
  const charStats = useMemo(() => {
    const mbti: Record<string, number> = {};
    const blood: Record<string, number> = {};
    const jobs: string[] = [];
    let tallest = visibleChars[0];
    let shortest = visibleChars[0];
    let strongest = visibleChars[0];

    for (const c of visibleChars) {
      if (c.mbti && c.mbti !== "?") mbti[c.mbti] = (mbti[c.mbti] || 0) + 1;
      if (c.bloodType && c.bloodType !== "?") blood[c.bloodType] = (blood[c.bloodType] || 0) + 1;
      if (c.job) jobs.push(c.job);

      const h = parseFloat(c.height);
      if (!isNaN(h)) {
        if (h > parseFloat(tallest.height || "0")) tallest = c;
        if (h < parseFloat(shortest.height || "999")) shortest = c;
      }

      const total = c.maximumSpeed + c.acceleration + c.control + c.power;
      const bestTotal = strongest.maximumSpeed + strongest.acceleration + strongest.control + strongest.power;
      if (total > bestTotal) strongest = c;
    }

    const sortedMbti = Object.entries(mbti).sort((a, b) => b[1] - a[1]);
    const sortedBlood = Object.entries(blood).sort((a, b) => b[1] - a[1]);

    return { mbti: sortedMbti, blood: sortedBlood, tallest, shortest, strongest, uniqueJobs: new Set(jobs).size };
  }, [visibleChars]);

  // Map stats
  const mapStats = useMemo(() => {
    const typeCount: Record<number, number> = {};
    const yearCount: Record<string, number> = {};
    for (const m of maps) {
      if (m.mapTypeCd !== null) typeCount[m.mapTypeCd] = (typeCount[m.mapTypeCd] || 0) + 1;
      const y = m.openDt.slice(0, 4);
      yearCount[y] = (yearCount[y] || 0) + 1;
    }
    return { typeCount, yearCount };
  }, [maps]);

  const typeNames: Record<number, string> = { 0: "PVP", 1: "협동", 2: "하드코어", 3: "트레이닝", 4: "럼블", 5: "서바이벌", 6: "아케이드" };

  // Story stats
  const storyStats = useMemo(() => {
    const yearCount: Record<string, number> = {};
    let webtoon = 0;
    let video = 0;
    for (const s of stories) {
      yearCount[s.openYear] = (yearCount[s.openYear] || 0) + 1;
      if (s.category === 1) webtoon++;
      else video++;
    }
    return { yearCount, webtoon, video, totalImages: stories.reduce((sum, s) => sum + s.images.length, 0) };
  }, [stories]);

  // Costume stats
  const costumeStats = useMemo(() => {
    const yearCount: Record<string, number> = {};
    let totalItems = 0;
    for (const c of costumes) {
      yearCount[c.openYear] = (yearCount[c.openYear] || 0) + 1;
      totalItems += c.detail?.itemList.length ?? 0;
    }
    return { yearCount, totalItems };
  }, [costumes]);

  // Gacha stats
  const gachaStats = useMemo(() => {
    const items = probability.itemList;
    let lowestProb = 100;
    let lowestName = "";
    let lowestTarget = "";

    for (const item of items) {
      for (const t of item.itemList) {
        if (t.targetNm && t.sourceNm !== "합계" && t.probability > 0 && t.probability < lowestProb) {
          lowestProb = t.probability;
          lowestName = item.itemNm;
          lowestTarget = t.targetNm;
        }
      }
    }

    return { totalItems: items.length, lowestProb, lowestName, lowestTarget };
  }, [probability]);

  // Level stats
  const levelStats = useMemo(() => {
    const maxLv = levels[levels.length - 1];
    const lv95 = levels.find((l) => l.level === 95);
    const lv125 = levels.find((l) => l.level === 125);
    const last2delta = maxLv.exp - (lv125?.exp ?? 0);

    return {
      maxLevel: maxLv.level,
      maxExp: maxLv.exp,
      lv50percent: (() => {
        const half = maxLv.exp / 2;
        const l = levels.filter((lv) => lv.exp <= half).pop();
        return l?.level ?? 0;
      })(),
      last2delta,
      lv1to95: lv95?.exp ?? 0,
    };
  }, [levels]);

  const tabs = [
    { id: "overview" as const, label: "전체 현황" },
    { id: "characters" as const, label: "캐릭터" },
    { id: "content" as const, label: "콘텐츠" },
    { id: "gacha" as const, label: "변경권" },
    { id: "exp" as const, label: "경험치" },
  ];

  return (
    <div>
      <div className="flex overflow-x-auto rounded-lg border border-white/10 text-sm mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-4 py-2 font-medium transition-colors ${
              tab === t.id ? "bg-teal-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 stagger-grid">
            <StatCard label="플레이 캐릭터" value={visibleChars.length} sub="명" />
            <StatCard label="맵" value={maps.length} sub="개" />
            <StatCard label="변경권" value={gachaStats.totalItems} sub="종" />
            <StatCard label="최저 변경권 확률" value={`${gachaStats.lowestProb}%`} sub={gachaStats.lowestTarget} />
            <StatCard label="최고 레벨" value={getLevelLabel(levelStats.maxLevel)} sub={`누적 ${(levelStats.maxExp / 1_000_000_000).toFixed(1)}B EXP`} />
            <StatCard label="EXP 절반 지점" value={getLevelLabel(levelStats.lv50percent)} sub="여기까지가 전체의 50%" />
          </div>
        </div>
      )}

      {tab === "characters" && (
        <div className="space-y-6 stagger-grid">
          <Section title="스탯 랭킹 (총합)">
            <div className="space-y-1.5">
              {[...visibleChars]
                .sort((a, b) => (b.maximumSpeed + b.acceleration + b.control + b.power) - (a.maximumSpeed + a.acceleration + a.control + a.power))
                .slice(0, 10)
                .map((c) => {
                  const total = c.maximumSpeed + c.acceleration + c.control + c.power;
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <img src={c.circularImageUrl} alt="" width={24} height={24} className="rounded-full shrink-0" />
                      <span className="text-sm text-white/80 w-24 truncate">{c.characterNm}</span>
                      <Bar value={total} max={24} />
                      <span className="text-sm font-bold text-white/70 tabular-nums w-8 text-right">{total}</span>
                    </div>
                  );
                })}
            </div>
          </Section>

          <Section title="MBTI 분포">
            <div className="space-y-1.5">
              {charStats.mbti.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-sm text-white/70 w-12 font-mono">{type}</span>
                  <Bar value={count} max={charStats.mbti[0][1] as number} color="bg-violet-500" />
                  <span className="text-sm text-white/50 tabular-nums w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="혈액형 분포">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {charStats.blood.map(([type, count]) => (
                <div key={type} className="rounded-lg bg-white/[0.03] p-3 text-center">
                  <div className="text-xl font-bold text-white/80">{count}</div>
                  <div className="text-xs text-white/40">{type}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="재밌는 사실">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="text-[10px] text-white/30">가장 큰 캐릭터</div>
                <div className="text-sm font-bold text-white/80">{charStats.tallest.characterNm}</div>
                <div className="text-xs text-white/40">{charStats.tallest.height}</div>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="text-[10px] text-white/30">가장 작은 캐릭터</div>
                <div className="text-sm font-bold text-white/80">{charStats.shortest.characterNm}</div>
                <div className="text-xs text-white/40">{charStats.shortest.height}</div>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="text-[10px] text-white/30">최고 스탯 캐릭터</div>
                <div className="text-sm font-bold text-white/80">{charStats.strongest.characterNm}</div>
                <div className="text-xs text-white/40">총합 {charStats.strongest.maximumSpeed + charStats.strongest.acceleration + charStats.strongest.control + charStats.strongest.power}</div>
              </div>
            </div>
          </Section>
        </div>
      )}

      {tab === "content" && (
        <div className="space-y-6 stagger-grid">
          <Section title="연도별 맵 출시">
            <div className="space-y-1.5">
              {Object.entries(mapStats.yearCount).sort().map(([year, count]) => (
                <div key={year} className="flex items-center gap-3">
                  <span className="text-sm text-white/70 w-12">{year}</span>
                  <Bar value={count} max={Math.max(...Object.values(mapStats.yearCount))} />
                  <span className="text-sm text-white/50 tabular-nums w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="맵 타입 분포">
            <div className="space-y-1.5">
              {Object.entries(mapStats.typeCount)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-sm text-white/70 w-20">{typeNames[Number(type)] ?? type}</span>
                    <Bar value={count} max={Math.max(...Object.values(mapStats.typeCount))} color="bg-red-400" />
                    <span className="text-sm text-white/50 tabular-nums w-6 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </Section>

          <Section title="연도별 스토리">
            <div className="space-y-1.5">
              {Object.entries(storyStats.yearCount).map(([year, count]) => (
                <div key={year} className="flex items-center gap-3">
                  <span className="text-sm text-white/70 w-16 truncate">{year}</span>
                  <Bar value={count} max={Math.max(...Object.values(storyStats.yearCount))} color="bg-blue-400" />
                  <span className="text-sm text-white/50 tabular-nums w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-white/30">
              웹툰 {storyStats.webtoon}개 / 영상 {storyStats.video}개 / 총 이미지 {storyStats.totalImages.toLocaleString()}장
            </p>
          </Section>

          <Section title="연도별 코스튬">
            <div className="space-y-1.5">
              {Object.entries(costumeStats.yearCount).map(([year, count]) => (
                <div key={year} className="flex items-center gap-3">
                  <span className="text-sm text-white/70 w-16 truncate">{year}</span>
                  <Bar value={count} max={Math.max(...Object.values(costumeStats.yearCount))} color="bg-pink-400" />
                  <span className="text-sm text-white/50 tabular-nums w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-white/30">
              총 {costumeStats.totalItems}개 아이템
            </p>
          </Section>
        </div>
      )}

      {tab === "gacha" && (
        <div className="space-y-6 stagger-grid">
          <Section title="변경권 요약">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="변경권 종류" value={gachaStats.totalItems} />
              <StatCard label="최저 확률" value={`${gachaStats.lowestProb}%`} sub={gachaStats.lowestTarget} />
            </div>
            <div className="mt-4 rounded-lg bg-red-950/20 border border-red-500/20 p-3">
              <div className="text-xs text-red-300 font-medium">최악의 확률</div>
              <div className="text-sm text-white/80 mt-1">{gachaStats.lowestName}</div>
              <div className="text-xs text-white/50">
                {gachaStats.lowestTarget} — {gachaStats.lowestProb}% (1/{Math.round(100 / gachaStats.lowestProb)})
              </div>
            </div>
          </Section>

          <Section title="기대 시행 횟수">
            <p className="text-xs text-white/40 mb-3">
              목표 등급을 1번 이상 달성할 확률이 63.2%가 되는 시행 횟수 (1/p)
            </p>
            <div className="space-y-2">
              {[0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10].map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <span className="text-sm text-white/70 w-16 text-right">{p}%</span>
                  <Bar value={Math.log10(100 / p)} max={Math.log10(100 / 0.005)} color="bg-amber-500" />
                  <span className="text-sm text-white/50 tabular-nums w-16 text-right">{Math.round(100 / p).toLocaleString()}회</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {tab === "exp" && (
        <div className="space-y-6 stagger-grid">
          <Section title="레벨 경험치 곡선">
            <div className="h-48 flex items-end gap-px">
              {levels.map((l) => {
                const pct = levels[levels.length - 1].exp > 0
                  ? (Math.log10(l.exp + 1) / Math.log10(levels[levels.length - 1].exp)) * 100
                  : 0;
                return (
                  <div
                    key={l.level}
                    className="flex-1 bg-teal-500/60 rounded-t-sm hover:bg-teal-400 transition-colors"
                    style={{ height: `${pct}%` }}
                    title={`${getLevelLabel(l.level)}: ${l.exp.toLocaleString()} EXP`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-white/20 mt-1">
              <span>Lv.1</span>
              <span>Lv.{levels[levels.length - 1].level}</span>
            </div>
            <p className="text-xs text-white/30 mt-2">로그 스케일 — 실제 차이는 훨씬 극적</p>
          </Section>

          <Section title="재밌는 사실">
            <div className="space-y-3">
              <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="text-xs text-white/30">전체 경험치의 절반 지점</div>
                <div className="text-sm font-bold text-white/80">
                  {getLevelLabel(levelStats.lv50percent)}
                </div>
                <div className="text-xs text-white/40">
                  여기까지가 50%, 나머지 {levels[levels.length - 1].level - levelStats.lv50percent}레벨이 나머지 50%
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="text-xs text-white/30">125 → 126 구간 경험치</div>
                <div className="text-sm font-bold text-white/80">
                  {levelStats.last2delta.toLocaleString()} EXP
                </div>
                <div className="text-xs text-white/40">
                  1~95레벨 전체 ({levelStats.lv1to95.toLocaleString()})보다 많음
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="text-xs text-white/30">최종 레벨 누적 경험치</div>
                <div className="text-sm font-bold text-white/80">
                  {levelStats.maxExp.toLocaleString()} EXP
                </div>
                <div className="text-xs text-white/40">약 {(levelStats.maxExp / 1_000_000_000).toFixed(1)}B</div>
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
