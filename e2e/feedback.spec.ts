import { test, expect } from "@playwright/test";

/**
 * Server-action 을 실제로 호출하지 않고 (GITHUB_TOKEN 필요), 클라이언트
 * 측 검증 동작만 점검. "제목 2자 이상" 같은 최소길이 규칙은 서버에서
 * 강제되지만 UX 를 보장하기 위해 폼 자체는 필수 필드 구조를 유지해야 함.
 */
test.describe("feedback form", () => {
  test("카테고리 / 제목 / 본문 필드 렌더링", async ({ page }) => {
    await page.goto("/feedback");

    await expect(page.getByText(/분류|카테고리/).first()).toBeVisible();
    await expect(page.getByLabel(/제목/)).toBeVisible();
    await expect(page.getByLabel(/내용|본문/)).toBeVisible();
  });
});
