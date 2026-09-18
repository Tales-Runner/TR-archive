"use client";

import { useEffect } from "react";

let locks = 0;
let previousOverflow = "";

/**
 * Locks `document.body` scroll while `active` is true. Releases on cleanup.
 * Use for modals / overlays so the background page doesn't keep scrolling
 * behind them.
 */
export function useBodyScrollLock(active: boolean = true) {
  useEffect(() => {
    if (!active) return;
    if (locks === 0) previousOverflow = document.body.style.overflow;
    locks++;
    document.body.style.overflow = "hidden";
    return () => {
      locks--;
      if (locks === 0) document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
