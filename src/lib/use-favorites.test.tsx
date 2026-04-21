import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import "fake-indexeddb/auto";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFavorites } from "./use-favorites";
import { db } from "./db";

async function resetAll() {
  for (const r of await db.runners.getAll()) await db.runners.remove(r.id);
  for (const c of await db.costumes.getAll()) await db.costumes.remove(c.id);
  localStorage.clear();
}

describe("useFavorites", () => {
  beforeEach(async () => {
    await resetAll();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("초기 로드 후 ready=true 전환", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.runners).toEqual([]);
    expect(result.current.costumes).toEqual([]);
  });

  it("toggleRunner 로 추가/제거 + isRunnerFav O(1) 조회", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(async () => {
      await result.current.toggleRunner(42);
    });
    expect(result.current.isRunnerFav(42)).toBe(true);
    expect(result.current.runners).toHaveLength(1);

    await act(async () => {
      await result.current.toggleRunner(42);
    });
    expect(result.current.isRunnerFav(42)).toBe(false);
    expect(result.current.runners).toHaveLength(0);
  });

  it("toggleRunner 의 IDB put 실패 시 optimistic 추가를 롤백", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.ready).toBe(true));

    const putSpy = vi.spyOn(db.runners, "put").mockRejectedValueOnce(
      new Error("quota exceeded"),
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await act(async () => {
      await result.current.toggleRunner(7);
    });

    expect(putSpy).toHaveBeenCalled();
    expect(result.current.isRunnerFav(7)).toBe(false); // rolled back
    expect(warnSpy).toHaveBeenCalled();
  });

  it("toggleRunner 의 IDB remove 실패 시 optimistic 제거를 롤백", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.ready).toBe(true));

    // Seed one favorite successfully.
    await act(async () => {
      await result.current.toggleRunner(7);
    });
    expect(result.current.isRunnerFav(7)).toBe(true);

    const removeSpy = vi.spyOn(db.runners, "remove").mockRejectedValueOnce(
      new Error("transaction aborted"),
    );
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await act(async () => {
      await result.current.toggleRunner(7);
    });

    expect(removeSpy).toHaveBeenCalled();
    expect(result.current.isRunnerFav(7)).toBe(true); // restored
  });

  it("updateRunnerMemo / Tags 는 merge patch 로 기존 필드 보존", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(async () => {
      await result.current.toggleRunner(1);
    });
    await act(async () => {
      await result.current.updateRunnerMemo(1, "최애 캐릭터");
    });
    await act(async () => {
      await result.current.updateRunnerTags(1, ["fav", "main"]);
    });

    const r = result.current.getRunner(1);
    expect(r?.memo).toBe("최애 캐릭터");
    expect(r?.tags).toEqual(["fav", "main"]);
  });

  it("toggleCostume status 기본값은 wishlist, 명시하면 owned", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(async () => {
      await result.current.toggleCostume(1);
    });
    expect(result.current.getCostume(1)?.status).toBe("wishlist");

    await act(async () => {
      await result.current.toggleCostume(2, "owned");
    });
    expect(result.current.getCostume(2)?.status).toBe("owned");
  });

  it("updateCostumeStatus 로 owned ↔ wishlist 전환", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(async () => {
      await result.current.toggleCostume(1, "wishlist");
    });
    await act(async () => {
      await result.current.updateCostumeStatus(1, "owned");
    });
    expect(result.current.getCostume(1)?.status).toBe("owned");
  });

  it("toggleCostume IDB put 실패 시 롤백", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.ready).toBe(true));

    vi.spyOn(db.costumes, "put").mockRejectedValueOnce(new Error("fail"));
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await act(async () => {
      await result.current.toggleCostume(99);
    });
    expect(result.current.isCostumeFav(99)).toBe(false);
  });
});
