import { test, expect } from "@playwright/test";

/**
 * Live upstream proxy 검증 — 기본 CI 에서 skip.
 *
 * 왜 skip: CI 의 localhost webserver 가 upstream (tr.rhaon.co.kr) 을
 * 프록시하면 502/504 빈도가 높아 flake. GHA IP 대역 차별인지 upstream
 * 간헐 장애인지는 확정 안 됐지만, 어느 쪽이든 CI 에서 신뢰하기 어려움.
 *
 * 배포 직후 수동 검증:
 *   PLAYWRIGHT_LIVE=1 PLAYWRIGHT_BASE_URL=https://tr-archive.vercel.app \
 *     npm run test:e2e -g "live API proxy"
 * 프로덕션은 icn1 리전이라 훨씬 안정적.
 */
test.describe("live API proxy", () => {
  test.skip(
    !process.env.PLAYWRIGHT_LIVE,
    "Set PLAYWRIGHT_LIVE=1 and PLAYWRIGHT_BASE_URL=<live-url> to enable",
  );

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
