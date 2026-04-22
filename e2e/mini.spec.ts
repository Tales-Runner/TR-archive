import { test, expect } from "@playwright/test";

/**
 * 팬 미니게임 기본 스모크. 캔버스가 실제로 그려지는지, 키보드 입력에
 * 반응하는지만 검증. 프레임 단위 게임 동작은 엔진 순수함수라 유닛
 * 테스트로 따로 커버 가능 (후속).
 */
test.describe("도트 러너", () => {
  // headless WebKit 의 GHA runner 에서 canvas getImageData / 키 입력
  // 처리가 chromium/firefox 와 달리 일관되지 않게 동작 (로컬 WebKit 에선
  // 통과). 동일 류 회피 — navigation spec 과 같은 정책.
  test.skip(({ browserName }) => browserName === "webkit", "WebKit headless CI flake");

  test("캔버스 렌더 + 픽셀 비어있지 않음", async ({ page }) => {
    await page.goto("/mini");
    const canvas = page.getByLabel("테일즈런너 미니게임 캔버스");
    await expect(canvas).toBeVisible();

    // 몇 프레임 기다려 배경 / 구름이 그려지게 함
    await page.waitForTimeout(200);

    const isBlank = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext("2d");
      if (!ctx) return true;
      const { data } = ctx.getImageData(0, 0, el.width, el.height);
      // 모든 픽셀이 동일하면 blank
      const r0 = data[0];
      const g0 = data[1];
      const b0 = data[2];
      for (let i = 4; i < data.length; i += 4) {
        if (data[i] !== r0 || data[i + 1] !== g0 || data[i + 2] !== b0) {
          return false;
        }
      }
      return true;
    });
    expect(isBlank, "canvas should not be uniformly blank").toBe(false);
  });

  test("SPACE 키 누르면 ready → running 상태 전이", async ({ page }) => {
    await page.goto("/mini");
    await expect(page.getByText("상태: 대기")).toBeVisible();

    await page.locator("body").click();
    await page.keyboard.press("Space");

    // running 텍스트로 전이 — 렌더 루프가 state mirror 갱신하는 데
    // 한 프레임 필요
    await expect(page.getByText("상태: 플레이")).toBeVisible({ timeout: 2_000 });
  });
});
