"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";

interface Options {
  storyId: number;
  scrollRef: React.RefObject<HTMLElement | null>;
  /** Called once when the user crosses the read threshold. */
  onMarkRead?: () => void;
  /** Called with a message whenever a saved position is restored. */
  onToast?: (msg: string) => void;
  /** Whether the episode is already marked read. */
  isRead?: boolean;
  /**
   * Fraction of document depth at which to consider the user has "read" it.
   * Defaults to 0.8 — leaves slack for the end-of-episode CTA footer.
   */
  readThreshold?: number;
}

interface Result {
  scrollProgress: number;
  handleScroll: () => void;
}

/**
 * Persists per-story scroll position to IndexedDB, restores on mount,
 * and fires `onMarkRead` once the user reaches `readThreshold`.
 *
 * Splits three concerns that were previously tangled inside StoryViewer:
 *   1. Scroll progress state for the progress bar.
 *   2. Read-threshold detection.
 *   3. Save-on-unmount to IDB so the next open lands where the user left.
 */
export function useScrollRestore({
  storyId,
  scrollRef,
  onMarkRead,
  onToast,
  isRead,
  readThreshold = 0.8,
}: Options): Result {
  const [scrollProgress, setScrollProgress] = useState(0);
  const markedReadRef = useRef(false);

  // Track read state — separated from scroll restore so isRead changes
  // (from our own onMarkRead callback) don't re-trigger the DB fetch + toast.
  useEffect(() => {
    markedReadRef.current = !!isRead;
  }, [storyId, isRead]);

  // Restore scroll + toast on episode change.
  useEffect(() => {
    db.stories.get(storyId).then((entry) => {
      const progress = entry?.scrollProgress;
      if (typeof progress === "number" && progress > 0.05) {
        requestAnimationFrame(() => {
          const el = scrollRef.current;
          if (el) el.scrollTop = progress * (el.scrollHeight - el.clientHeight);
        });
        onToast?.("이어서 읽는 중");
      } else {
        scrollRef.current?.scrollTo(0, 0);
      }
    });
  }, [storyId, scrollRef, onToast]);

  // Save scroll on unmount / story change.
  useEffect(() => {
    const capturedId = storyId;
    const capturedEl = scrollRef.current;
    return () => {
      const el = capturedEl;
      if (!el) return;
      const progress =
        el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1);
      db.stories.get(capturedId).then((existing) => {
        db.stories.put({
          id: capturedId,
          readAt: existing?.readAt ?? 0,
          scrollProgress: progress,
        });
      });
    };
  }, [storyId, scrollRef]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const progress =
      el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1);
    setScrollProgress(Math.min(progress, 1));
    if (progress >= readThreshold && !markedReadRef.current) {
      markedReadRef.current = true;
      onMarkRead?.();
    }
  }, [scrollRef, onMarkRead, readThreshold]);

  return { scrollProgress, handleScroll };
}
