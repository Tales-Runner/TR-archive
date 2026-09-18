"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

/** Shareable details; browser Back closes a detail opened from its list. */
export function useDetailRoute() {
  const params = useSearchParams();
  const raw = params.get("id");
  const id = raw && /^\d+$/.test(raw) && Number.isSafeInteger(Number(raw)) ? Number(raw) : null;
  const select = useCallback((next: number | null) => {
    const url = new URL(window.location.href);
    if (next === null) {
      if (window.history.state?.archiveDetail === url.pathname) {
        window.history.back();
        return;
      }
      url.searchParams.delete("id");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } else {
      url.searchParams.set("id", String(next));
      window.history.pushState({ archiveDetail: url.pathname }, "", url.pathname + url.search + url.hash);
    }
  }, []);
  return [id, select] as const;
}
