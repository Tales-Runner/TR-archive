"use client";

import { useEffect } from "react";

/**
 * Locks `document.body` scroll while `active` is true. Releases on cleanup.
 * Use for modals / overlays so the background page doesn't keep scrolling
 * behind them.
 */
export function useBodyScrollLock(active: boolean = true) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}
