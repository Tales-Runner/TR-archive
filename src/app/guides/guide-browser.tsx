"use client";

import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import type { GuideItem } from "@/lib/types";

const CATEGORY_NAMES: Record<number, string> = {
  1: "조작법",
  2: "커뮤니티",
  3: "시스템",
  4: "성장",
  5: "게임플레이",
  6: "팜",
  7: "공원",
  9: "레벨",
  10: "보안",
  11: "VIP",
  12: "시작하기",
  14: "광장",
};

export function GuideBrowser({ guides }: { guides: GuideItem[] }) {
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activePart, setActivePart] = useState(0);

  const categories = useMemo(() => {
    const cats = [...new Set(guides.map((g) => g.category))];
    return cats.sort((a, b) => a - b);
  }, [guides]);

  const filtered = useMemo(() => {
    let list = guides;
    if (catFilter !== null) {
      list = list.filter((g) => g.category === catFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (g) =>
          g.subject.toLowerCase().includes(q) ||
          g.hashTagSubject.toLowerCase().includes(q)
      );
    }
    return list;
  }, [guides, catFilter, search]);

  const selected = selectedId !== null ? guides.find((g) => g.id === selectedId) : null;

  function openGuide(id: number) {
    setSelectedId(id);
    setActivePart(0);
  }

  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelectedId(null)}
          className="mb-4 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
        >
          ← 목록으로
        </button>

        <div className="rounded-xl border border-white/10 bg-surface-card overflow-hidden">
          {/* Header */}
          <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4">
            <h2 className="text-lg font-bold text-white/90">
              {selected.subject}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-teal-600/20 px-2.5 py-0.5 text-xs text-teal-300">
                {CATEGORY_NAMES[selected.category] ?? `카테고리 ${selected.category}`}
              </span>
              {selected.hashTagSubject.split(",").map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-white/30"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Part tabs */}
          {selected.partList.length > 1 && (
            <div className="flex overflow-x-auto border-b border-white/10 bg-white/[0.01]">
              {selected.partList.map((part, i) => (
                <button
                  key={part.partId}
                  onClick={() => setActivePart(i)}
                  className={`shrink-0 px-4 py-2 text-sm transition-colors ${
                    i === activePart
                      ? "border-b-2 border-teal-500 text-teal-300 font-medium"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {part.subject}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          {selected.partList[activePart] && (
            <div
              className="guide-content p-5"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(selected.partList[activePart].contents),
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap rounded-lg border border-white/10 overflow-hidden text-sm">
          <button
            onClick={() => setCatFilter(null)}
            className={`px-3 py-1.5 transition-colors ${
              catFilter === null
                ? "bg-teal-600 text-white font-medium"
                : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 transition-colors ${
                catFilter === cat
                  ? "bg-teal-600 text-white font-medium"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              {CATEGORY_NAMES[cat] ?? cat}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="뭘 알고 싶어?"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50"
        />
        <span className="text-xs text-white/30">{filtered.length}개</span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((g) => (
          <button
            key={g.id}
            onClick={() => openGuide(g.id)}
            className="w-full rounded-xl border border-white/10 bg-surface-card px-5 py-3.5 text-left transition-all hover:border-teal-500/30 hover:bg-white/[0.03]"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-white/90">
                {g.subject}
              </h3>
              <span className="shrink-0 rounded-full bg-teal-600/20 px-2 py-0.5 text-[10px] text-teal-300">
                {CATEGORY_NAMES[g.category] ?? g.category}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {g.hashTagSubject.split(",").map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-white/30"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
