"use client";

import { useCallback, useRef } from "react";
import type React from "react";

interface SwipeConfig {
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  /** Minimum horizontal distance (px) to count as a swipe. */
  minDistance?: number;
  /** Maximum duration (ms) — slower drags are treated as scroll intent. */
  maxDuration?: number;
  /**
   * Minimum horizontal-to-vertical ratio. Higher values demand a straighter
   * swipe; default 2 ignores diagonal gestures that are mostly vertical.
   */
  horizontalBias?: number;
}

/**
 * Returns `onTouchStart` / `onTouchEnd` handlers that call `onPrev` /
 * `onNext` for horizontal swipes. Pass straight to a React element:
 *
 *   const swipe = useSwipeNav({ onPrev, onNext, hasPrev, hasNext });
 *   <div {...swipe} />
 *
 * Right swipe → prev, left swipe → next (mirrors reading direction for LTR
 * content; flip the mapping externally for RTL if needed).
 */
export function useSwipeNav({
  onPrev,
  onNext,
  hasPrev = true,
  hasNext = true,
  minDistance = 80,
  maxDuration = 400,
  horizontalBias = 2,
}: SwipeConfig) {
  const touchRef = useRef({ startX: 0, startY: 0, startTime: 0 });

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
      if (
        Math.abs(dx) > minDistance &&
        Math.abs(dx) > dy * horizontalBias &&
        dt < maxDuration
      ) {
        if (dx > 0 && hasPrev) onPrev?.();
        else if (dx < 0 && hasNext) onNext?.();
      }
    },
    [hasPrev, hasNext, onPrev, onNext, minDistance, maxDuration, horizontalBias],
  );

  return { onTouchStart, onTouchEnd };
}
