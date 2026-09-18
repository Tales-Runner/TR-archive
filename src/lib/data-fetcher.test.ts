// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { collectData, normalizeProbItems } from "../../scripts/fetch-data";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("does not invent a zero probability when the upstream field is missing", () => {
  expect(() => normalizeProbItems([{ itemNm: "변경권", itemList: [{ resultItemNm: "아이템" }] }])).toThrow("Missing or invalid probability");
});

it.each(["http", "missing-detail"])("rejects an incomplete detail response (%s)", async (failure) => {
  vi.spyOn(globalThis, "setTimeout").mockImplementation(((fn: () => void) => { fn(); return 0; }) as typeof setTimeout);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  const fetch = vi.fn(async (url: string) => {
    if (url.endsWith("/character/all")) return { ok: true, json: async () => ({ resCd: "0000", result: { list: [1, 2].map(id => ({ id })) } }) };
    if (url.endsWith("/character/1")) return { ok: true, json: async () => ({ resCd: "0000", result: { info: { id: 1 } } }) };
    if (failure === "missing-detail") return { ok: true, json: async () => ({ resCd: "0000", result: {} }) };
    return { ok: false, status: 503, statusText: "unavailable" };
  });
  vi.stubGlobal("fetch", fetch);
  await expect(collectData()).rejects.toThrow(failure === "http" ? "HTTP 503" : "Missing character detail");
  expect(fetch.mock.calls.filter(([url]) => url.endsWith("/character/2"))).toHaveLength(failure === "http" ? 3 : 1);
});
