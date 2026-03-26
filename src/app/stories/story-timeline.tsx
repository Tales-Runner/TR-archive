"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { StoryItem } from "@/lib/types";
import { formatDate, youtubeId } from "@/lib/format";

function StoryViewer({
  story,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  story: StoryItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const [barVisible, setBarVisible] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => {
    document.getElementById("story-scroll")?.scrollTo(0, 0);
  }, [story.id]);

  const hasVideo = story.images.some((img) => img.movieUrl);
  const videoUrl = story.images.find((img) => img.movieUrl)?.movieUrl;
  const vid = videoUrl ? youtubeId(videoUrl.trim()) : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0812]">
      {barVisible && (
        <div className="shrink-0 flex items-center justify-between border-b border-white/10 bg-[#0f0b1a]/90 backdrop-blur-md px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white/90 truncate">
              {story.subject}
            </h2>
            <p className="text-[11px] text-white/30">{formatDate(story.openDt)}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="shrink-0 ml-4 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
          >
            닫기
          </button>
        </div>
      )}

      {/* Content */}
      <div id="story-scroll" className="flex-1 overflow-y-auto" onClick={() => setBarVisible((v) => !v)}>
        {hasVideo && vid ? (
          <div className="mx-auto max-w-3xl p-4">
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${vid}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            {story.images.map((img, i) => (
              <img
                key={i}
                src={img.imageUrl}
                alt={`${story.subject} - ${i + 1}`}
                className="w-full"
                loading={i < 3 ? "eager" : "lazy"}
              />
            ))}
          </div>
        )}

        <div className="py-8 text-center">
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="rounded-lg bg-white/5 px-5 py-2 text-sm text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>

      {/* Bottom nav bar - toggle on tap */}
      {barVisible && (
      <div
        className="shrink-0 flex items-center justify-between border-t border-white/10 bg-[#0f0b1a]/95 backdrop-blur-md px-4 py-3"
      >
        <button
          onClick={(e) => { e.stopPropagation(); if (hasPrev) onPrev(); }}
          disabled={!hasPrev}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
            hasPrev
              ? "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90"
              : "text-white/15 cursor-not-allowed"
          }`}
        >
          ← 이전화
        </button>

        <span className="text-xs text-white/30">{story.subject}</span>

        <button
          onClick={(e) => { e.stopPropagation(); if (hasNext) onNext(); }}
          disabled={!hasNext}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
            hasNext
              ? "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90"
              : "text-white/15 cursor-not-allowed"
          }`}
        >
          다음화 →
        </button>
      </div>
      )}
    </div>
  );
}

export function StoryTimeline({ stories }: { stories: StoryItem[] }) {
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [viewingId, setViewingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = stories;
    if (catFilter !== null) {
      list = list.filter((s) => s.category === catFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.subject.toLowerCase().includes(q) ||
          s.hashTagSubject.toLowerCase().includes(q)
      );
    }
    return list;
  }, [stories, catFilter, search]);

  const grouped = useMemo(() => {
    const groups: { year: string; items: StoryItem[] }[] = [];
    const yearMap = new Map<string, StoryItem[]>();
    for (const s of filtered) {
      const existing = yearMap.get(s.openYear);
      if (existing) {
        existing.push(s);
      } else {
        const arr = [s];
        yearMap.set(s.openYear, arr);
        groups.push({ year: s.openYear, items: arr });
      }
    }
    return groups;
  }, [filtered]);

  // All viewable stories (with images) in order for prev/next navigation
  const viewableList = useMemo(
    () => stories.filter((s) => s.images.length > 0),
    [stories]
  );

  const viewingStory =
    viewingId !== null ? stories.find((s) => s.id === viewingId) : null;

  const viewingIdx = viewingStory
    ? viewableList.findIndex((s) => s.id === viewingStory.id)
    : -1;

  const goPrev = useCallback(() => {
    if (viewingIdx > 0) setViewingId(viewableList[viewingIdx - 1].id);
  }, [viewingIdx, viewableList]);

  const goNext = useCallback(() => {
    if (viewingIdx < viewableList.length - 1)
      setViewingId(viewableList[viewingIdx + 1].id);
  }, [viewingIdx, viewableList]);

  return (
    <>
      {viewingStory && viewingStory.images.length > 0 && (
        <StoryViewer
          story={viewingStory}
          onClose={() => setViewingId(null)}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={viewingIdx > 0}
          hasNext={viewingIdx < viewableList.length - 1}
        />
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-white/10 overflow-hidden text-sm">
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
          <button
            onClick={() => setCatFilter(1)}
            className={`px-3 py-1.5 transition-colors ${
              catFilter === 1
                ? "bg-teal-600 text-white font-medium"
                : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            웹툰
          </button>
          <button
            onClick={() => setCatFilter(2)}
            className={`px-3 py-1.5 transition-colors ${
              catFilter === 2
                ? "bg-teal-600 text-white font-medium"
                : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            영상
          </button>
        </div>
        <input
          type="text"
          placeholder="어떤 이야기를 찾고 있어?"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50"
        />
        <span className="text-xs text-white/30">{filtered.length}개</span>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {grouped.map(({ year, items }) => (
          <section key={year}>
            <h2 className="mb-4 text-lg font-bold text-white/70">{year}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    s.images.length > 0
                      ? setViewingId(s.id)
                      : window.open(
                          `https://tr.rhaon.co.kr/archive/trstory/${s.id}`,
                          "_blank"
                        )
                  }
                  className="group rounded-xl border border-white/10 bg-surface-card overflow-hidden text-left transition-all hover:border-teal-500/30 hover:bg-white/[0.03]"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-white/5">
                    <img
                      src={s.thumbnail}
                      alt={s.subject}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-white/90 line-clamp-2 mb-1">
                      {s.subject}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          s.category === 1
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {s.category === 1 ? "웹툰" : "영상"}
                      </span>
                      <span className="text-[11px] text-white/30">
                        {formatDate(s.openDt)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
