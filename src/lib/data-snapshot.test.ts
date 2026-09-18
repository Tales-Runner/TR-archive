// @vitest-environment node
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { applySnapshot, readSnapshot, validateSnapshot, writeSnapshot } from "../../scripts/data-snapshot";

vi.mock("node:fs", async importOriginal => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, renameSync: vi.fn(actual.renameSync) };
});

const baseline = readSnapshot(process.cwd());
const dirs: string[] = [];
const clone = () => structuredClone(baseline);
afterEach(() => {
  vi.restoreAllMocks();
  dirs.splice(0).forEach(dir => rmSync(dir, { recursive: true, force: true }));
});
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "tr-snapshot-"));
  dirs.push(dir);
  const root = join(dir, "checkout");
  writeSnapshot(root, clone());
  return root;
}

it("validates the committed snapshot, then applies a complete candidate", () => {
  const root = fixture();
  const candidate = clone();
  const characters = candidate.get("src/data/characters.json") as { characterNm: string }[];
  characters[0].characterNm = "검증용 이름";
  applySnapshot(root, candidate);
  expect(readSnapshot(root)).toEqual(candidate);
});

it.each(["missing", "duplicate", "count-drop", "probability", "category-loss", "unsafe-path", "schema", "removed-motion"])("rejects %s before changing any tracked data", (failure) => {
  const root = fixture();
  const before = readSnapshot(root);
  const candidate = clone();
  const characters = candidate.get("src/data/characters.json") as Record<string, unknown>[];
  if (failure === "missing") candidate.delete("src/data/guides.json");
  if (failure === "duplicate") characters[1].id = characters[0].id;
  if (failure === "count-drop") characters.splice(5);
  if (failure === "probability") candidate.set("public/data/probability/trading-position.json", []);
  if (failure === "category-loss") {
    (candidate.get("src/data/probability-meta.json") as unknown[]).pop();
    candidate.delete("public/data/probability/selectshop.json");
  }
  if (failure === "unsafe-path") candidate.set("../../outside.json", []);
  if (failure === "schema") characters[0].characterNm = null;
  if (failure === "removed-motion") delete characters[0].hurdleMotion;
  expect(() => applySnapshot(root, candidate)).toThrow();
  expect(readSnapshot(root)).toEqual(before);
});

it("rejects a reused candidate directory rather than mixing different runs", () => {
  const root = fixture();
  const original = readFileSync(join(root, "src/data/characters.json"));
  expect(() => writeSnapshot(root, clone())).toThrow("already exists");
  expect(readFileSync(join(root, "src/data/characters.json"))).toEqual(original);
});

it("checks probability values as well as item counts", () => {
  const candidate = clone();
  const items = candidate.get("public/data/probability/trading-position.json") as { itemList: { probability: number }[] }[];
  items[0].itemList[0].probability = Number.NaN;
  expect(() => validateSnapshot(candidate)).toThrow("probability must");
});

it("restores earlier files when publication fails midway", async () => {
  const root = fixture();
  const candidate = clone();
  (candidate.get("src/data/characters.json") as { characterNm: string }[])[0].characterNm = "미반영 이름";
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  vi.mocked(fs.renameSync).mockImplementationOnce(actual.renameSync).mockImplementationOnce(() => { throw new Error("disk failure"); });
  expect(() => applySnapshot(root, candidate)).toThrow("disk failure");
  expect(readSnapshot(root)).toEqual(baseline);
  expect(fs.readdirSync(root, { recursive: true }).some(file => String(file).endsWith(".tmp"))).toBe(false);
});
