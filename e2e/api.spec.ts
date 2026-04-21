import { test, expect } from "@playwright/test";

/**
 * Live upstream proxy guards.
 *
 * **CI 에서 건너뜀.** upstream (tr.rhaon.co.kr) 이 GitHub Actions 의
 * IP 대역(/main/* 엔드포인트 한정) 을 cloudflare 레벨에서 차단함 —
 * Mozilla UA 를 보내도 HTML 에러 페이지를 반환. 따라서 CI 의 localhost
 * webserver 가 upstream 을 프록시하는 방식으로는 무조건 실패.
 *
 * 대안: 배포 직후 수동으로
 *   PLAYWRIGHT_LIVE=1 PLAYWRIGHT_BASE_URL=https://tr-archive.vercel.app \
 *     npm run test:e2e -g "live API proxy"
 * 로 프로덕션 함수를 직접 때려 확인. Vercel 엣지는 upstream 차단 대역이
 * 아니므로 UA 만 맞으면 정상 응답.
 *
 * 일상적 regression 탐지는 scripts/api-health.ts 가 /trlibrary/* 를
 * 매일 찍어 커버 (/main/* 는 GHA 에서 차단되므로 health check 에도
 * 넣지 않음).
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
