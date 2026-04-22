import { test, expect } from "@playwright/test";

/**
 * Smoke tests — critical paths that the whole site depends on. These run
 * against a real `next start` (or `next dev` locally), so they catch the
 * class of bugs unit tests miss: middleware, CSP, SW registration,
 * hydration boundaries, route-level errors.
 *
 * Deliberately shallow. One assertion per page: "did the server serve it
 * without a 5xx?" Console errors are *not* asserted because external
 * dependencies (tr.rhaon.co.kr notices/maintenance API) can 4xx/5xx and
 * that's not a regression in our code.
 */

const ROUTES = [
  "/",
  "/stories",
  "/characters",
  "/maps",
  "/closet",
  "/guides",
  "/probability",
  "/exp",
  "/stats",
  "/relationships",
  "/lore",
  "/channels",
  "/notices",
  "/feedback",
  "/my",
  "/mini",
];

test.describe("smoke", () => {
  test("홈 페이지의 <title> 이 설정됨", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/엘림스|아카이브/);
  });

  for (const path of ROUTES) {
    test(`route ${path} 은 2xx/3xx 반환 + 서버 에러 없음`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response, `no response for ${path}`).not.toBeNull();
      const status = response!.status();
      expect(status, `${path} → ${status}`).toBeLessThan(400);
    });
  }

  test("robots.txt 접근 가능", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("User-Agent: *");
    expect(body).toContain("Sitemap:");
  });

  test("sitemap.xml 에 주요 라우트 포함", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("/stories");
    expect(body).toContain("/characters");
    expect(body).toContain("/probability");
  });

  test("manifest.json 유효한 PWA manifest", async ({ request }) => {
    const res = await request.get("/manifest.json");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.name).toBeTruthy();
    expect(json.start_url).toBe("/");
    expect(json.display).toBe("standalone");
    expect(Array.isArray(json.icons)).toBe(true);
  });

  test("sw.js 응답 올바른 JS content-type", async ({ request }) => {
    const res = await request.get("/sw.js");
    expect(res.status()).toBe(200);
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toMatch(/javascript/);
    const body = await res.text();
    expect(body).toContain("CACHE_VERSION");
  });
});

test.describe("security headers", () => {
  test("CSP 헤더가 nonce 기반 strict-dynamic 포함", async ({ page }) => {
    const response = await page.goto("/");
    const csp = response?.headers()["content-security-policy"] ?? "";
    expect(csp).toContain("strict-dynamic");
    expect(csp).toMatch(/nonce-[A-Za-z0-9+/=]+/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  test("HSTS + X-Frame-Options 등 정적 보안 헤더", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers() ?? {};
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("매 요청마다 CSP nonce 가 달라짐", async ({ request }) => {
    const a = await request.get("/");
    const b = await request.get("/");
    const extractNonce = (csp: string) =>
      csp.match(/nonce-([A-Za-z0-9+/=]+)/)?.[1];
    const nonceA = extractNonce(a.headers()["content-security-policy"] ?? "");
    const nonceB = extractNonce(b.headers()["content-security-policy"] ?? "");
    expect(nonceA).toBeTruthy();
    expect(nonceB).toBeTruthy();
    expect(nonceA).not.toBe(nonceB);
  });
});
