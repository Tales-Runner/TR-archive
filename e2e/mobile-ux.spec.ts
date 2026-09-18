import { test, expect } from "@playwright/test";

test.describe("mobile archive", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("검색창이 화면 전체를 덮고 닫으면 스크롤과 포커스를 복원함", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "검색", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "검색", exact: true });
    const box = await dialog.boundingBox();
    expect(box?.height).toBe(812);
    expect(box?.width).toBe(375);
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await expect(page.getByRole("combobox")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("button", { name: "검색 닫기" })).toBeFocused();
    await page.getByRole("button", { name: "검색 닫기" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect(trigger).toBeFocused();
  });

  test("검색 결과를 선택하면 해당 가이드를 바로 열고 같은 페이지에서도 전환됨", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "검색", exact: true }).click();
    await page.getByRole("combobox").fill("닉네임 옥션");
    await page.getByRole("option").first().click();
    await expect(page).toHaveURL(/\/guides\?id=92/);
    await expect(page.getByRole("heading", { name: "닉네임 옥션", exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "닉네임 옥션", exact: true })).toBeVisible();
    await expect(page.locator(".guide-content img").first()).toBeVisible();
    await expect(page.getByText("콘텐츠를 표시할 수 없습니다")).toHaveCount(0);
    await page.getByRole("button", { name: "검색", exact: true }).click();
    await page.getByRole("combobox").fill("광장 이용하기");
    await page.getByRole("combobox").press("Enter");
    await expect(page).toHaveURL(/\/guides\?id=91/);
    await expect(page.getByRole("heading", { name: "광장 이용하기", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "← 목록으로" }).click();
    await expect(page).toHaveURL(/\/guides$/);
  });

  for (const [route, id] of [["maps", 105], ["closet", 131], ["characters", 38]] as const) {
    test(`${route}: 상세 링크·새로고침·닫기`, async ({ page }) => {
      await page.goto(`/${route}?id=${id}`);
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
      await page.reload();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page).not.toHaveURL(/[?&]id=/);
      await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    });
  }

  test("맵 상세에서 브라우저 뒤로가기는 목록으로 돌아옴", async ({ page }) => {
    await page.goto("/maps");
    await page.getByRole("button").filter({ has: page.getByRole("heading", { name: "센터는 나야 나", exact: true }) }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.goBack();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/maps$/);
  });

  test("메뉴 바깥을 누르면 닫히고 배경 스크롤이 복원됨", async ({ page }) => {
    await page.goto("/");
    const menu = page.getByRole("button", { name: "메뉴", exact: true });
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await page.mouse.click(370, 805);
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await menu.click();
    await page.setViewportSize({ width: 1280, height: 812 });
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  for (const width of [320, 375, 768, 1024, 1280]) {
    test(`${width}px 헤더의 메뉴·검색·프로필이 화면 안에 들어옴`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      await page.goto("/");
      const controls = page.locator("header button:visible, header a:visible");
      for (const control of await controls.all()) {
        const box = await control.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        expect(box!.y + box!.height).toBeLessThanOrEqual(57);
      }
    });
  }
});
