"use client";

import { useState, useMemo } from "react";
import type { MapItem, MapType } from "@/lib/types";
import { formatDate, youtubeId } from "@/lib/format";

export function MapCatalog({
  maps,
  types,
}: {
  maps: MapItem[];
  types: MapType[];
}) {
  const [typeFilter, setTypeFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [selectedId, setSelectedId] = useState<number | null>(null);

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

  const selected = selectedId !== null ? maps.find((m) => m.id === selectedId) : null;

  const typeName = (code: number | null) =>
    types.find((t) => t.codeId === code)?.codeName ?? "";

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap rounded-lg border border-white/10 overflow-hidden text-sm">
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
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50"
        />
        <span className="text-xs text-white/30">{filtered.length}개</span>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#13101f] p-6"
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedId(m.id)}
            className="group rounded-xl border border-white/10 bg-surface-card overflow-hidden text-left transition-all hover:border-teal-500/30 hover:bg-white/[0.03]"
          >
            <div className="aspect-video overflow-hidden bg-white/5">
              <img
                src={m.thumbnail}
                alt={m.subject}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
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
    </>
  );
}
