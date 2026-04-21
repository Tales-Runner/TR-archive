"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js on the client after mount.
 *
 * Only active in production — in dev, Next's HMR conflicts with the service
 * worker's caching, and debugging is easier without it. If the user has been
 * served a SW in the past from prod and then visits dev, we actively
 * unregister to avoid stale caching confusion.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("[tr-archive] SW registration failed:", err);
      });
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return null;
}
