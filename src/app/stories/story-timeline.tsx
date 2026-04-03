"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { StoryItem } from "@/lib/types";
import { formatDate, youtubeId, isSafeImageUrl } from "@/lib/format";
import {
  STORY_CATEGORY,
  STORY_CATEGORY_LABEL,
  SITE_BASE,
} from "@/lib/constants";
import { useDebouncedValue } from "@/lib/use-debounce";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/empty-state";

const PAGE_SIZE = 12;
const GENERIC_TAGS = new Set(["웹툰", "영상", ""]);
const BRIGHTNESS_KEY = "elims-viewer-brightness";
const ZOOM_LEVELS = [1, 1.5, 2] as const;

interface SeriesInfo {
  name: string;
  episodes: StoryItem[];
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
  for (let i = stories.length - 1; i >= 0; i--) {
    const s = stories[i];
    if (s.images.length === 0) continue;
    const key = getSeriesKey(s);
    if (!key) continue;
    const existing = map.get(key);
    if (existing) existing.episodes.push(s);
    else map.set(key, { name: key, episodes: [s] });
  }
  return map;
}

function getSeriesOptions(
  seriesMap: Map<string, SeriesInfo>,
): { name: string; count: number }[] {
  return [...seriesMap.values()]
    .map((s) => ({ name: s.name, count: s.episodes.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/* ── Lazy-loaded webtoon image — seamless, no gap ── */
function WebtoonImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(!!priority);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  return (
    <div
      ref={ref}
      className="w-full leading-[0]"
      style={{
        minHeight: loaded ? undefined : 200,
        background: loaded ? "transparent" : "rgba(255,255,255,0.03)",
      }}
    >
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`block w-full align-top transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          draggable={false}
        />
      )}
    </div>
  );
}

/* ── Episode drawer (bottom sheet) ── */
function EpisodeDrawer({
  series,
  currentId,
  readIds,
  onSelect,
  onClose,
}: {
  series: SeriesInfo;
  currentId: number;
  readIds: Set<number>;
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector('[data-current="true"]')
        ?.scrollIntoView({ block: "center" });
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[60vh] rounded-t-2xl bg-[#13101f] border-t border-white/10 overflow-hidden animate-slide-up"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[#13101f] px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white/80">{series.name}</h3>
            <p className="text-xs text-white/40">
              {series.episodes.length}화
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/40 hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            닫기
          </button>
        </div>
        <div
          ref={listRef}
          className="overflow-y-auto max-h-[calc(60vh-56px)] p-2"
        >
          {series.episodes.map((ep, i) => (
            <button
              key={ep.id}
              data-current={ep.id === currentId}
              onClick={() => {
                onSelect(ep.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                ep.id === currentId
                  ? "bg-teal-600/20 border border-teal-500/30"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <span
                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  ep.id === currentId
                    ? "bg-teal-600 text-white"
                    : "bg-white/5 text-white/40"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm truncate ${
                    ep.id === currentId
                      ? "text-teal-300 font-medium"
                      : readIds.has(ep.id)
                        ? "text-white/40"
                        : "text-white/70"
                  }`}
                >
                  {ep.subject}
                </p>
                <p className="text-[10px] text-white/30">
                  {formatDate(ep.openDt)}
                </p>
              </div>
              {readIds.has(ep.id) && ep.id !== currentId && (
                <span className="text-[10px] text-teal-400/40">읽음</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── StoryViewer ── */
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
  readIds,
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
  readIds: Set<number>;
}) {
  const [barVisible, setBarVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [viewerToast, setViewerToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const markedReadRef = useRef(false);
  const touchRef = useRef({ startX: 0, startY: 0, startTime: 0 });

  const zoom = ZOOM_LEVELS[zoomIdx];

  const showToast = useCallback((msg: string) => {
    setViewerToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setViewerToast(null), 2000);
  }, []);

  // Load brightness
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BRIGHTNESS_KEY);
      if (saved) setBrightness(Number(saved));
    } catch {}
  }, []);

  const handleBrightness = useCallback((v: number) => {
    setBrightness(v);
    try {
      localStorage.setItem(BRIGHTNESS_KEY, String(v));
    } catch {}
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Auto-hide bars after 3s
  useEffect(() => {
    autoHideTimerRef.current = setTimeout(() => setBarVisible(false), 3000);
    return () => clearTimeout(autoHideTimerRef.current);
  }, []);

  // Reset on episode change
  const [prevStoryId, setPrevStoryId] = useState(story.id);
  if (prevStoryId !== story.id) {
    setPrevStoryId(story.id);
    setScrollProgress(0);
    setZoomIdx(0);
    setShowDrawer(false);
    setShowSettings(false);
  }

  // Restore scroll + toast
  useEffect(() => {
    markedReadRef.current = !!isRead;
    db.stories.get(story.id).then((entry) => {
      const progress = entry?.scrollProgress;
      if (typeof progress === "number" && progress > 0.05) {
        requestAnimationFrame(() => {
          const el = scrollRef.current;
          if (el)
            el.scrollTop = progress * (el.scrollHeight - el.clientHeight);
        });
        showToast("이어서 읽는 중");
      } else {
        scrollRef.current?.scrollTo(0, 0);
      }
    });
  }, [story.id, isRead, showToast]);

  // URL sync
  useEffect(() => {
    const url = `${window.location.pathname}?story=${story.id}`;
    window.history.replaceState({ storyId: story.id }, "", url);
  }, [story.id]);

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

  // Save scroll on unmount
  useEffect(() => {
    const storyId = story.id;
    return () => {
      const el = scrollRef.current;
      if (!el) return;
      const progress =
        el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1);
      db.stories.get(storyId).then((existing) => {
        db.stories.put({
          id: storyId,
          readAt: existing?.readAt ?? 0,
          scrollProgress: progress,
        });
      });
    };
  }, [story.id]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const progress =
      el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1);
    setScrollProgress(Math.min(progress, 1));
    setBarVisible(false);
    clearTimeout(scrollTimerRef.current);
    clearTimeout(autoHideTimerRef.current);
    scrollTimerRef.current = setTimeout(() => setBarVisible(true), 2000);
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

  // Swipe gesture for prev/next episode
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      startTime: Date.now(),
    };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const { startX, startY, startTime } = touchRef.current;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = Math.abs(endY - startY);
      const dt = Date.now() - startTime;
      if (Math.abs(dx) > 80 && Math.abs(dx) > dy * 2 && dt < 400) {
        if (dx > 0 && hasPrev) onPrev();
        else if (dx < 0 && hasNext) onNext();
      }
    },
    [hasPrev, hasNext, onPrev, onNext],
  );

  const hasVideo = story.images.some((img) => img.movieUrl);
  const videoUrl = story.images.find((img) => img.movieUrl)?.movieUrl;
  const vid = videoUrl ? youtubeId(videoUrl.trim()) : null;

  const currentKey = getSeriesKey(story);
  const currentSeries = currentKey ? seriesMap.get(currentKey) : undefined;
  const epIndex = currentSeries
    ? currentSeries.episodes.findIndex((e) => e.id === story.id)
    : -1;

  const barClass = barVisible ? "viewer-bar-visible" : "viewer-bar-hidden";

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#0a0812]">
      {/* Top bar */}
      <div
        className={`shrink-0 flex items-center justify-between border-b border-white/10 bg-[#0f0b1a]/90 backdrop-blur-md px-4 py-2 ${barClass}`}
      >
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white/90 truncate">
            {story.subject}
          </h2>
          <p className="text-[11px] text-white/40">
            {formatDate(story.openDt)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="shrink-0 ml-3 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/50 hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          닫기
        </button>
      </div>

      {/* Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{
          overflowX: zoom > 1 ? "auto" : "hidden",
          filter:
            brightness !== 100 ? `brightness(${brightness}%)` : undefined,
        }}
        onScroll={handleScroll}
        onClick={toggleBar}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {hasVideo && vid ? (
          <div
            className="mx-auto max-w-3xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
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
          <div
            className={zoom === 1 ? "mx-auto max-w-3xl" : ""}
            style={
              zoom > 1
                ? { width: `${zoom * 48}rem`, maxWidth: "none" }
                : undefined
            }
          >
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

        {/* Episode end CTA */}
        <div
          className="py-12 text-center space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
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

      {/* Bottom nav bar */}
      <div
        className={`shrink-0 border-t border-white/10 bg-[#0f0b1a]/95 backdrop-blur-md ${barClass}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="h-[2px] bg-white/5">
          <div
            className="h-full bg-teal-500 transition-[width] duration-150"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* Series/episode info — tappable row */}
        {currentSeries && currentSeries.episodes.length >= 2 && (
          <button
            onClick={() => setShowDrawer(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <span className="truncate">{currentSeries.name}</span>
            <span className="text-white/30">·</span>
            <span className="text-teal-400/70 shrink-0">
              {epIndex + 1}/{currentSeries.episodes.length}화
            </span>
            <svg
              className="w-3 h-3 text-white/30 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between px-3 pb-2">
          <button
            onClick={() => {
              if (hasPrev) onPrev();
            }}
            disabled={!hasPrev}
            className={`rounded-lg px-3 py-2.5 text-sm min-h-[44px] transition-colors ${
              hasPrev
                ? "bg-white/5 text-white/70 hover:bg-white/10"
                : "text-white/15 cursor-not-allowed"
            }`}
          >
            ← 이전
          </button>

          <div className="flex items-center gap-1">
            {/* Brightness / settings */}
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="rounded-lg p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
              title="설정"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42" />
              </svg>
            </button>

            {/* Zoom (webtoon only) */}
            {!hasVideo && (
              <button
                onClick={() =>
                  setZoomIdx((i) => (i + 1) % ZOOM_LEVELS.length)
                }
                className="rounded-lg p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                title="확대"
              >
                <span className="text-xs font-bold tabular-nums">
                  {zoom}×
                </span>
              </button>
            )}

            {/* Scroll progress */}
            <span className="text-[10px] text-white/30 tabular-nums w-8 text-center">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          <button
            onClick={() => {
              if (hasNext) onNext();
            }}
            disabled={!hasNext}
            className={`rounded-lg px-3 py-2.5 text-sm min-h-[44px] transition-colors ${
              hasNext
                ? "bg-white/5 text-white/70 hover:bg-white/10"
                : "text-white/15 cursor-not-allowed"
            }`}
          >
            다음 →
          </button>
        </div>
      </div>

      {/* Viewer toast (positioned at top) */}
      {viewerToast && (
        <div className="fixed top-14 left-0 right-0 z-[70] flex justify-center pointer-events-none">
          <div className="rounded-lg border border-white/10 bg-[#1a1530]/95 backdrop-blur-md px-4 py-2 text-sm text-white/80 shadow-lg animate-fade-in">
            {viewerToast}
          </div>
        </div>
      )}

      {/* Episode drawer */}
      {showDrawer && currentSeries && (
        <EpisodeDrawer
          series={currentSeries}
          currentId={story.id}
          readIds={readIds}
          onSelect={onJump}
          onClose={() => setShowDrawer(false)}
        />
      )}

      {/* Settings popover */}
      {showSettings && (
        <div
          className="fixed inset-0 z-[70]"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="absolute w-56 rounded-xl bg-[#1a1530] border border-white/10 p-4 shadow-xl animate-scale-in"
            style={{
              bottom: "calc(7rem + env(safe-area-inset-bottom, 0px))",
              right: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <label className="flex items-center justify-between text-xs text-white/50 mb-3">
              <span>밝기</span>
              <span className="text-white/30 tabular-nums">{brightness}%</span>
            </label>
            <input
              type="range"
              min={50}
              max={150}
              value={brightness}
              onChange={(e) => handleBrightness(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
            <div className="flex justify-between text-[10px] text-white/25 mt-1">
              <span>어둡게</span>
              <span>밝게</span>
            </div>
            {brightness !== 100 && (
              <button
                onClick={() => handleBrightness(100)}
                className="mt-3 w-full rounded-lg bg-white/5 py-1.5 text-xs text-white/40 hover:bg-white/10 transition-colors"
              >
                초기화
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── StoryTimeline (main export) ── */
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
      // Deep link — just strip query param
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
          hasPrev={viewingIdx > 0}
          hasNext={viewingIdx < viewableList.length - 1}
          seriesMap={seriesMap}
          onJump={(id) => setViewingId(id)}
          isRead={readIds.has(viewingStory.id)}
          onMarkRead={() => {
            if (!readIds.has(viewingStory.id)) toggleRead(viewingStory.id);
          }}
          nextStoryTitle={
            viewingIdx < viewableList.length - 1
              ? viewableList[viewingIdx + 1].subject
              : undefined
          }
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
                {s.name} ({s.count})
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
