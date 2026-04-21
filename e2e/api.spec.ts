import { test, expect } from "@playwright/test";

/**
 * Live upstream proxy guards.
 *
 * These routes are **the** regression-prone layer: they're not in the
 * daily scrape, so a silent upstream-side change (e.g. adding a User-Agent
 * filter, rotating CORS, changing response shape) leaves production broken
 * until a user notices. This spec exercises the Vercel function end-to-end,
 * catching:
 *   - upstream UA filtering (if our fetch UA is stripped, resCd != 0000)
 *   - our proxy crashing (502 from the fallback path)
 *   - response shape drift
 *
 * Runs against the app's own dev/start server (not the public upstream
 * directly), so it validates **our** glue code, not the upstream itself.
 * If the upstream is down, these tests fail — which is the correct signal
 * because our production would also be broken in that scenario.
 */
test.describe("live API proxy", () => {
  test("/api/notices 가 resCd=0000 과 비어있지 않은 list 반환", async ({
    request,
  }) => {
    const res = await request.get("/api/notices");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.resCd).toBe("0000");
    expect(Array.isArray(body.result?.list)).toBe(true);
    expect(body.result.list.length).toBeGreaterThan(0);

    // Subject / id 는 upstream 스키마의 최소 계약 — 바뀌면 UI 가 깨짐
    const first = body.result.list[0];
    expect(typeof first.id).toBe("number");
    expect(typeof first.subject).toBe("string");
  });

  test("/api/maintenance 가 resCd=0000 반환", async ({ request }) => {
    const res = await request.get("/api/maintenance");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.resCd).toBe("0000");
  });
});
