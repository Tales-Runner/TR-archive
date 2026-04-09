"use client";

import { useEffect } from "react";

/**
 * Registers a `keydown` listener on `document` and cleans up on unmount.
 * Pass `null` to skip registration (useful for conditional listeners).
 * The caller must ensure `handler` is stable (e.g. wrapped in useCallback).
 */
export function useDocumentKeydown(handler: ((e: KeyboardEvent) => void) | null) {
  useEffect(() => {
    if (!handler) return;
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handler]);
}
