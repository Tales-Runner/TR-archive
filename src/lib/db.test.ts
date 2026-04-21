import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";

// Import fresh each time — db.ts memoizes the connection in a module-level
// Promise, which we reset by resetting modules between suites if needed.
import { db, migrateFromLocalStorage } from "./db";
import type {
  RunnerEntry,
  CostumeEntry,
  StoryEntry,
  MapEntry,
  ProfileEntry,
} from "./db";

async function clearAll() {
  for (const r of await db.runners.getAll()) await db.runners.remove(r.id);
  for (const c of await db.costumes.getAll()) await db.costumes.remove(c.id);
  for (const s of await db.stories.getAll()) await db.stories.remove(s.id);
  for (const m of await db.maps.getAll()) await db.maps.remove(m.id);
  await db.profile.remove();
}

describe("db.runners", () => {
  beforeEach(async () => {
    await clearAll();
  });

  it("put → getAll round-trip 로 entry 복구", async () => {
    const entry: RunnerEntry = {
      id: 42,
      addedAt: 1700000000000,
      memo: "최애",
      tags: ["fav", "speed"],
    };
    await db.runners.put(entry);
    const all = await db.runners.getAll();
    expect(all).toEqual([entry]);
  });

  it("get(id) 는 존재하면 entry, 없으면 undefined", async () => {
    await db.runners.put({ id: 1, addedAt: 0, memo: "", tags: [] });
    expect((await db.runners.get(1))?.id).toBe(1);
    expect(await db.runners.get(999)).toBeUndefined();
  });

  it("remove 후 getAll 에서 제거됨", async () => {
    await db.runners.put({ id: 1, addedAt: 0, memo: "", tags: [] });
    await db.runners.put({ id: 2, addedAt: 0, memo: "", tags: [] });
    await db.runners.remove(1);
    const all = await db.runners.getAll();
    expect(all.map((r) => r.id).sort()).toEqual([2]);
  });
});

describe("db.costumes", () => {
  beforeEach(async () => {
    await clearAll();
  });

  it("status 필드 보존", async () => {
    const a: CostumeEntry = { id: 1, addedAt: 0, memo: "", status: "owned" };
    const b: CostumeEntry = { id: 2, addedAt: 0, memo: "", status: "wishlist" };
    await db.costumes.put(a);
    await db.costumes.put(b);
    const all = (await db.costumes.getAll()).sort((x, y) => x.id - y.id);
    expect(all.map((c) => c.status)).toEqual(["owned", "wishlist"]);
  });
});

describe("db.stories", () => {
  beforeEach(async () => {
    await clearAll();
  });

  it("optional scrollProgress 저장/복원", async () => {
    const entry: StoryEntry = { id: 1, readAt: 123, scrollProgress: 0.42 };
    await db.stories.put(entry);
    expect((await db.stories.get(1))?.scrollProgress).toBeCloseTo(0.42);
  });
});

describe("db.maps", () => {
  beforeEach(async () => {
    await clearAll();
  });

  it("clearedAt=null 도 유지", async () => {
    const entry: MapEntry = { id: 7, clearedAt: null, personalBest: "" };
    await db.maps.put(entry);
    expect((await db.maps.get(7))?.clearedAt).toBeNull();
  });
});

describe("db.profile", () => {
  beforeEach(async () => {
    await clearAll();
  });

  it("싱글톤 id='me' 로 upsert", async () => {
    const entry: ProfileEntry = {
      id: "me",
      nickname: "테스터",
      avatarUrl: "",
      characterId: null,
      level: 10,
      createdAt: 0,
      updatedAt: 0,
    };
    await db.profile.put(entry);
    const got = await db.profile.get();
    expect(got?.nickname).toBe("테스터");
    await db.profile.remove();
    expect(await db.profile.get()).toBeUndefined();
  });
});

describe("exportAll + importAll", () => {
  beforeEach(async () => {
    await clearAll();
  });

  it("round-trip 으로 5개 스토어 전부 복원", async () => {
    await db.runners.put({ id: 1, addedAt: 100, memo: "r1", tags: ["x"] });
    await db.costumes.put({ id: 2, addedAt: 100, memo: "c1", status: "owned" });
    await db.stories.put({ id: 3, readAt: 100 });
    await db.maps.put({ id: 4, clearedAt: 100, personalBest: "1:23.45" });
    await db.profile.put({
      id: "me",
      nickname: "N",
      avatarUrl: "",
      characterId: null,
      level: 50,
      createdAt: 0,
      updatedAt: 0,
    });

    const snap = await db.exportAll();
    expect(snap.exportedAt).toBeTypeOf("number");

    await clearAll();
    await db.importAll(snap);

    expect((await db.runners.getAll())[0].memo).toBe("r1");
    expect((await db.costumes.getAll())[0].status).toBe("owned");
    expect((await db.stories.getAll())[0].readAt).toBe(100);
    expect((await db.maps.getAll())[0].personalBest).toBe("1:23.45");
    expect((await db.profile.get())?.nickname).toBe("N");
  });

  it("profile 이 없는 import 는 나머지만 복원", async () => {
    await db.importAll({
      runners: [{ id: 10, addedAt: 0, memo: "", tags: [] }],
    });
    expect(await db.runners.getAll()).toHaveLength(1);
    expect(await db.profile.get()).toBeUndefined();
  });
});

describe("migrateFromLocalStorage", () => {
  beforeEach(async () => {
    await clearAll();
    localStorage.clear();
  });

  it("레거시 favorites 키를 IDB runners/costumes 로 이관 후 삭제", async () => {
    localStorage.setItem(
      "elims-favorites",
      JSON.stringify({ runners: [1, 2, 3], costumes: [10, 20] }),
    );
    await migrateFromLocalStorage();
    const r = await db.runners.getAll();
    const c = await db.costumes.getAll();
    expect(r.map((x) => x.id).sort()).toEqual([1, 2, 3]);
    expect(c.map((x) => x.id).sort()).toEqual([10, 20]);
    expect(c.every((x) => x.status === "wishlist")).toBe(true);
    expect(localStorage.getItem("elims-favorites")).toBeNull();
  });

  it("키 없으면 no-op", async () => {
    await migrateFromLocalStorage();
    expect(await db.runners.getAll()).toEqual([]);
  });

  it("손상된 JSON 도 silent fallback (throw 안 함)", async () => {
    localStorage.setItem("elims-favorites", "{{{not-json");
    await expect(migrateFromLocalStorage()).resolves.toBeUndefined();
  });

  it("number 가 아닌 id 는 건너뜀", async () => {
    localStorage.setItem(
      "elims-favorites",
      JSON.stringify({ runners: [1, "string", null, 2] }),
    );
    await migrateFromLocalStorage();
    const r = await db.runners.getAll();
    expect(r.map((x) => x.id).sort()).toEqual([1, 2]);
  });
});
