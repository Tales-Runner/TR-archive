import { test, expect } from "@playwright/test";

test.describe("navigation", () => {
  test("메뉴 드롭다운으로 라우트 이동", async ({ page }) => {
    await page.goto("/");

    // Click nav group that contains /characters
    const dogamToggle = page.getByRole("button", { name: /도감/ });
    await dogamToggle.click();
    const charactersLink = page.getByRole("link", { name: "런너 능력치" });
    await expect(charactersLink).toBeVisible();
    await charactersLink.click();

    await expect(page).toHaveURL(/\/characters/);
  });

  test("글로벌 검색이 Cmd/Ctrl+K 로 열림", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Ensure focus is on the document, not an input — use-document-keydown
    // only fires on document-level events.
    await page.locator("body").click();
    // Try both to cover mac (metaKey) and other platforms (ctrlKey).
    await page.keyboard.press("ControlOrMeta+k");

    const searchInput = page.getByPlaceholder(/검색/);
    await expect(searchInput).toBeVisible({ timeout: 3_000 });
  });
});
