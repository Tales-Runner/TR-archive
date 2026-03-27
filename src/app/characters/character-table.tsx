"use client";

import { useState, useMemo, useEffect } from "react";
import type { Character, SortKey, SortDir } from "@/lib/types";
import { CHARACTER_CATEGORY, CHARACTER_CATEGORY_LABEL, STAT_MAX, STAT_TOTAL_MAX } from "@/lib/constants";
import { useDebouncedValue } from "@/lib/use-debounce";
import { useFavorites } from "@/lib/use-favorites";
import { useToast } from "@/components/toast";
import { Tooltip } from "@/components/tooltip";
import { EmptyState } from "@/components/empty-state";
import Image from "next/image";

const STAT_COLS: { key: SortKey; label: string; tip: string }[] = [
  { key: "maximumSpeed", label: "속도", tip: "최고 이동 속도" },
  { key: "acceleration", label: "가속", tip: "가속력 (0→최고속 도달)" },
  { key: "control", label: "컨트롤", tip: "코너링 안정성" },
  { key: "power", label: "힘", tip: "충돌 시 밀어내는 힘" },
  { key: "totalStat", label: "합계", tip: "4대 스탯 합산" },
];

const MOTION_COLS: { key: SortKey; label: string; tip?: string }[] = [
  { key: "revivalMotion", label: "부활" },
  { key: "hurdleMotion", label: "허들" },
  { key: "landingMotion", label: "착지" },
  { key: "angryMotion", label: "분노" },
  { key: "swimmingMotion", label: "수영" },
  { key: "beehiveMotion", label: "벌집" },
  { key: "electricShockMotion", label: "감전" },
  { key: "stunMotion", label: "스턴" },
];

type Tab = "stats" | "motions";

function getValue(c: Character, key: SortKey): number {
  if (key === "totalStat") {
    return c.maximumSpeed + c.acceleration + c.control + c.power;
  }
  const v = c[key as keyof Character];
  return typeof v === "string" ? parseFloat(v) : (v as number);
}

function statBar(value: number, max: number) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-teal-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-white/70">{value}</span>
    </div>
  );
}

function motionCell(value: string, best: number, worst: number) {
  const n = parseFloat(value);
  const isBest = n === best;
  const isWorst = n === worst;
  return (
    <span
      className={`text-xs tabular-nums ${isBest ? "font-bold text-emerald-400" : isWorst ? "text-red-400/70" : "text-white/60"}`}
    >
      {isBest && <span aria-label="최고">▲ </span>}
      {isWorst && <span aria-label="최저">▼ </span>}
      {value}s
    </span>
  );
}

function CharacterModal({
  c,
  onClose,
  isFav,
  onToggleFav,
  memo,
  tags,
  onMemoChange,
  onTagsChange,
}: {
  c: Character;
  onClose: () => void;
  isFav: boolean;
  onToggleFav: () => void;
  memo: string;
  tags: string[];
  onMemoChange: (m: string) => void;
  onTagsChange: (t: string[]) => void;
}) {
  const [tagInput, setTagInput] = useState("");
  const total = c.maximumSpeed + c.acceleration + c.control + c.power;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#13101f] p-4 sm:p-6 animate-scale-in"
      >
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={onToggleFav}
            className={`rounded-lg px-3 py-1 text-sm transition-colors ${isFav ? "bg-pink-600/20 text-pink-300" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
          >
            {isFav ? "♥" : "♡"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/5 px-3 py-1 text-sm text-white/40 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <Image
            src={c.mainImageUrl}
            alt={c.characterNm}
            width={80}
            height={80}
            className="rounded-xl ring-1 ring-white/10"
          />
          <div>
            <h2 className="text-lg font-bold text-white/90">
              {c.characterNm}
            </h2>
            <p className="text-sm text-teal-400">{c.catchPhrase}</p>
            <p className="text-xs text-white/30 mt-0.5">
              {CHARACTER_CATEGORY_LABEL[c.category] ?? "기타"} 캐릭터
            </p>
          </div>
        </div>

        {/* Unique Ability */}
        <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <h3 className="text-xs font-medium text-accent mb-1">고유능력</h3>
          <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
            {c.uniqueAbility || "없음"}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
          {[
            { label: "속도", val: c.maximumSpeed },
            { label: "가속", val: c.acceleration },
            { label: "컨트롤", val: c.control },
            { label: "힘", val: c.power },
            { label: "합계", val: total },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-2 text-center"
            >
              <div className="text-[10px] text-white/40">{s.label}</div>
              <div className="text-sm font-bold text-white/90 tabular-nums">
                {s.val}
              </div>
            </div>
          ))}
        </div>

        {/* Motion Times */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-white/40 mb-2">모션 시간</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            {MOTION_COLS.map((col) => {
              const val = c[col.key as keyof Character] as string;
              return (
                <div
                  key={col.key}
                  className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center"
                >
                  <div className="text-[10px] text-white/30">{col.label}</div>
                  <div className="text-white/70 tabular-nums">{val}s</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {[
            { label: "나이", val: c.ageInfo },
            { label: "키", val: c.height },
            { label: "몸무게", val: c.weight },
            { label: "MBTI", val: c.mbti },
            { label: "혈액형", val: c.bloodType },
            { label: "생일", val: c.birthDayInfo },
            { label: "직업", val: c.job },
            { label: "직업 상세", val: c.jobDetail },
          ]
            .filter((p) => p.val)
            .map((p) => (
              <div key={p.label} className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/30">{p.label}</span>
                <span className="text-white/70">{p.val}</span>
              </div>
            ))}
        </div>

        {/* Favorites: memo & tags */}
        {isFav && (
          <div className="mt-4 rounded-xl border border-pink-500/20 bg-pink-950/10 p-3 space-y-3">
            <textarea
              value={memo}
              onChange={(e) => onMemoChange(e.target.value)}
              placeholder="메모 (예: 허들 빠름, 메인 캐릭)"
              rows={2}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50"
            />
            <div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                    {tag}
                    <button onClick={() => onTagsChange(tags.filter((t) => t !== tag))} className="text-white/30 hover:text-white/60">✕</button>
                  </span>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); const v = tagInput.trim(); if (v && !tags.includes(v)) { onTagsChange([...tags, v]); setTagInput(""); } }} className="flex gap-1.5">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="태그 추가..."
                  maxLength={20}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50"
                />
                <button type="submit" className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/40 hover:bg-white/10">+</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CompareModal({
  chars,
  onClose,
}: {
  chars: Character[];
  onClose: () => void;
}) {
  const stats = [
    { label: "속도", key: "maximumSpeed" as const },
    { label: "가속", key: "acceleration" as const },
    { label: "컨트롤", key: "control" as const },
    { label: "힘", key: "power" as const },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#13101f] p-4 sm:p-6 animate-scale-in"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg bg-white/5 px-3 py-1 text-sm text-white/40 hover:bg-white/10"
        >
          ✕
        </button>
        <h2 className="text-lg font-bold text-accent-light mb-5">
          캐릭터 비교
        </h2>

        {/* Headers */}
        <div className="grid gap-3" style={{ gridTemplateColumns: `100px repeat(${chars.length}, 1fr)` }}>
          <div />
          {chars.map((c) => (
            <div key={c.id} className="text-center">
              <Image
                src={c.circularImageUrl}
                alt={c.characterNm}
                width={48}
                height={48}
                className="mx-auto rounded-full ring-1 ring-white/10 mb-1"
              />
              <div className="text-sm font-medium text-white/90">{c.characterNm}</div>
              <div className="text-[10px] text-teal-400">{c.catchPhrase}</div>
            </div>
          ))}

          {/* Stats */}
          {stats.map((s) => {
            const vals = chars.map((c) => c[s.key] as number);
            const best = Math.max(...vals);
            return (
              <div key={s.key} className="contents">
                <div className="text-xs text-white/40 flex items-center">{s.label}</div>
                {chars.map((c, i) => {
                  const v = vals[i];
                  return (
                    <div
                      key={c.id}
                      className={`text-center text-sm font-bold tabular-nums ${v === best ? "text-teal-300" : "text-white/60"}`}
                    >
                      {v}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Total */}
          {(() => {
            const totals = chars.map((c) => c.maximumSpeed + c.acceleration + c.control + c.power);
            const best = Math.max(...totals);
            return (
              <div className="contents">
                <div className="text-xs text-white/40 flex items-center font-medium">합계</div>
                {chars.map((c, i) => (
                  <div
                    key={c.id}
                    className={`text-center text-sm font-bold tabular-nums ${totals[i] === best ? "text-teal-300" : "text-white/60"}`}
                  >
                    {totals[i]}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Divider */}
          <div className="col-span-full border-t border-white/5 my-1" />

          {/* Motion times */}
          {MOTION_COLS.map((m) => {
            const vals = chars.map((c) => parseFloat(c[m.key as keyof Character] as string));
            const best = Math.min(...vals);
            return (
              <div key={m.key} className="contents">
                <div className="text-xs text-white/40 flex items-center">{m.label}</div>
                {chars.map((c, i) => (
                  <div
                    key={c.id}
                    className={`text-center text-xs tabular-nums ${vals[i] === best ? "text-emerald-400 font-bold" : "text-white/50"}`}
                  >
                    {vals[i]}s
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CharacterTable({
  characters,
}: {
  characters: Character[];
}) {
  const [tab, setTab] = useState<Tab>("stats");
  const [sortKey, setSortKey] = useState<SortKey>("maximumSpeed");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const toast = useToast();
  const favs = useFavorites();

  // Close modals on Escape
  useEffect(() => {
    if (selectedId === null && !showCompare) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (showCompare) setShowCompare(false);
        else setSelectedId(null);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId, showCompare]);

  function toggleCompare(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    const c = characters.find((x) => x.id === id);
    const had = compareIds.includes(id);
    if (had) {
      setCompareIds(compareIds.filter((x) => x !== id));
      if (c) toast(`${c.characterNm} 비교에서 제거`);
    } else if (compareIds.length < 3) {
      setCompareIds([...compareIds, id]);
      if (c) toast(`${c.characterNm} 비교에 추가 (${compareIds.length + 1}/3)`);
    } else {
      toast("최대 3명까지 비교할 수 있습니다");
    }
  }

  const debouncedSearch = useDebouncedValue(search, 200);

  const filtered = useMemo(() => {
    let list = characters.filter((c) => c.isView);
    if (catFilter !== null) list = list.filter((c) => c.category === catFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.characterNm.toLowerCase().includes(q) ||
          c.catchPhrase.toLowerCase().includes(q) ||
          c.uniqueAbility.toLowerCase().includes(q),
      );
    }
    return list;
  }, [characters, catFilter, debouncedSearch]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === "characterNm") {
        const cmp = a.characterNm.localeCompare(b.characterNm, "ko");
        return sortDir === "asc" ? cmp : -cmp;
      }
      const va = getValue(a, sortKey);
      const vb = getValue(b, sortKey);
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [filtered, sortKey, sortDir]);

  const motionExtremes = useMemo(() => {
    const map: Record<string, { best: number; worst: number }> = {};
    for (const col of MOTION_COLS) {
      const vals = filtered.map((c) =>
        parseFloat(c[col.key as keyof Character] as string),
      );
      map[col.key] = { best: Math.min(...vals), worst: Math.max(...vals) };
    }
    return map;
  }, [filtered]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "characterNm" ? "asc" : "desc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  const cols = tab === "stats" ? STAT_COLS : MOTION_COLS;

  const selectedChar = selectedId !== null ? characters.find((c) => c.id === selectedId) : null;

  return (
    <div>
      {/* Character detail modal */}
      {selectedChar && (
        <CharacterModal
          c={selectedChar}
          onClose={() => setSelectedId(null)}
          isFav={favs.isRunnerFav(selectedChar.id)}
          onToggleFav={() => favs.toggleRunner(selectedChar.id)}
          memo={favs.getRunner(selectedChar.id)?.memo ?? ""}
          tags={favs.getRunner(selectedChar.id)?.tags ?? []}
          onMemoChange={(m) => favs.updateRunnerMemo(selectedChar.id, m)}
          onTagsChange={(t) => favs.updateRunnerTags(selectedChar.id, t)}
        />
      )}

      {/* Compare modal */}
      {showCompare && compareIds.length >= 2 && (
        <CompareModal
          chars={compareIds.map((id) => characters.find((c) => c.id === id)!).filter(Boolean)}
          onClose={() => setShowCompare(false)}
        />
      )}

      {/* Compare bar */}
      {compareIds.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-teal-500/20 bg-teal-950/30 px-3 sm:px-4 py-2.5 overflow-x-auto">
          <span className="text-xs text-teal-300 font-medium">비교</span>
          {compareIds.map((id) => {
            const c = characters.find((x) => x.id === id);
            return c ? (
              <span key={id} className="flex items-center gap-1 rounded-full bg-white/10 pl-1 pr-2 py-0.5">
                <Image src={c.circularImageUrl} alt="" width={18} height={18} className="rounded-full" />
                <span className="text-xs text-white/70">{c.characterNm}</span>
                <button onClick={() => setCompareIds((p) => p.filter((x) => x !== id))} className="text-white/30 hover:text-white/60 text-[10px] ml-0.5">✕</button>
              </span>
            ) : null;
          })}
          {compareIds.length >= 2 && (
            <button
              onClick={() => setShowCompare(true)}
              className="ml-auto rounded-lg bg-teal-600 px-3 py-1 text-xs font-medium text-white hover:bg-teal-500 transition-colors"
            >
              비교하기
            </button>
          )}
          <span className="text-[10px] text-white/30">{compareIds.length}/3</span>
        </div>
      )}

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-white/10 overflow-hidden text-sm">
          <button
            onClick={() => setTab("stats")}
            className={`px-3 py-1.5 font-medium transition-colors ${tab === "stats" ? "bg-teal-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"}`}
          >
            기본 스탯
          </button>
          <button
            onClick={() => setTab("motions")}
            className={`px-3 py-1.5 font-medium transition-colors ${tab === "motions" ? "bg-teal-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"}`}
          >
            모션 시간
          </button>
        </div>
        <div className="flex rounded-lg border border-white/10 overflow-hidden text-sm">
          {[
            { label: "전체", value: null },
            { label: "런너", value: CHARACTER_CATEGORY.RUNNER },
            { label: "스토리", value: CHARACTER_CATEGORY.STORY },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setCatFilter(opt.value)}
              className={`px-3 py-1.5 transition-colors ${catFilter === opt.value ? "bg-white/10 font-medium text-white/80" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="캐릭터 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50 sm:text-sm sm:py-1.5"
        />
        <span className="ml-auto text-xs text-white/30">
          {sorted.length}명
        </span>
      </div>

      {/* Table */}
      <p className="mb-2 text-[10px] text-white/20 sm:hidden">← 좌우로 스크롤하세요 →</p>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-left text-xs text-white/40">
              <th className="sticky left-0 z-10 bg-surface-card px-3 py-2.5">
                <button
                  onClick={() => toggleSort("characterNm")}
                  className="hover:text-white/70"
                >
                  캐릭터{sortIndicator("characterNm")}
                </button>
              </th>
              <th className="px-3 py-2.5 min-w-[120px]">고유능력</th>
              {cols.map((col) => {
                const btn = (
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="hover:text-white/70"
                  >
                    {col.label}
                    {sortIndicator(col.key)}
                  </button>
                );
                return (
                  <th key={col.key} className="px-3 py-2.5 whitespace-nowrap">
                    {col.tip ? <Tooltip text={col.tip}>{btn}</Tooltip> : btn}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <td className="sticky left-0 z-10 bg-surface-card px-3 py-2.5 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={(e) => toggleCompare(c.id, e)}
                      className={`shrink-0 w-5 h-5 rounded border text-[10px] flex items-center justify-center transition-colors ${compareIds.includes(c.id) ? "bg-teal-600 border-teal-500 text-white" : "border-white/20 text-transparent hover:border-white/40"}`}
                    >
                      {compareIds.includes(c.id) ? "✓" : ""}
                    </button>
                    <Image
                      src={c.circularImageUrl}
                      alt={c.characterNm}
                      width={30}
                      height={30}
                      className="rounded-full ring-1 ring-white/10"
                    />
                    <div>
                      <div className="leading-tight text-white/90">
                        {c.characterNm}
                      </div>
                      <div className="text-[10px] font-normal text-white/30">
                        {c.catchPhrase}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs text-white/30 max-w-[180px] truncate">
                  {c.uniqueAbility}
                </td>
                {tab === "stats" ? (
                  <>
                    {STAT_COLS.map((col) => (
                      <td key={col.key} className="px-3 py-2.5">
                        {statBar(
                          getValue(c, col.key),
                          col.key === "totalStat" ? STAT_TOTAL_MAX : STAT_MAX,
                        )}
                      </td>
                    ))}
                  </>
                ) : (
                  <>
                    {MOTION_COLS.map((col) => {
                      const val = c[col.key as keyof Character] as string;
                      const ext = motionExtremes[col.key];
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          {motionCell(val, ext.best, ext.worst)}
                        </td>
                      );
                    })}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <EmptyState message="조건에 맞는 캐릭터가 없습니다" />}
      </div>

      {tab === "motions" && (
        <p className="mt-3 text-xs text-white/30">
          <span className="font-bold text-emerald-400">초록</span> = 가장 빠름,{" "}
          <span className="text-red-400/70">빨강</span> = 가장 느림 (낮을수록
          좋음)
        </p>
      )}
    </div>
  );
}
