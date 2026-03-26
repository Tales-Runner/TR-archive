"use client";

import { useMemo, useState } from "react";
import type { Character, MapItem, CostumeItem, StoryItem, ProbabilityData } from "@/lib/types";
import { getLevelLabel, getLevelRank, MAP_TYPE_NAMES } from "@/lib/constants";

interface Props {
  characters: Character[];
  maps: MapItem[];
  costumes: CostumeItem[];
  stories: StoryItem[];
  probability: ProbabilityData;
  levels: { level: number; exp: number }[];
}

/* ── Shared building blocks ──────────────────────────── */

function Bar({ value, max, color = "bg-teal-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 flex-1 rounded-full bg-white/5 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Section({ title, children, accent, sub }: { title: string; children: React.ReactNode; accent?: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-card p-4 sm:p-5 animate-fade-in">
      <h3 className={`text-sm font-bold mb-1 ${accent ?? "text-accent-light"}`}>{title}</h3>
      {sub && <p className="text-xs text-white/30 mb-4">{sub}</p>}
      {!sub && <div className="mb-4" />}
      {children}
    </div>
  );
}

function Trivia({ q, a, detail }: { q: string; a: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-4">
      <div className="text-[10px] font-bold text-teal-400/70 uppercase tracking-wider mb-1">알고 있었어?</div>
      <div className="text-xs text-white/50 mb-2">{q}</div>
      <div className="text-lg font-bold text-white/90">{a}</div>
      {detail && <div className="text-xs text-white/30 mt-1">{detail}</div>}
    </div>
  );
}

function CharCard({ c, badge, stat, badgeColor }: { c: Character; badge: string; stat: string; badgeColor?: string }) {
  return (
    <div className="relative rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-4 text-center overflow-hidden">
      <div className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-bold ${badgeColor ?? "bg-teal-600/30 text-teal-300"}`}>{badge}</div>
      <img src={c.circularImageUrl} alt={c.characterNm} width={56} height={56} className="mx-auto rounded-full ring-2 ring-white/10 mb-2" />
      <div className="text-sm font-bold text-white/90">{c.characterNm}</div>
      <div className="text-[11px] text-teal-400">{c.catchPhrase}</div>
      <div className="text-xs text-white/40 mt-1">{stat}</div>
    </div>
  );
}

function VsCard({ left, right, label }: { left: { name: string; img: string; value: string }; right: { name: string; img: string; value: string }; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-card p-4">
      <div className="text-[10px] font-bold text-white/30 text-center mb-3">{label}</div>
      <div className="flex items-center gap-3">
        <div className="flex-1 text-center">
          <img src={left.img} alt="" width={40} height={40} className="mx-auto rounded-full ring-1 ring-white/10 mb-1" />
          <div className="text-xs font-bold text-white/80">{left.name}</div>
          <div className="text-sm font-bold text-teal-300 tabular-nums">{left.value}</div>
        </div>
        <div className="text-lg font-black text-white/10">VS</div>
        <div className="flex-1 text-center">
          <img src={right.img} alt="" width={40} height={40} className="mx-auto rounded-full ring-1 ring-white/10 mb-1" />
          <div className="text-xs font-bold text-white/80">{right.name}</div>
          <div className="text-sm font-bold text-amber-300 tabular-nums">{right.value}</div>
        </div>
      </div>
    </div>
  );
}

const MOTION_KEYS = [
  { key: "revivalMotion", label: "부활", desc: "추락 후 복귀 속도" },
  { key: "hurdleMotion", label: "허들", desc: "장애물 넘는 속도" },
  { key: "landingMotion", label: "착지", desc: "점프 후 착지 속도" },
  { key: "angryMotion", label: "분노", desc: "분노 스킬 발동" },
  { key: "swimmingMotion", label: "수영", desc: "수영 구간 속도" },
  { key: "beehiveMotion", label: "벌집", desc: "벌집 경직 시간" },
  { key: "electricShockMotion", label: "감전", desc: "감전 지속 시간" },
  { key: "stunMotion", label: "스턴", desc: "스턴 지속 시간" },
] as const;

type MotionKey = typeof MOTION_KEYS[number]["key"];

/* ── Dashboard ───────────────────────────────────────── */

export function StatsDashboard({ characters, maps, costumes, stories, probability, levels }: Props) {
  const [tab, setTab] = useState<"overview" | "characters" | "content" | "gacha" | "exp">("overview");

  const visibleChars = useMemo(() => characters.filter((c) => c.isView), [characters]);

  /* ── Character analysis ── */
  const charAnalysis = useMemo(() => {
    const mbti: Record<string, number> = {};
    const blood: Record<string, number> = {};
    let tallest = visibleChars[0];
    let shortest = visibleChars[0];

    // Stat distribution patterns
    const statPatterns: { c: Character; total: number; type: string }[] = [];

    for (const c of visibleChars) {
      if (c.mbti && c.mbti !== "?") mbti[c.mbti] = (mbti[c.mbti] || 0) + 1;
      if (c.bloodType && c.bloodType !== "?") blood[c.bloodType] = (blood[c.bloodType] || 0) + 1;

      const h = parseFloat(c.height);
      if (!isNaN(h)) {
        if (h > parseFloat(tallest.height || "0")) tallest = c;
        if (h < parseFloat(shortest.height || "999")) shortest = c;
      }

      const total = c.maximumSpeed + c.acceleration + c.control + c.power;
      const maxStat = Math.max(c.maximumSpeed, c.acceleration, c.control, c.power);
      let type = "균형형";
      if (c.power === maxStat && c.power >= 5) type = "파워형";
      else if (c.maximumSpeed === maxStat && c.maximumSpeed >= 5) type = "스피드형";
      else if (c.acceleration === maxStat && c.acceleration >= 5) type = "가속형";
      else if (c.control === maxStat && c.control >= 5) type = "컨트롤형";
      statPatterns.push({ c, total, type });
    }

    const total14 = statPatterns.filter((p) => p.total === 14).length;
    const total15 = statPatterns.filter((p) => p.total >= 15).length;

    const typeCounts: Record<string, number> = {};
    for (const p of statPatterns) typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;

    return {
      mbti: Object.entries(mbti).sort((a, b) => b[1] - a[1]),
      blood: Object.entries(blood).sort((a, b) => b[1] - a[1]),
      tallest, shortest,
      total14, total15,
      typeCounts: Object.entries(typeCounts).sort((a, b) => b[1] - a[1]),
    };
  }, [visibleChars]);

  /* ── Motion time rankings ── */
  const motionRankings = useMemo(() => {
    // Total motion time (lower = better)
    const withTotal = visibleChars.map((c) => {
      const sum = MOTION_KEYS.reduce((s, m) => s + parseFloat(c[m.key as keyof Character] as string), 0);
      return { c, total: sum };
    });
    const sortedByTotal = [...withTotal].sort((a, b) => a.total - b.total);

    // Per-motion bests
    const perMotion = MOTION_KEYS.map((m) => {
      const sorted = [...visibleChars].sort((a, b) =>
        parseFloat(a[m.key as keyof Character] as string) - parseFloat(b[m.key as keyof Character] as string)
      );
      return { ...m, best: sorted[0], worst: sorted[sorted.length - 1] };
    });

    return { sortedByTotal, perMotion };
  }, [visibleChars]);

  /* ── Map stats ── */
  const mapStats = useMemo(() => {
    const typeCount: Record<number, number> = {};
    const yearCount: Record<string, number> = {};
    for (const m of maps) {
      if (m.mapTypeCd !== null) typeCount[m.mapTypeCd] = (typeCount[m.mapTypeCd] || 0) + 1;
      yearCount[m.openDt.slice(0, 4)] = (yearCount[m.openDt.slice(0, 4)] || 0) + 1;
    }
    return { typeCount, yearCount };
  }, [maps]);

  const storyStats = useMemo(() => {
    const yearCount: Record<string, number> = {};
    let webtoon = 0, video = 0;
    for (const s of stories) {
      yearCount[s.openYear] = (yearCount[s.openYear] || 0) + 1;
      if (s.category === 1) webtoon++; else video++;
    }
    return { yearCount, webtoon, video, totalImages: stories.reduce((sum, s) => sum + s.images.length, 0) };
  }, [stories]);

  const costumeStats = useMemo(() => {
    const yearCount: Record<string, number> = {};
    let totalItems = 0;
    for (const c of costumes) {
      yearCount[c.openYear] = (yearCount[c.openYear] || 0) + 1;
      totalItems += c.detail?.itemList.length ?? 0;
    }
    return { yearCount, totalItems };
  }, [costumes]);

  const gachaStats = useMemo(() => {
    const items = probability.itemList;
    let lowestProb = 100, lowestName = "", lowestTarget = "";
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

  const levelStats = useMemo(() => {
    const maxLv = levels[levels.length - 1];
    const lv95 = levels.find((l) => l.level === 95);
    const lv125 = levels.find((l) => l.level === 125);
    const half = maxLv.exp / 2;
    const lv50 = levels.filter((lv) => lv.exp <= half).pop();
    return {
      maxLevel: maxLv.level, maxExp: maxLv.exp,
      lv50percent: lv50?.level ?? 0,
      last2delta: maxLv.exp - (lv125?.exp ?? 0),
      lv1to95: lv95?.exp ?? 0,
    };
  }, [levels]);

  const tabs = [
    { id: "overview" as const, label: "한눈에 보기" },
    { id: "characters" as const, label: "런너 분석" },
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

      {/* ── 한눈에 보기 ──────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-4 stagger-grid">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-950/40 to-transparent p-4 text-center">
              <div className="text-3xl font-black text-teal-300 tabular-nums">{visibleChars.length}</div>
              <div className="text-xs text-white/40">플레이 캐릭터</div>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-transparent p-4 text-center">
              <div className="text-3xl font-black text-blue-300 tabular-nums">{maps.length}</div>
              <div className="text-xs text-white/40">맵</div>
            </div>
            <div className="rounded-xl border border-pink-500/20 bg-gradient-to-br from-pink-950/40 to-transparent p-4 text-center">
              <div className="text-3xl font-black text-pink-300 tabular-nums">{stories.length}</div>
              <div className="text-xs text-white/40">스토리</div>
            </div>
          </div>

          {/* Motion time champions */}
          <Section title="모션이 가장 빠른 런너 TOP 3" sub="스탯 총합(14)은 모두 같으니, 진짜 차이는 모션 시간에서 나온다" accent="text-emerald-400">
            <div className="grid gap-3 sm:grid-cols-3">
              {motionRankings.sortedByTotal.slice(0, 3).map((entry, i) => (
                <CharCard
                  key={entry.c.id}
                  c={entry.c}
                  badge={["1st", "2nd", "3rd"][i]}
                  stat={`모션 총합 ${entry.total.toFixed(2)}s`}
                  badgeColor={i === 0 ? "bg-yellow-500/30 text-yellow-300" : i === 1 ? "bg-gray-500/30 text-gray-300" : "bg-amber-800/30 text-amber-600"}
                />
              ))}
            </div>
          </Section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Trivia
              q="경험치의 절반을 모으면 어디까지 갈까?"
              a={getLevelLabel(levelStats.lv50percent)}
              detail={`나머지 ${levels[levels.length - 1].level - levelStats.lv50percent}레벨이 또 다른 절반`}
            />
            <Trivia
              q="가장 뽑기 힘든 등급은?"
              a={`${gachaStats.lowestProb}%`}
              detail={`${gachaStats.lowestTarget} — 약 ${Math.round(100 / gachaStats.lowestProb).toLocaleString()}회 시행`}
            />
          </div>

          <VsCard
            left={{ name: charAnalysis.tallest.characterNm, img: charAnalysis.tallest.circularImageUrl, value: charAnalysis.tallest.height }}
            right={{ name: charAnalysis.shortest.characterNm, img: charAnalysis.shortest.circularImageUrl, value: charAnalysis.shortest.height }}
            label="신장 대결"
          />
        </div>
      )}

      {/* ── 런너 분석 ────────────────────────────── */}
      {tab === "characters" && (
        <div className="space-y-6 stagger-grid">
          {/* Stat total distribution */}
          <Section title="스탯 총합 분포" sub="기본 총합 14는 전원 동일. 재분배로 +1 되면 15가 된다" accent="text-teal-400">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                <div className="text-2xl font-black text-white/70 tabular-nums">{charAnalysis.total14}</div>
                <div className="text-xs text-white/40">총합 14 (기본)</div>
              </div>
              <div className="rounded-xl border border-teal-500/20 bg-teal-950/20 p-4 text-center">
                <div className="text-2xl font-black text-teal-300 tabular-nums">{charAnalysis.total15}</div>
                <div className="text-xs text-white/40">총합 15 (재분배)</div>
              </div>
            </div>
          </Section>

          {/* Stat pattern distribution */}
          <Section title="스탯 배분 유형" sub="가장 높은 스탯(5 이상) 기준으로 분류" accent="text-violet-400">
            <div className="space-y-2">
              {charAnalysis.typeCounts.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-sm text-white/70 w-20">{type}</span>
                  <Bar value={count} max={charAnalysis.typeCounts[0][1] as number} color="bg-violet-500" />
                  <span className="text-sm text-white/50 tabular-nums w-8 text-right">{count}명</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Motion time ranking - the REAL tier list */}
          <Section title="모션 시간 총합 랭킹" sub="모든 모션 시간의 합. 낮을수록 유리하다" accent="text-emerald-400">
            <div className="space-y-1.5">
              {motionRankings.sortedByTotal.slice(0, 10).map((entry, i) => (
                <div key={entry.c.id} className="flex items-center gap-3">
                  <span className={`w-5 text-right text-xs font-bold tabular-nums ${i < 3 ? "text-emerald-400" : "text-white/30"}`}>{i + 1}</span>
                  <img src={entry.c.circularImageUrl} alt="" width={24} height={24} className="rounded-full shrink-0" />
                  <span className="text-sm text-white/80 w-24 truncate">{entry.c.characterNm}</span>
                  <Bar value={1 / entry.total} max={1 / motionRankings.sortedByTotal[0].total} color="bg-emerald-500" />
                  <span className="text-sm font-bold text-white/70 tabular-nums w-14 text-right">{entry.total.toFixed(2)}s</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Per-motion bests */}
          <Section title="모션별 최고 / 최저" sub="각 모션에서 가장 빠른 캐릭터와 가장 느린 캐릭터">
            <div className="grid gap-2 sm:grid-cols-2">
              {motionRankings.perMotion.map((m) => (
                <div key={m.key} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-2">
                  <div className="w-12">
                    <div className="text-xs font-bold text-white/60">{m.label}</div>
                    <div className="text-[9px] text-white/25">{m.desc}</div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 text-xs">
                    <img src={m.best.circularImageUrl} alt="" width={20} height={20} className="rounded-full" />
                    <span className="text-emerald-400 font-bold tabular-nums">{parseFloat(m.best[m.key as keyof Character] as string).toFixed(2)}s</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 text-xs justify-end">
                    <span className="text-red-400/70 tabular-nums">{parseFloat(m.worst[m.key as keyof Character] as string).toFixed(2)}s</span>
                    <img src={m.worst.circularImageUrl} alt="" width={20} height={20} className="rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* MBTI */}
          <Section title="MBTI 분포 — 동화나라 성격 지도" accent="text-violet-400">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {charAnalysis.mbti.slice(0, 4).map(([type, count]) => (
                <div key={type} className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-2.5 text-center">
                  <div className="text-lg font-black text-violet-300">{type}</div>
                  <div className="text-xs text-white/40">{count}명</div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              {charAnalysis.mbti.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-sm text-white/70 w-12 font-mono">{type}</span>
                  <Bar value={count} max={charAnalysis.mbti[0][1] as number} color="bg-violet-500" />
                  <span className="text-sm text-white/50 tabular-nums w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Blood type + VS */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Section title="혈액형 분포">
              <div className="grid grid-cols-2 gap-3">
                {charAnalysis.blood.map(([type, count], i) => (
                  <div key={type} className={`rounded-xl p-4 text-center ${i === 0 ? "bg-red-500/10 border border-red-500/20" : "bg-white/[0.03] border border-white/5"}`}>
                    <div className={`text-2xl font-black ${i === 0 ? "text-red-300" : "text-white/70"}`}>{type}</div>
                    <div className="text-lg font-bold text-white/60 tabular-nums">{count}명</div>
                  </div>
                ))}
              </div>
            </Section>
            <VsCard
              left={{ name: charAnalysis.tallest.characterNm, img: charAnalysis.tallest.circularImageUrl, value: charAnalysis.tallest.height }}
              right={{ name: charAnalysis.shortest.characterNm, img: charAnalysis.shortest.circularImageUrl, value: charAnalysis.shortest.height }}
              label="신장 양극단"
            />
          </div>
        </div>
      )}

      {/* ── 콘텐츠 ──────────────────────────────── */}
      {tab === "content" && (
        <div className="space-y-6 stagger-grid">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-950/30 to-transparent p-4 text-center">
              <div className="text-2xl font-black text-red-300 tabular-nums">{maps.length}</div>
              <div className="text-xs text-white/40">맵</div>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-transparent p-4 text-center">
              <div className="text-2xl font-black text-emerald-300 tabular-nums">{storyStats.webtoon}</div>
              <div className="text-xs text-white/40">웹툰</div>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 to-transparent p-4 text-center">
              <div className="text-2xl font-black text-blue-300 tabular-nums">{storyStats.video}</div>
              <div className="text-xs text-white/40">영상</div>
            </div>
            <div className="rounded-xl border border-pink-500/20 bg-gradient-to-br from-pink-950/30 to-transparent p-4 text-center">
              <div className="text-2xl font-black text-pink-300 tabular-nums">{costumes.length}</div>
              <div className="text-xs text-white/40">코스튬</div>
            </div>
          </div>

          <Trivia
            q="이 아카이브에 수집된 스토리 이미지는 총 몇 장일까?"
            a={`${storyStats.totalImages.toLocaleString()}장`}
            detail={`웹툰 ${storyStats.webtoon}편 + 영상 ${storyStats.video}편에 걸쳐 수집`}
          />

          <Section title="맵 타입 분포" accent="text-red-400">
            <div className="space-y-1.5">
              {Object.entries(mapStats.typeCount)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-sm text-white/70 w-20">{MAP_TYPE_NAMES[Number(type)] ?? type}</span>
                    <Bar value={count} max={Math.max(...Object.values(mapStats.typeCount))} color="bg-red-400" />
                    <span className="text-sm text-white/50 tabular-nums w-6 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </Section>

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

          <div className="grid gap-3 sm:grid-cols-2">
            <Section title="연도별 스토리" accent="text-blue-400">
              <div className="space-y-1.5">
                {Object.entries(storyStats.yearCount).map(([year, count]) => (
                  <div key={year} className="flex items-center gap-3">
                    <span className="text-sm text-white/70 w-16 truncate">{year}</span>
                    <Bar value={count} max={Math.max(...Object.values(storyStats.yearCount))} color="bg-blue-400" />
                    <span className="text-sm text-white/50 tabular-nums w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="연도별 코스튬" accent="text-pink-400">
              <div className="space-y-1.5">
                {Object.entries(costumeStats.yearCount).map(([year, count]) => (
                  <div key={year} className="flex items-center gap-3">
                    <span className="text-sm text-white/70 w-16 truncate">{year}</span>
                    <Bar value={count} max={Math.max(...Object.values(costumeStats.yearCount))} color="bg-pink-400" />
                    <span className="text-sm text-white/50 tabular-nums w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/30">총 {costumeStats.totalItems}개 아이템</p>
            </Section>
          </div>
        </div>
      )}

      {/* ── 변경권 ───────────────────────────────── */}
      {tab === "gacha" && (
        <div className="space-y-6 stagger-grid">
          <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-950/30 to-transparent p-5 text-center">
            <div className="text-[10px] font-bold text-red-400/70 uppercase tracking-wider mb-2">최악의 확률</div>
            <div className="text-4xl font-black text-red-300 tabular-nums mb-1">{gachaStats.lowestProb}%</div>
            <div className="text-sm text-white/60">{gachaStats.lowestName}</div>
            <div className="text-xs text-white/30 mt-1">
              {gachaStats.lowestTarget} — 약 <span className="text-red-300 font-bold">{Math.round(100 / gachaStats.lowestProb).toLocaleString()}번</span> 돌려야 한 번
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-transparent p-4 text-center">
              <div className="text-2xl font-black text-amber-300 tabular-nums">{gachaStats.totalItems}</div>
              <div className="text-xs text-white/40">변경권 종류</div>
            </div>
            <Trivia q="63.2% 확률에 도달하려면?" a={`${Math.round(100 / gachaStats.lowestProb).toLocaleString()}회`} detail="기대값 = 1/p" />
          </div>

          <Section title="확률별 기대 시행 횟수" accent="text-amber-400" sub="1번 이상 성공할 확률 63.2%에 도달하는 횟수">
            <div className="space-y-2">
              {[0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10].map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <span className="text-sm text-white/70 w-16 text-right tabular-nums">{p}%</span>
                  <Bar value={Math.log10(100 / p)} max={Math.log10(100 / 0.005)} color="bg-amber-500" />
                  <span className="text-sm text-white/50 tabular-nums w-16 text-right">{Math.round(100 / p).toLocaleString()}회</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ── 경험치 ───────────────────────────────── */}
      {tab === "exp" && (
        <div className="space-y-6 stagger-grid">
          <Section title="레벨 경험치 곡선" sub="로그 스케일 — 실제 차이는 훨씬 극적">
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
          </Section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Trivia
              q="전체 경험치의 딱 절반을 모으면?"
              a={getLevelLabel(levelStats.lv50percent)}
              detail={`여기까지가 50%. 나머지 ${levels[levels.length - 1].level - levelStats.lv50percent}레벨이 나머지 50%.`}
            />
            <Trivia
              q="125→126 구간 하나에 필요한 경험치는?"
              a={`${levelStats.last2delta.toLocaleString()} EXP`}
              detail={`1~95 전체 (${levelStats.lv1to95.toLocaleString()})보다 많다`}
            />
          </div>

          <div className="rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-950/40 to-transparent p-5 text-center">
            <div className="text-[10px] font-bold text-teal-400/70 uppercase tracking-wider mb-2">최종 보스</div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: getLevelRank(levelStats.maxLevel).hex }} />
              <span className="text-2xl font-black text-white/90">{getLevelLabel(levelStats.maxLevel)}</span>
            </div>
            <div className="text-sm text-white/40 tabular-nums">{levelStats.maxExp.toLocaleString()} EXP</div>
            <div className="text-xs text-white/25 mt-1">약 {(levelStats.maxExp / 1_000_000_000).toFixed(1)}B</div>
          </div>
        </div>
      )}
    </div>
  );
}
