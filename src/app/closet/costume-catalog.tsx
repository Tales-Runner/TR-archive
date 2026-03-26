"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { CostumeItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";

export function CostumeCatalog({ costumes }: { costumes: CostumeItem[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [yearFilter, setYearFilter] = useState<string | null>(
    () => searchParams.get("year") ?? null,
  );
  const [sortBy, setSortBy] = useState<"date" | "name">(() =>
    searchParams.get("sort") === "name" ? "name" : "date",
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const years = useMemo(
    () => [...new Set(costumes.map((c) => c.openYear))],
    [costumes]
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (yearFilter) params.set("year", yearFilter);
    if (search.trim()) params.set("q", search.trim());
    if (sortBy !== "date") params.set("sort", sortBy);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }, [yearFilter, search, sortBy, router]);

  const filtered = useMemo(() => {
    let list = costumes;
    if (yearFilter) {
      list = list.filter((c) => c.openYear === yearFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.subject.toLowerCase().includes(q) ||
          c.hashTagSubject.toLowerCase().includes(q)
      );
    }
    if (sortBy === "name") {
      list = [...list].sort((a, b) => a.subject.localeCompare(b.subject, "ko"));
    }
    return list;
  }, [costumes, yearFilter, search, sortBy]);

  const selected = selectedId !== null ? costumes.find((c) => c.id === selectedId) : null;

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex overflow-x-auto rounded-lg border border-white/10 text-sm">
          <button
            onClick={() => setYearFilter(null)}
            className={`px-3 py-1.5 transition-colors ${
              yearFilter === null
                ? "bg-teal-600 text-white font-medium"
                : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            전체
          </button>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              className={`px-3 py-1.5 transition-colors ${
                yearFilter === y
                  ? "bg-teal-600 text-white font-medium"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-white/10 overflow-hidden text-sm">
          <button
            onClick={() => setSortBy("date")}
            className={`px-3 py-1.5 transition-colors ${sortBy === "date" ? "bg-white/10 text-white/80 font-medium" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
          >
            최신순
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-3 py-1.5 transition-colors ${sortBy === "name" ? "bg-white/10 text-white/80 font-medium" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
          >
            이름순
          </button>
        </div>
        <input
          type="text"
          placeholder="코스튬 이름이나 아이템으로 찾기..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50 sm:text-sm sm:py-1.5"
        />
        <span className="text-xs text-white/30">{filtered.length}세트</span>
      </div>

      {/* Detail modal */}
      {selected?.detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#13101f] p-4 sm:p-6 animate-scale-in"
          >
            <button
              onClick={() => setSelectedId(null)}
              className="absolute top-4 right-4 z-10 rounded-lg bg-black/50 px-3 py-1 text-sm text-white/40 hover:bg-white/10 hover:text-white/70"
            >
              닫기
            </button>

            <h2 className="text-xl font-bold text-white/90 mb-1">
              {selected.subject}
            </h2>
            <p className="text-xs text-white/30 mb-4">
              {formatDate(selected.openDt)}
            </p>

            {/* Item gallery */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {selected.detail.itemList.map((item) => (
                <div
                  key={item.itemId}
                  className="group rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden bg-white/5 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.itemSubject}
                      className="h-full w-full object-contain p-2"
                      loading="lazy"
                    />
                    {item.motionImageUrl && (
                      <video
                        src={item.motionImageUrl}
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 h-full w-full object-contain p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          const v = e.currentTarget;
                          v.paused ? v.play() : v.pause();
                          v.classList.toggle("opacity-100");
                          v.classList.toggle("opacity-0");
                        }}
                        onMouseEnter={(e) =>
                          (e.target as HTMLVideoElement).play()
                        }
                        onMouseLeave={(e) => {
                          const v = e.target as HTMLVideoElement;
                          v.pause();
                          v.currentTime = 0;
                        }}
                      />
                    )}
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs text-white/70 truncate">
                      {item.itemSubject}
                    </p>
                    {item.motionImageUrl && (
                      <p className="text-[10px] text-white/30 mt-0.5">
                        <span className="hidden sm:inline">호버</span>
                        <span className="sm:hidden">탭</span>하면 모션 재생
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selected.hashTagSubject && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {selected.hashTagSubject.split(",").map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-white/30"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState message="조건에 맞는 코스튬이 없습니다" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 stagger-grid">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="card-hover group rounded-xl border border-white/10 bg-surface-card overflow-hidden text-left hover:border-teal-500/30 hover:bg-white/[0.03]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-white/5">
                <img
                  src={c.thumbnail}
                  alt={c.subject}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-white/90 truncate mb-0.5">
                  {c.subject}
                </h3>
                <p className="text-[11px] text-white/30">
                  {formatDate(c.openDt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
