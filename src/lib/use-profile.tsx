"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { db } from "./db";
import type { ProfileEntry } from "./db";

interface ProfileCtx {
  profile: ProfileEntry | null;
  ready: boolean;
  save: (patch: Partial<Omit<ProfileEntry, "id">>) => Promise<void>;
  clear: () => Promise<void>;
}

const Ctx = createContext<ProfileCtx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileEntry | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    db.profile.get().then((p) => {
      if (!cancelled) {
        setProfile(p ?? null);
        setReady(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const save = useCallback(async (patch: Partial<Omit<ProfileEntry, "id">>) => {
    setProfile((prev) => {
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
      db.profile.put(next);
      return next;
    });
  }, []);

  const clear = useCallback(async () => {
    await db.profile.remove();
    setProfile(null);
  }, []);

  return (
    <Ctx value={{ profile, ready, save, clear }}>
      {children}
    </Ctx>
  );
}

export function useProfile(): ProfileCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
