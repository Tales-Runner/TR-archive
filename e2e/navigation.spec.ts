import { test, expect } from "@playwright/test";

/**
 * WebKit 은 GitHub Actions 러너에서 pointer / keyboard 이벤트가 다르게
 * 처리돼 nav 상호작용이 플레이키하다 (로컬 chromium 에선 통과). 엔진별
 * 차이라기보단 headless WebKit 의 CI 환경 이슈라 해당 테스트는 WebKit
 * 에서 스킵한다. 보안·라우팅 검증은 smoke spec 이 3개 엔진 모두 커버.
 */
test.describe("navigation", () => {
  test("메뉴 드롭다운으로 라우트 이동", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit headless CI keyboard flake");

    await page.goto("/");

    const dogamToggle = page.getByRole("button", { name: /도감/ });
    await dogamToggle.click();
    const charactersLink = page.getByRole("link", { name: "런너 능력치" });
    await expect(charactersLink).toBeVisible();
    await charactersLink.click();

    await expect(page).toHaveURL(/\/characters/);
  });

  test("글로벌 검색이 Cmd/Ctrl+K 로 열림", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit headless CI keyboard flake");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Ensure focus is on the document, not an input — use-document-keydown
    // only fires on document-level events.
    await page.locator("body").click();
    await page.keyboard.press("ControlOrMeta+k");

    const searchInput = page.getByPlaceholder(/검색/);
    await expect(searchInput).toBeVisible({ timeout: 3_000 });
  });
});
