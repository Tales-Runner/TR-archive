"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import type { MapItem, MapType } from "@/lib/types";
import { formatDate, youtubeId } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";

export function MapCatalog({
  maps,
  types,
}: {
  maps: MapItem[];
  types: MapType[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [typeFilter, setTypeFilter] = useState<number | null>(() => {
    const v = searchParams.get("type");
    return v ? Number(v) : null;
  });
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [sortBy, setSortBy] = useState<"date" | "name">(() =>
    searchParams.get("sort") === "name" ? "name" : "date",
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (typeFilter !== null) params.set("type", String(typeFilter));
      if (search.trim()) params.set("q", search.trim());
      if (sortBy !== "date") params.set("sort", sortBy);
      const qs = params.toString();
      const target = qs ? `?${qs}` : window.location.pathname;
      if (target !== window.location.pathname + window.location.search) {
        router.replace(target, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [typeFilter, search, sortBy, router]);

  const filtered = useMemo(() => {
    let list = maps;
    if (typeFilter !== null) {
      list = list.filter((m) => m.mapTypeCd === typeFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.hashTagSubject.toLowerCase().includes(q)
      );
    }
    if (sortBy === "name") {
      list = [...list].sort((a, b) => a.subject.localeCompare(b.subject, "ko"));
    }
    return list;
  }, [maps, typeFilter, search, sortBy]);

  // Close modal on Escape
  useEffect(() => {
    if (selectedId === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedId(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const selected = selectedId !== null ? maps.find((m) => m.id === selectedId) : null;

  const typeName = (code: number | null) =>
    types.find((t) => t.codeId === code)?.codeName ?? "";

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex overflow-x-auto rounded-lg border border-white/10 text-sm">
          <button
            onClick={() => setTypeFilter(null)}
            className={`px-3 py-1.5 transition-colors ${
              typeFilter === null
                ? "bg-teal-600 text-white font-medium"
                : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            전체
          </button>
          {types.map((t) => (
            <button
              key={t.codeId}
              onClick={() => setTypeFilter(t.codeId)}
              className={`px-3 py-1.5 transition-colors ${
                typeFilter === t.codeId
                  ? "bg-teal-600 text-white font-medium"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              {t.codeName}
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
          placeholder="맵 이름이나 태그로 찾기..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50 sm:text-sm sm:py-1.5"
        />
        <span className="text-xs text-white/30">{filtered.length}개</span>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#13101f] p-4 sm:p-6 animate-scale-in"
          >
            <button
              onClick={() => setSelectedId(null)}
              className="absolute top-4 right-4 rounded-lg bg-white/5 px-3 py-1 text-sm text-white/40 hover:bg-white/10 hover:text-white/70"
            >
              닫기
            </button>
            <h2 className="text-xl font-bold text-white/90 mb-1">
              {selected.subject}
            </h2>
            <div className="flex items-center gap-2 mb-4">
              {selected.mapTypeCd !== null && (
                <span className="rounded-full bg-teal-600/20 px-2.5 py-0.5 text-xs font-medium text-teal-300">
                  {typeName(selected.mapTypeCd)}
                </span>
              )}
              <span className="text-xs text-white/30">
                {formatDate(selected.openDt)}
              </span>
            </div>

            {selected.thumbnail && (
              <img
                src={selected.thumbnail}
                alt={selected.subject}
                className="mb-4 w-full rounded-xl"
                loading="lazy"
              />
            )}

            {selected.summary && (
              <p className="mb-4 text-sm text-white/70 whitespace-pre-line">
                {selected.summary}
              </p>
            )}

            {selected.contents && (
              <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <h3 className="mb-2 text-sm font-medium text-white/50">
                  규칙
                </h3>
                <p className="text-sm text-white/70 whitespace-pre-line">
                  {selected.contents}
                </p>
              </div>
            )}

            {selected.movieUrl && youtubeId(selected.movieUrl.trim()) && (
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId(selected.movieUrl.trim())}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

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
        <EmptyState message="조건에 맞는 맵이 없습니다" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-grid">
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className="card-hover group rounded-xl border border-white/10 bg-surface-card overflow-hidden text-left hover:border-teal-500/30 hover:bg-white/[0.03]"
            >
              <div className="relative aspect-video overflow-hidden bg-white/5">
                <Image
                  src={m.thumbnail}
                  alt={m.subject}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-white/90 truncate">
                    {m.subject}
                  </h3>
                  {m.mapTypeCd !== null && (
                    <span className="shrink-0 rounded-full bg-teal-600/20 px-2 py-0.5 text-[10px] text-teal-300">
                      {typeName(m.mapTypeCd)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/30">
                  {formatDate(m.openDt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
