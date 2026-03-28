"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { StoryItem } from "@/lib/types";
import { formatDate, youtubeId, isSafeImageUrl } from "@/lib/format";
import { STORY_CATEGORY, STORY_CATEGORY_LABEL, SITE_BASE } from "@/lib/constants";
import { useDebouncedValue } from "@/lib/use-debounce";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/empty-state";

const PAGE_SIZE = 12;
const GENERIC_TAGS = new Set(["웹툰", "영상", ""]);

interface SeriesInfo {
  name: string;
  episodes: StoryItem[]; // chronological (oldest first)
}

function getSeriesKey(story: StoryItem): string {
  const tags = story.hashTagSubject
    .split(",")
    .map((t) => t.trim())
    .filter((t) => !GENERIC_TAGS.has(t));
  return tags.join(", ") || "";
}

function buildSeriesMap(stories: StoryItem[]): Map<string, SeriesInfo> {
  const map = new Map<string, SeriesInfo>();
  // stories comes newest-first, we want chronological for episodes
  for (let i = stories.length - 1; i >= 0; i--) {
    const s = stories[i];
    if (s.images.length === 0) continue;
    const key = getSeriesKey(s);
    if (!key) continue;
    const existing = map.get(key);
    if (existing) {
      existing.episodes.push(s);
    } else {
      map.set(key, { name: key, episodes: [s] });
    }
  }
  return map;
}

/* ── Lazy-loaded webtoon image with skeleton + fade-in ── */
function WebtoonImage({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(!!priority);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  return (
    <div ref={ref} className="w-full min-h-[200px]" style={{ background: loaded ? "transparent" : "rgba(255,255,255,0.03)" }}>
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`w-full block transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

function StoryViewer({
  story,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  seriesMap,
  onJump,
  isRead,
  onMarkRead,
  nextStoryTitle,
}: {
  story: StoryItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  seriesMap: Map<string, SeriesInfo>;
  onJump: (id: number) => void;
  isRead?: boolean;
  onMarkRead?: () => void;
  nextStoryTitle?: string;
}) {
  const [barVisible, setBarVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const markedReadRef = useRef(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Auto-hide bars after 3s on entry
  useEffect(() => {
    autoHideTimerRef.current = setTimeout(() => setBarVisible(false), 3000);
    return () => clearTimeout(autoHideTimerRef.current);
  }, []);

  // Reset on episode change
  useEffect(() => {
    markedReadRef.current = !!isRead;
    setScrollProgress(0);
    // Restore scroll position
    db.stories.get(story.id).then((entry) => {
      const progress = entry?.scrollProgress;
      if (typeof progress === "number" && progress > 0.05) {
        requestAnimationFrame(() => {
          const el = scrollRef.current;
          if (el) el.scrollTop = progress * (el.scrollHeight - el.clientHeight);
        });
      } else {
        scrollRef.current?.scrollTo(0, 0);
      }
    });
  }, [story.id, isRead]);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if ((e.key === "ArrowLeft" || e.key === "j") && hasPrev) onPrev();
      if ((e.key === "ArrowRight" || e.key === "k") && hasNext) onNext();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  // Save scroll position on unmount
  useEffect(() => {
    const storyId = story.id;
    return () => {
      const el = scrollRef.current;
      if (!el) return;
      const progress = el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1);
      db.stories.get(storyId).then((existing) => {
        db.stories.put({ id: storyId, readAt: existing?.readAt ?? 0, scrollProgress: progress });
      });
    };
  }, [story.id]);

  // Scroll handler: progress + auto-hide + auto-read
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const progress = el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1);
    setScrollProgress(Math.min(progress, 1));

    // Auto-hide bars while scrolling
    setBarVisible(false);
    clearTimeout(scrollTimerRef.current);
    clearTimeout(autoHideTimerRef.current);
    scrollTimerRef.current = setTimeout(() => setBarVisible(true), 2000);

    // Auto-mark read at 80%
    if (progress >= 0.8 && !markedReadRef.current) {
      markedReadRef.current = true;
      onMarkRead?.();
    }
  }, [onMarkRead]);

  const toggleBar = useCallback(() => {
    clearTimeout(scrollTimerRef.current);
    clearTimeout(autoHideTimerRef.current);
    setBarVisible((v) => !v);
  }, []);

  const hasVideo = story.images.some((img) => img.movieUrl);
  const videoUrl = story.images.find((img) => img.movieUrl)?.movieUrl;
  const vid = videoUrl ? youtubeId(videoUrl.trim()) : null;

  const currentKey = getSeriesKey(story);
  const currentSeries = currentKey ? seriesMap.get(currentKey) : undefined;
  const seriesEntries = useMemo(
    () => [...seriesMap.values()].filter((s) => s.episodes.length >= 2),
    [seriesMap],
  );

  const barClass = barVisible ? "viewer-bar-visible" : "viewer-bar-hidden";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0812]">
      {/* ── Top bar ── */}
      <div className={`shrink-0 flex items-center justify-between border-b border-white/10 bg-[#0f0b1a]/90 backdrop-blur-md px-4 py-2 ${barClass}`}>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white/90 truncate">{story.subject}</h2>
          <p className="text-[11px] text-white/40">{formatDate(story.openDt)}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="shrink-0 ml-3 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/50 hover:bg-white/10 transition-colors"
        >
          닫기
        </button>
      </div>

      {/* ── Content ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" onScroll={handleScroll} onClick={toggleBar}>
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
          <div className="mx-auto max-w-3xl">
            {story.images
              .filter((img) => isSafeImageUrl(img.imageUrl))
              .map((img, i) => (
                <WebtoonImage
                  key={`${story.id}-${i}`}
                  src={img.imageUrl}
                  alt={`${story.subject} - ${i + 1}`}
                  priority={i < 3}
                />
              ))}
          </div>
        )}

        {/* ── Episode end CTA ── */}
        <div className="py-12 text-center space-y-4" onClick={(e) => e.stopPropagation()}>
          {hasNext ? (
            <>
              <p className="text-xs text-white/40">다음 이야기</p>
              <button
                onClick={onNext}
                className="rounded-xl bg-teal-600 px-8 py-3.5 text-sm font-medium text-white hover:bg-teal-500 transition-colors"
              >
                다음화 →{nextStoryTitle ? ` ${nextStoryTitle}` : ""}
              </button>
            </>
          ) : (
            <p className="text-sm text-white/40">마지막 화입니다</p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg bg-white/5 px-5 py-2 text-sm text-white/50 hover:bg-white/10 transition-colors"
            >
              목록으로
            </button>
            {isRead && (
              <span className="text-xs text-teal-400/60">읽음 ✓</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom nav bar ── */}
      <div className={`shrink-0 border-t border-white/10 bg-[#0f0b1a]/95 backdrop-blur-md ${barClass}`} onClick={(e) => e.stopPropagation()}>
        {/* Progress bar */}
        {scrollProgress > 0 && (
          <div className="h-[2px] bg-white/5">
            <div className="h-full bg-teal-500 transition-[width] duration-150" style={{ width: `${scrollProgress * 100}%` }} />
          </div>
        )}
        {/* Series + episode selector (single row) */}
        <div className="flex items-center gap-2 px-4 py-2">
          <select
            value={currentKey}
            onChange={(e) => {
              const series = seriesMap.get(e.target.value);
              if (series && series.episodes.length > 0) onJump(series.episodes[0].id);
            }}
            className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white/70 outline-none focus:border-teal-500/50 truncate"
          >
            {seriesEntries.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
          {currentSeries && currentSeries.episodes.length >= 2 && (
            <select
              value={story.id}
              onChange={(e) => onJump(Number(e.target.value))}
              className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white/70 outline-none focus:border-teal-500/50"
            >
              {currentSeries.episodes.map((ep, i) => (
                <option key={ep.id} value={ep.id}>{i + 1}화 — {ep.subject}</option>
              ))}
            </select>
          )}
        </div>

        {/* Prev / Next (compact) */}
        <div className="flex items-center justify-between px-4 pb-2">
          <button
            onClick={() => { if (hasPrev) onPrev(); }}
            disabled={!hasPrev}
            className={`rounded-lg px-4 py-2.5 text-sm min-h-[44px] transition-colors ${hasPrev ? "bg-white/5 text-white/70 hover:bg-white/10" : "text-white/15 cursor-not-allowed"}`}
          >
            ← 이전화
          </button>
          <span className="text-[10px] text-white/40 tabular-nums">{Math.round(scrollProgress * 100)}%</span>
          <button
            onClick={() => { if (hasNext) onNext(); }}
            disabled={!hasNext}
            className={`rounded-lg px-4 py-2.5 text-sm min-h-[44px] transition-colors ${hasNext ? "bg-white/5 text-white/70 hover:bg-white/10" : "text-white/15 cursor-not-allowed"}`}
          >
            다음화 →
          </button>
        </div>
      </div>
    </div>
  );
}

export function StoryTimeline({ stories, initialTag }: { stories: StoryItem[]; initialTag?: string }) {
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [search, setSearch] = useState(initialTag ?? "");
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (initialTag !== undefined) setSearch(initialTag);
  }, [initialTag]);

  useEffect(() => {
    db.stories.getAll().then((entries) => setReadIds(new Set(entries.map((e) => e.id))));
  }, []);

  const toggleRead = useCallback(async (id: number) => {
    if (readIds.has(id)) {
      await db.stories.remove(id);
      setReadIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    } else {
      await db.stories.put({ id, readAt: Date.now() });
      setReadIds((prev) => new Set(prev).add(id));
    }
  }, [readIds]);

  const debouncedSearch = useDebouncedValue(search, 200);

  const filtered = useMemo(() => {
    let list = stories;
    if (catFilter !== null) {
      list = list.filter((s) => s.category === catFilter);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.subject.toLowerCase().includes(q) ||
          s.hashTagSubject.toLowerCase().includes(q)
      );
    }
    return list;
  }, [stories, catFilter, debouncedSearch]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [catFilter, search]);

  const flatVisible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  const grouped = useMemo(() => {
    const groups: { year: string; items: StoryItem[] }[] = [];
    const yearMap = new Map<string, StoryItem[]>();
    for (const s of flatVisible) {
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
  }, [flatVisible]);

  // All viewable stories in chronological order (oldest→newest) for prev/next navigation
  const viewableList = useMemo(
    () => [...stories.filter((s) => s.images.length > 0)].reverse(),
    [stories]
  );

  // Series map for the viewer
  const seriesMap = useMemo(() => buildSeriesMap(stories), [stories]);

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

  const closeViewer = useCallback(() => setViewingId(null), []);

  return (
    <>
      {viewingStory && viewingStory.images.length > 0 && (
        <StoryViewer
          story={viewingStory}
          onClose={closeViewer}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={viewingIdx > 0}
          hasNext={viewingIdx < viewableList.length - 1}
          seriesMap={seriesMap}
          onJump={setViewingId}
          isRead={readIds.has(viewingStory.id)}
          onMarkRead={() => {
            if (!readIds.has(viewingStory.id)) toggleRead(viewingStory.id);
          }}
          nextStoryTitle={viewingIdx < viewableList.length - 1 ? viewableList[viewingIdx + 1].subject : undefined}
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
            onClick={() => setCatFilter(STORY_CATEGORY.WEBTOON)}
            className={`px-3 py-1.5 transition-colors ${
              catFilter === STORY_CATEGORY.WEBTOON
                ? "bg-teal-600 text-white font-medium"
                : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            {STORY_CATEGORY_LABEL[STORY_CATEGORY.WEBTOON]}
          </button>
          <button
            onClick={() => setCatFilter(STORY_CATEGORY.VIDEO)}
            className={`px-3 py-1.5 transition-colors ${
              catFilter === STORY_CATEGORY.VIDEO
                ? "bg-teal-600 text-white font-medium"
                : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            {STORY_CATEGORY_LABEL[STORY_CATEGORY.VIDEO]}
          </button>
        </div>
        <input
          type="text"
          placeholder="어떤 이야기를 찾고 있어?"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50 sm:text-sm sm:py-1.5"
        />
        <span className="text-xs text-white/40">{filtered.length}개</span>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <EmptyState message="조건에 맞는 스토리가 없습니다" />
      ) : (
        <div className="space-y-8">
          {grouped.map(({ year, items }) => (
            <section key={year}>
              <h2 className="mb-4 text-lg font-bold text-white/70">{year}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 stagger-grid">
                {items.map((s) => (
                  <button
                    key={s.id}
                    onClick={() =>
                      s.images.length > 0
                        ? setViewingId(s.id)
                        : window.open(
                            `${SITE_BASE}/archive/trstory/${s.id}`,
                            "_blank"
                          )
                    }
                    className="card-hover group rounded-xl border border-white/10 bg-surface-card overflow-hidden text-left hover:border-teal-500/30 hover:bg-white/[0.03]"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
                      <Image
                        src={s.thumbnail}
                        alt={s.subject}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      {readIds.has(s.id) && (
                        <div className="absolute top-2 right-2 rounded-full bg-teal-600/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          읽음
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-white/90 line-clamp-2 mb-1">
                        {s.subject}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            s.category === STORY_CATEGORY.WEBTOON
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {STORY_CATEGORY_LABEL[s.category]}
                        </span>
                        <span className="text-[11px] text-white/40">
                          {formatDate(s.openDt)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
              >
                더보기 ({filtered.length - visibleCount}개 남음)
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
