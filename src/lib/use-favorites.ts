"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { db, migrateFromLocalStorage } from "./db";
import type { RunnerEntry, CostumeEntry } from "./db";

interface FavoritesState {
  runners: RunnerEntry[];
  costumes: CostumeEntry[];
  ready: boolean;
}

const EMPTY: FavoritesState = { runners: [], costumes: [], ready: false };

// Generic array transforms — pure, used as setState updaters.
function withoutId<T extends { id: number }>(list: T[], id: number): T[] {
  return list.filter((e) => e.id !== id);
}

function withEntry<T extends { id: number }>(list: T[], entry: T): T[] {
  return list.some((e) => e.id === entry.id)
    ? list.map((e) => (e.id === entry.id ? entry : e))
    : [...list, entry];
}

export function useFavorites() {
  const [state, setState] = useState<FavoritesState>(EMPTY);

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
    return () => {
      cancelled = true;
    };
  }, []);

  // O(1) membership / lookup. Without these, every <RunnerCard /> in a 500-row
  // catalog calls .some()/.find() on every render, producing N×M scans.
  const runnerIndex = useMemo(() => {
    const map = new Map<number, RunnerEntry>();
    for (const r of state.runners) map.set(r.id, r);
    return map;
  }, [state.runners]);

  const costumeIndex = useMemo(() => {
    const map = new Map<number, CostumeEntry>();
    for (const c of state.costumes) map.set(c.id, c);
    return map;
  }, [state.costumes]);

  const toggleRunner = useCallback(
    async (id: number) => {
      const existing = runnerIndex.get(id);
      if (existing) {
        setState((prev) => ({ ...prev, runners: withoutId(prev.runners, id) }));
        await db.runners.remove(id);
        return;
      }
      const next: RunnerEntry = { id, addedAt: Date.now(), memo: "", tags: [] };
      setState((prev) => ({ ...prev, runners: withEntry(prev.runners, next) }));
      await db.runners.put(next);
    },
    [runnerIndex],
  );

  const updateRunner = useCallback(
    async (id: number, patch: Partial<RunnerEntry>) => {
      const existing = runnerIndex.get(id);
      if (!existing) return;
      const merged: RunnerEntry = { ...existing, ...patch };
      setState((prev) => ({ ...prev, runners: withEntry(prev.runners, merged) }));
      await db.runners.put(merged);
    },
    [runnerIndex],
  );

  const updateRunnerMemo = useCallback(
    (id: number, memo: string) => updateRunner(id, { memo }),
    [updateRunner],
  );
  const updateRunnerTags = useCallback(
    (id: number, tags: string[]) => updateRunner(id, { tags }),
    [updateRunner],
  );

  const toggleCostume = useCallback(
    async (id: number, status: "owned" | "wishlist" = "wishlist") => {
      const existing = costumeIndex.get(id);
      if (existing) {
        setState((prev) => ({ ...prev, costumes: withoutId(prev.costumes, id) }));
        await db.costumes.remove(id);
        return;
      }
      const next: CostumeEntry = { id, addedAt: Date.now(), memo: "", status };
      setState((prev) => ({ ...prev, costumes: withEntry(prev.costumes, next) }));
      await db.costumes.put(next);
    },
    [costumeIndex],
  );

  const updateCostume = useCallback(
    async (id: number, patch: Partial<CostumeEntry>) => {
      const existing = costumeIndex.get(id);
      if (!existing) return;
      const merged: CostumeEntry = { ...existing, ...patch };
      setState((prev) => ({ ...prev, costumes: withEntry(prev.costumes, merged) }));
      await db.costumes.put(merged);
    },
    [costumeIndex],
  );

  const updateCostumeStatus = useCallback(
    (id: number, status: "owned" | "wishlist") => updateCostume(id, { status }),
    [updateCostume],
  );
  const updateCostumeMemo = useCallback(
    (id: number, memo: string) => updateCostume(id, { memo }),
    [updateCostume],
  );

  const isRunnerFav = useCallback((id: number) => runnerIndex.has(id), [runnerIndex]);
  const isCostumeFav = useCallback((id: number) => costumeIndex.has(id), [costumeIndex]);
  const getRunner = useCallback((id: number) => runnerIndex.get(id), [runnerIndex]);
  const getCostume = useCallback((id: number) => costumeIndex.get(id), [costumeIndex]);

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
