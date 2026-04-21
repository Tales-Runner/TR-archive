"use client";

import { useEffect, useRef } from "react";

/**
 * Traps Tab / Shift+Tab focus inside `containerRef` while the hook is
 * active. On mount, moves focus to the first focusable element (or an
 * optional `initialFocusRef`). On unmount, restores focus to the element
 * that triggered the modal — usually a button, so the user lands exactly
 * where they were before opening.
 *
 * Scope: meant for modals / drawers where the background shouldn't be
 * tabbable. Combine with `role="dialog"` + `aria-modal="true"` for screen
 * reader correctness.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  initialFocusRef?: React.RefObject<HTMLElement | null>,
) {
  const prevActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    prevActiveRef.current = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const target =
        initialFocusRef?.current ?? getFocusable(container)[0] ?? container;
      target.focus({ preventScroll: true });
    };
    // defer a tick so the container has laid out.
    const id = requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (current === first || !container.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (current === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey);
      prevActiveRef.current?.focus?.({ preventScroll: true });
    };
  }, [active, containerRef, initialFocusRef]);
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((el) => !el.hasAttribute("disabled"))
    .filter((el) => el.getAttribute("aria-hidden") !== "true")
    .filter((el) => el.offsetParent !== null || el === document.activeElement);
}
