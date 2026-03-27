"use client";

import { useState, useCallback, useEffect } from "react";
import { db, migrateFromLocalStorage } from "./db";
import type { RunnerEntry, CostumeEntry } from "./db";

interface FavoritesState {
  runners: RunnerEntry[];
  costumes: CostumeEntry[];
  ready: boolean;
}

const EMPTY: FavoritesState = { runners: [], costumes: [], ready: false };

export function useFavorites() {
  const [state, setState] = useState<FavoritesState>(EMPTY);

  // 초기 로드 + localStorage 마이그레이션
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await migrateFromLocalStorage();
      const [runners, costumes] = await Promise.all([
        db.runners.getAll(),
        db.costumes.getAll(),
      ]);
      if (!cancelled) setState({ runners, costumes, ready: true });
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleRunner = useCallback(async (id: number) => {
    const existing = await db.runners.get(id);
    if (existing) {
      await db.runners.remove(id);
    } else {
      await db.runners.put({ id, addedAt: Date.now(), memo: "", tags: [] });
    }
    const runners = await db.runners.getAll();
    setState((prev) => ({ ...prev, runners }));
  }, []);

  const updateRunnerMemo = useCallback(async (id: number, memo: string) => {
    const existing = await db.runners.get(id);
    if (existing) {
      await db.runners.put({ ...existing, memo });
      const runners = await db.runners.getAll();
      setState((prev) => ({ ...prev, runners }));
    }
  }, []);

  const updateRunnerTags = useCallback(async (id: number, tags: string[]) => {
    const existing = await db.runners.get(id);
    if (existing) {
      await db.runners.put({ ...existing, tags });
      const runners = await db.runners.getAll();
      setState((prev) => ({ ...prev, runners }));
    }
  }, []);

  const toggleCostume = useCallback(async (id: number, status: "owned" | "wishlist" = "wishlist") => {
    const existing = await db.costumes.get(id);
    if (existing) {
      await db.costumes.remove(id);
    } else {
      await db.costumes.put({ id, addedAt: Date.now(), memo: "", status });
    }
    const costumes = await db.costumes.getAll();
    setState((prev) => ({ ...prev, costumes }));
  }, []);

  const updateCostumeStatus = useCallback(async (id: number, status: "owned" | "wishlist") => {
    const existing = await db.costumes.get(id);
    if (existing) {
      await db.costumes.put({ ...existing, status });
      const costumes = await db.costumes.getAll();
      setState((prev) => ({ ...prev, costumes }));
    }
  }, []);

  const updateCostumeMemo = useCallback(async (id: number, memo: string) => {
    const existing = await db.costumes.get(id);
    if (existing) {
      await db.costumes.put({ ...existing, memo });
      const costumes = await db.costumes.getAll();
      setState((prev) => ({ ...prev, costumes }));
    }
  }, []);

  const isRunnerFav = useCallback(
    (id: number) => state.runners.some((r) => r.id === id),
    [state.runners],
  );

  const isCostumeFav = useCallback(
    (id: number) => state.costumes.some((c) => c.id === id),
    [state.costumes],
  );

  const getRunner = useCallback(
    (id: number) => state.runners.find((r) => r.id === id),
    [state.runners],
  );

  const getCostume = useCallback(
    (id: number) => state.costumes.find((c) => c.id === id),
    [state.costumes],
  );

  return {
    ready: state.ready,
    runners: state.runners,
    costumes: state.costumes,
    toggleRunner,
    toggleCostume,
    updateRunnerMemo,
    updateRunnerTags,
    updateCostumeStatus,
    updateCostumeMemo,
    isRunnerFav,
    isCostumeFav,
    getRunner,
    getCostume,
  };
}
