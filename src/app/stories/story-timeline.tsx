"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { StoryItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import {
  STORY_CATEGORY,
  STORY_CATEGORY_LABEL,
  SITE_BASE,
} from "@/lib/constants";
import { useDebouncedValue } from "@/lib/use-debounce";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/empty-state";
import { StoryViewer } from "./story-viewer";
import {
  PAGE_SIZE,
  getSeriesKey,
  buildSeriesMap,
  getSeriesOptions,
} from "./story-utils";

export function StoryTimeline({
  stories,
  initialTag,
  initialStoryId,
}: {
  stories: StoryItem[];
  initialTag?: string;
  initialStoryId?: number;
}) {
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [seriesFilter, setSeriesFilter] = useState("");
  const [search, setSearch] = useState(initialTag ?? "");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const sentinelRef = useRef<HTMLDivElement>(null);
  const historyPushed = useRef(false);

  // Sync search with initialTag
  const [prevInitialTag, setPrevInitialTag] = useState(initialTag);
  if (prevInitialTag !== initialTag) {
    setPrevInitialTag(initialTag);
    if (initialTag !== undefined) setSearch(initialTag);
  }

  // Load read IDs
  useEffect(() => {
    db.stories
      .getAll()
      .then((entries) => setReadIds(new Set(entries.map((e) => e.id))));
  }, []);

  // Deep link — open viewer if initialStoryId
  useEffect(() => {
    if (initialStoryId && stories.some((s) => s.id === initialStoryId)) {
      setViewingId(initialStoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browser back / forward
  useEffect(() => {
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      const sp = params.get("story");
      if (sp) {
        setViewingId(Number(sp));
      } else {
        setViewingId(null);
        historyPushed.current = false;
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const toggleRead = useCallback(
    async (id: number) => {
      if (readIds.has(id)) {
        await db.stories.remove(id);
        setReadIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await db.stories.put({ id, readAt: Date.now() });
        setReadIds((prev) => new Set(prev).add(id));
      }
    },
    [readIds],
  );

  const debouncedSearch = useDebouncedValue(search, 200);
  const seriesMap = useMemo(() => buildSeriesMap(stories), [stories]);
  const seriesOptions = useMemo(
    () => getSeriesOptions(seriesMap),
    [seriesMap],
  );

  const filtered = useMemo(() => {
    let list = stories;
    if (catFilter !== null) {
      list = list.filter((s) => s.category === catFilter);
    }
    if (seriesFilter) {
      list = list.filter((s) => getSeriesKey(s) === seriesFilter);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.subject.toLowerCase().includes(q) ||
          s.hashTagSubject.toLowerCase().includes(q),
      );
    }
    if (sort === "oldest") {
      list = [...list].reverse();
    }
    return list;
  }, [stories, catFilter, seriesFilter, debouncedSearch, sort]);

  // Reset pagination on filter change
  const [prevCatFilter, setPrevCatFilter] = useState(catFilter);
  const [prevSearch, setPrevSearch] = useState(search);
  const [prevSeriesFilter, setPrevSeriesFilter] = useState(seriesFilter);
  const [prevSort, setPrevSort] = useState(sort);
  if (
    prevCatFilter !== catFilter ||
    prevSearch !== search ||
    prevSeriesFilter !== seriesFilter ||
    prevSort !== sort
  ) {
    setPrevCatFilter(catFilter);
    setPrevSearch(search);
    setPrevSeriesFilter(seriesFilter);
    setPrevSort(sort);
    setVisibleCount(PAGE_SIZE);
  }

  const flatVisible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((v) => v + PAGE_SIZE);
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  const grouped = useMemo(() => {
    const groups: { year: string; items: StoryItem[] }[] = [];
    const yearMap = new Map<string, StoryItem[]>();
    for (const s of flatVisible) {
      const existing = yearMap.get(s.openYear);
      if (existing) existing.push(s);
      else {
        const arr = [s];
        yearMap.set(s.openYear, arr);
        groups.push({ year: s.openYear, items: arr });
      }
    }
    return groups;
  }, [flatVisible]);

  const viewableList = useMemo(
    () => [...stories.filter((s) => s.images.length > 0)].reverse(),
    [stories],
  );

  const viewingStory =
    viewingId !== null ? stories.find((s) => s.id === viewingId) : null;

  // Resolve navigation list: series episodes if multi-episode, else global viewable list
  const viewingSeriesKey = viewingStory ? getSeriesKey(viewingStory) : "";
  const viewingSeries = viewingSeriesKey ? seriesMap.get(viewingSeriesKey) : undefined;
  const navList = viewingSeries && viewingSeries.episodes.length >= 2
    ? viewingSeries.episodes
    : viewableList;
  const navIdx = viewingStory
    ? navList.findIndex((s) => s.id === viewingStory.id)
    : -1;
  const hasPrev = navIdx > 0;
  const hasNext = navIdx >= 0 && navIdx < navList.length - 1;
  const nextStory = hasNext ? navList[navIdx + 1] : undefined;

  const goPrev = useCallback(() => {
    if (hasPrev) setViewingId(navList[navIdx - 1].id);
  }, [hasPrev, navList, navIdx]);

  const goNext = useCallback(() => {
    if (hasNext) setViewingId(navList[navIdx + 1].id);
  }, [hasNext, navList, navIdx]);

  const openViewer = useCallback((id: number) => {
    setViewingId(id);
    window.history.pushState({ storyId: id }, "", `?story=${id}`);
    historyPushed.current = true;
  }, []);

  const closeViewer = useCallback(() => {
    setViewingId(null);
    if (historyPushed.current) {
      historyPushed.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Auto-switch sort order when series filter changes
  const handleSeriesFilter = useCallback((v: string) => {
    setSeriesFilter(v);
    setSort(v ? "oldest" : "newest");
  }, []);

  return (
    <>
      {viewingStory && viewingStory.images.length > 0 && (
        <StoryViewer
          story={viewingStory}
          onClose={closeViewer}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
          series={viewingSeries}
          epIndex={navIdx}
          onJump={(id) => setViewingId(id)}
          isRead={readIds.has(viewingStory.id)}
          onMarkRead={() => {
            if (!readIds.has(viewingStory.id)) toggleRead(viewingStory.id);
          }}
          nextStoryTitle={nextStory?.subject}
          readIds={readIds}
        />
      )}

      {/* ── Filters ── */}
      <div className="mb-6 space-y-3">
        {/* Row 1: category tabs + series selector */}
        <div className="flex flex-wrap items-center gap-3">
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

          <select
            value={seriesFilter}
            onChange={(e) => handleSeriesFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/60 outline-none focus:border-teal-500/50 max-w-[200px] truncate"
          >
            <option value="">시리즈 전체</option>
            {seriesOptions.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: search + sort + count */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="어떤 이야기를 찾고 있어?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50 sm:text-sm sm:py-1.5"
          />
          <button
            onClick={() =>
              setSort((s) => (s === "newest" ? "oldest" : "newest"))
            }
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors shrink-0"
          >
            {sort === "newest" ? "최신순 ↓" : "오래된순 ↑"}
          </button>
          <span className="text-xs text-white/40 shrink-0">
            {filtered.length}개
          </span>
        </div>
      </div>

      {/* ── Timeline ── */}
      {filtered.length === 0 ? (
        <EmptyState message="조건에 맞는 스토리가 없습니다" />
      ) : (
        <div className="space-y-8">
          {grouped.map(({ year, items }) => (
            <section key={year}>
              <h2 className="mb-4 text-lg font-bold text-white/70">{year}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 stagger-grid">
                {items.map((s) => {
                  const sKey = getSeriesKey(s);
                  return (
                    <button
                      key={s.id}
                      onClick={() =>
                        s.images.length > 0
                          ? openViewer(s.id)
                          : window.open(
                              `${SITE_BASE}/archive/trstory/${s.id}`,
                              "_blank",
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
                        {s.category === STORY_CATEGORY.VIDEO && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white ml-0.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
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
                        {sKey && !seriesFilter && (
                          <p className="mt-1.5 text-[10px] text-white/25 truncate">
                            {sKey}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="h-16 flex items-center justify-center"
            >
              <div className="w-5 h-5 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin" />
            </div>
          )}
        </div>
      )}
    </>
  );
}
