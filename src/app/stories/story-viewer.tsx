"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { StoryItem } from "@/lib/types";
import { formatDate, youtubeId, isSafeImageUrl } from "@/lib/format";
import { useDocumentKeydown } from "@/lib/use-document-keydown";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useSwipeNav } from "@/lib/use-swipe-nav";
import { WebtoonImage } from "./webtoon-image";
import { EpisodeDrawer } from "./episode-drawer";
import { useScrollRestore } from "./use-scroll-restore";
import type { SeriesInfo } from "./story-utils";
import { BRIGHTNESS_KEY, ZOOM_LEVELS } from "./story-utils";

export function StoryViewer({
  story,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  series,
  epIndex,
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
  series?: SeriesInfo;
  epIndex: number;
  onJump: (id: number) => void;
  isRead?: boolean;
  onMarkRead?: () => void;
  nextStoryTitle?: string;
  readIds: Set<number>;
}) {
  const [barVisible, setBarVisible] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(0);
  // Lazy init from localStorage — safe because <StoryViewer> is only ever
  // mounted from a click handler inside a client component, never during SSR,
  // so there is no hydration boundary to straddle. Guard with Number.isFinite
  // to survive a malformed saved value.
  const [brightness, setBrightness] = useState(() => {
    try {
      const saved = localStorage.getItem(BRIGHTNESS_KEY);
      if (saved) {
        const n = Number(saved);
        if (Number.isFinite(n)) return n;
      }
    } catch {}
    return 100;
  });
  const [viewerToast, setViewerToast] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const zoom = ZOOM_LEVELS[zoomIdx];

  const showToast = useCallback((msg: string) => {
    setViewerToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setViewerToast(null), 2000);
  }, []);

  const handleBrightness = useCallback((v: number) => {
    setBrightness(v);
    try {
      localStorage.setItem(BRIGHTNESS_KEY, String(v));
    } catch {}
  }, []);

  useBodyScrollLock(true);

  // Trap Tab focus inside the dialog + restore focus on close.
  useFocusTrap(true, rootRef, closeBtnRef);

  // Auto-hide bars after 3s
  useEffect(() => {
    autoHideTimerRef.current = setTimeout(() => setBarVisible(false), 3000);
    return () => clearTimeout(autoHideTimerRef.current);
  }, []);

  // Reset on episode change
  const [prevStoryId, setPrevStoryId] = useState(story.id);
  if (prevStoryId !== story.id) {
    setPrevStoryId(story.id);
    setZoomIdx(0);
    setShowDrawer(false);
    setShowSettings(false);
  }

  // Scroll restore + read-threshold detection (extracted hook).
  const { scrollProgress, handleScroll: restoreHandleScroll } =
    useScrollRestore({
      storyId: story.id,
      scrollRef,
      onMarkRead,
      onToast: showToast,
      isRead,
    });

  // URL sync
  useEffect(() => {
    const url = `${window.location.pathname}?story=${story.id}`;
    window.history.replaceState({ storyId: story.id }, "", url);
  }, [story.id]);

  // Keyboard
  useDocumentKeydown(
    useCallback((e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.key === "ArrowLeft" || e.key === "j") && hasPrev) onPrev();
      if ((e.key === "ArrowRight" || e.key === "k") && hasNext) onNext();
    }, [onClose, onPrev, onNext, hasPrev, hasNext]),
  );

  // Scroll handler — delegates progress + read mark to useScrollRestore,
  // keeps bar-hide-on-scroll locally since it's coupled to timer state.
  const handleScroll = useCallback(() => {
    restoreHandleScroll();
    setBarVisible(false);
    clearTimeout(scrollTimerRef.current);
    clearTimeout(autoHideTimerRef.current);
    scrollTimerRef.current = setTimeout(() => setBarVisible(true), 2000);
  }, [restoreHandleScroll]);

  const toggleBar = useCallback(() => {
    clearTimeout(scrollTimerRef.current);
    clearTimeout(autoHideTimerRef.current);
    setBarVisible((v) => !v);
  }, []);

  // Swipe gesture for prev/next episode (extracted hook).
  const { onTouchStart, onTouchEnd } = useSwipeNav({
    onPrev,
    onNext,
    hasPrev,
    hasNext,
  });

  const hasVideo = story.images.some((img) => img.movieUrl);
  const videoUrl = story.images.find((img) => img.movieUrl)?.movieUrl;
  const vid = videoUrl ? youtubeId(videoUrl.trim()) : null;

  const barClass = barVisible ? "viewer-bar-visible" : "viewer-bar-hidden";

  const titleId = `story-viewer-title-${story.id}`;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[70] flex flex-col bg-[#0a0812]"
    >
      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f0b1a]/90 backdrop-blur-md px-4 py-2 ${barClass}`}
      >
        <div className="min-w-0">
          <h2 id={titleId} className="text-sm font-bold text-white/90 truncate">
            {story.subject}
          </h2>
          <p className="text-[11px] text-white/40">
            {formatDate(story.openDt)}
          </p>
        </div>
        <button
          ref={closeBtnRef}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="스토리 뷰어 닫기"
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
        className={`absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-[#0f0b1a]/95 backdrop-blur-md ${barClass}`}
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
        {series && series.episodes.length >= 2 && (
          <button
            onClick={() => setShowDrawer(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <span className="truncate">{series.name}</span>
            <span className="text-white/30">·</span>
            <span className="text-teal-400/70 shrink-0">
              {epIndex + 1}/{series.episodes.length}화
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
      {showDrawer && series && (
        <EpisodeDrawer
          series={series}
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
