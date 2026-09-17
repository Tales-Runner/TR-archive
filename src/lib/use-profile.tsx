"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { db } from "./db";
import type { ProfileEntry } from "./db";

interface ProfileCtx {
  profile: ProfileEntry | null;
  ready: boolean;
  loadError: boolean;
  save: (patch: Partial<Omit<ProfileEntry, "id">>) => Promise<void>;
  clear: () => Promise<void>;
}

const Ctx = createContext<ProfileCtx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileEntry | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    db.profile.get().then((p) => {
      if (!cancelled) {
        setProfile(p ?? null);
      }
    }).catch(() => {
      if (!cancelled) setLoadError(true);
    }).finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const save = useCallback(async (patch: Partial<Omit<ProfileEntry, "id">>) => {
    const prev = profile;
    const now = Date.now();
    const next: ProfileEntry = {
      id: "me",
      nickname: patch.nickname ?? prev?.nickname ?? "",
      avatarUrl: patch.avatarUrl ?? prev?.avatarUrl ?? "",
      characterId: patch.characterId !== undefined ? patch.characterId : (prev?.characterId ?? null),
      level: patch.level !== undefined ? patch.level : (prev?.level ?? null),
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    };
    await db.profile.put(next);
    setProfile(next);
  }, [profile]);

  const clear = useCallback(async () => {
    await db.profile.remove();
    setProfile(null);
  }, []);

  return (
    <Ctx value={{ profile, ready, loadError, save, clear }}>
      {children}
    </Ctx>
  );
}

export function useProfile(): ProfileCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
