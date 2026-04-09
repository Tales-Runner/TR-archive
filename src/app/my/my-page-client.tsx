"use client";

import { useState, useEffect } from "react";
import { useFavorites } from "@/lib/use-favorites";
import { db } from "@/lib/db";
import type { StoryEntry, MapEntry } from "@/lib/db";
import type { Character, CostumeItem, StoryItem, MapItem } from "@/lib/types";
import { ProfileSection } from "./profile-section";
import { ActivityDashboard } from "./activity-dashboard";
import { FavoritesSection } from "./favorites-section";
import { DataSection } from "./data-section";

export function MyPageClient({
  characters,
  costumes,
  stories,
  maps,
}: {
  characters: Character[];
  costumes: CostumeItem[];
  stories: StoryItem[];
  maps: MapItem[];
}) {
  const favs = useFavorites();
  const [storyEntries, setStoryEntries] = useState<StoryEntry[]>([]);
  const [mapEntries, setMapEntries] = useState<MapEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([db.stories.getAll(), db.maps.getAll()]).then(
      ([s, m]) => { setStoryEntries(s); setMapEntries(m); setLoaded(true); },
    );
  }, []);

  if (!loaded || !favs.ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-accent-light">마이페이지</h1>
          <p className="text-sm text-white/40">내 프로필, 기록, 즐겨찾기를 한곳에서 관리합니다</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full skeleton" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 skeleton" />
              <div className="h-3 w-48 skeleton" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-surface-card p-4 h-20 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-accent-light">
          마이페이지
        </h1>
        <p className="text-sm text-white/40">
          내 프로필, 기록, 즐겨찾기를 한곳에서 관리합니다
        </p>
      </div>
      <ProfileSection characters={characters} />
      <ActivityDashboard
        totalStories={stories.length}
        totalMaps={maps.length}
        storyEntries={storyEntries}
        mapEntries={mapEntries}
        favs={favs}
      />
      <FavoritesSection
        characters={characters}
        costumes={costumes}
        stories={stories}
        maps={maps}
        storyEntries={storyEntries}
        mapEntries={mapEntries}
        onStoryEntriesChange={setStoryEntries}
        onMapEntriesChange={setMapEntries}
        favs={favs}
      />
      <DataSection />
    </div>
  );
}
