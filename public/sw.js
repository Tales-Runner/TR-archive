/**
 * tr-archive service worker — offline-first for visited pages.
 *
 * Strategy (by URL pattern):
 *   _next/static/*         → cache-first (versioned URLs, safe to pin)
 *   trimage.rhaon.co.kr/*  → stale-while-revalidate
 *   /api/*                 → network-only (notices / maintenance are live)
 *   everything else (HTML) → network-first, fall back to cache on offline
 *
 * No precache list: the SW warms opportunistically as the user navigates.
 * This keeps the SW decoupled from the build — no codegen needed.
 *
 * Bump CACHE_VERSION to invalidate old caches after breaking changes.
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `tr-archive-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `tr-archive-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `tr-archive-images-${CACHE_VERSION}`;

const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.add(OFFLINE_URL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.endsWith(CACHE_VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

function isImageCdn(url) {
  return url.hostname === "trimage.rhaon.co.kr";
}

function isApi(url) {
  return url.pathname.startsWith("/api/");
}

// Vercel Analytics / Speed Insights beacons — don't cache.
function isVercelTelemetry(url) {
  return url.pathname.startsWith("/_vercel/");
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const refresh = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit ?? refresh;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    const fallback = await cache.match(OFFLINE_URL);
    return fallback ?? Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip cross-origin non-image requests entirely.
  if (url.origin !== self.location.origin && !isImageCdn(url)) return;

  if (isApi(url) || isVercelTelemetry(url)) return; // network-only; let the browser handle it.

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isImageCdn(url)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // Navigation / HTML / JSON data / fonts — network-first.
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});
