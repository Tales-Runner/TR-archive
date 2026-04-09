"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "@/lib/use-favorites";
import { db } from "@/lib/db";
import type { RunnerEntry, CostumeEntry, StoryEntry, MapEntry } from "@/lib/db";
import { useToast } from "@/components/toast";
import { EmptyState } from "@/components/empty-state";
import { HeartIcon, XIcon } from "@/components/icons";
import { formatDate, formatIsoDate } from "@/lib/format";
import type { Character, CostumeItem, StoryItem, MapItem } from "@/lib/types";

type FavTab = "runners" | "costumes" | "stories" | "maps";

export function FavoritesSection({
  characters,
  costumes,
  stories,
  maps,
  storyEntries,
  mapEntries,
  onStoryEntriesChange,
  onMapEntriesChange,
  favs,
}: {
  characters: Character[];
  costumes: CostumeItem[];
  stories: StoryItem[];
  maps: MapItem[];
  storyEntries: StoryEntry[];
  mapEntries: MapEntry[];
  onStoryEntriesChange: (fn: (prev: StoryEntry[]) => StoryEntry[]) => void;
  onMapEntriesChange: (fn: (prev: MapEntry[]) => MapEntry[]) => void;
  favs: ReturnType<typeof useFavorites>;
}) {
  const [tab, setTab] = useState<FavTab>("runners");
  const toast = useToast();

  const charMap = useMemo(
    () => new Map(characters.map((c) => [c.id, c])),
    [characters],
  );
  const costumeMap = useMemo(
    () => new Map(costumes.map((c) => [c.id, c])),
    [costumes],
  );
  const storyMap = useMemo(
    () => new Map(stories.map((s) => [s.id, s])),
    [stories],
  );
  const mapMap = useMemo(
    () => new Map(maps.map((m) => [m.id, m])),
    [maps],
  );

  const favRunners = useMemo(
    () =>
      favs.runners
        .map((f) => ({ entry: f, char: charMap.get(f.id) }))
        .filter((x): x is { entry: RunnerEntry; char: Character } => !!x.char),
    [favs.runners, charMap],
  );

  const favCostumes = useMemo(
    () =>
      favs.costumes
        .map((f) => ({ entry: f, costume: costumeMap.get(f.id) }))
        .filter((x): x is { entry: CostumeEntry; costume: CostumeItem } => !!x.costume),
    [favs.costumes, costumeMap],
  );

  const readStories = useMemo(
    () =>
      storyEntries
        .filter((s) => s.readAt > 0)
        .sort((a, b) => b.readAt - a.readAt)
        .map((entry) => ({ entry, story: storyMap.get(entry.id) }))
        .filter((x): x is { entry: StoryEntry; story: StoryItem } => !!x.story),
    [storyEntries, storyMap],
  );

  const mapRecords = useMemo(
    () =>
      mapEntries
        .filter((m) => m.personalBest)
        .sort((a, b) => (b.clearedAt ?? 0) - (a.clearedAt ?? 0))
        .map((entry) => ({ entry, map: mapMap.get(entry.id) }))
        .filter((x): x is { entry: MapEntry; map: MapItem } => !!x.map),
    [mapEntries, mapMap],
  );

  const removeStory = useCallback(async (id: number) => {
    await db.stories.remove(id);
    onStoryEntriesChange((prev) => prev.filter((s) => s.id !== id));
    toast("읽음 기록을 삭제했습니다");
  }, [toast, onStoryEntriesChange]);

  const removeMapRecord = useCallback(async (id: number) => {
    await db.maps.remove(id);
    onMapEntriesChange((prev) => prev.filter((m) => m.id !== id));
    toast("맵 기록을 삭제했습니다");
  }, [toast, onMapEntriesChange]);

  const tabs: { key: FavTab; label: string; count: number }[] = [
    { key: "runners", label: "런너", count: favRunners.length },
    { key: "costumes", label: "코스튬", count: favCostumes.length },
    { key: "stories", label: "스토리", count: readStories.length },
    { key: "maps", label: "맵 기록", count: mapRecords.length },
  ];

  const totalCount = tabs.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-white/90">내 기록</h2>
        <span className="text-xs text-white/40">{totalCount}개</span>
      </div>

      {totalCount === 0 ? (
        <EmptyState message="아직 기록이 없습니다" />
      ) : (
        <>
          <div className="flex rounded-lg border border-white/10 overflow-hidden text-sm mb-4 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`shrink-0 px-3 py-1.5 transition-colors ${
                  tab === t.key
                    ? "bg-teal-600 text-white font-medium"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          {tab === "runners" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-grid">
              {favRunners.length === 0 ? (
                <EmptyState message="즐겨찾기한 런너가 없습니다" />
              ) : (
                favRunners.map(({ entry, char }) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <Link href="/characters" className="shrink-0">
                      <Image
                        src={char.circularImageUrl}
                        alt={char.characterNm}
                        width={40}
                        height={40}
                        className="rounded-full ring-1 ring-white/10"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate">
                        {char.characterNm}
                      </p>
                      <p className="text-[11px] text-white/40 truncate">
                        {char.catchPhrase}
                      </p>
                      {entry.memo && (
                        <p className="text-[10px] text-teal-400/60 truncate mt-0.5">
                          {entry.memo}
                        </p>
                      )}
                      {entry.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {entry.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-white/30"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => { favs.toggleRunner(entry.id); toast(`${char.characterNm} 즐겨찾기 해제`); }}
                      className="shrink-0 rounded-lg p-1.5 text-white/20 hover:text-pink-400 hover:bg-white/5 transition-colors"
                      title="즐겨찾기 해제"
                    >
                      <HeartIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "costumes" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 stagger-grid">
              {favCostumes.length === 0 ? (
                <EmptyState message="즐겨찾기한 코스튬이 없습니다" />
              ) : (
                favCostumes.map(({ entry, costume }) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden group relative"
                  >
                    <Link href="/closet">
                      <div className="relative aspect-[4/3] bg-white/5">
                        <Image
                          src={costume.thumbnail}
                          alt={costume.subject}
                          fill
                          sizes="(max-width: 640px) 50vw, 33vw"
                          className="object-cover"
                        />
                        <span
                          className={`absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                            entry.status === "owned"
                              ? "bg-teal-600/80 text-white"
                              : "bg-amber-600/80 text-white"
                          }`}
                        >
                          {entry.status === "owned" ? "보유" : "위시"}
                        </span>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-white/70 truncate">
                          {costume.subject}
                        </p>
                        <p className="text-[10px] text-white/30">
                          {formatDate(costume.openDt)}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => { favs.toggleCostume(entry.id); toast(`${costume.subject} 즐겨찾기 해제`); }}
                      className="absolute top-1.5 right-1.5 rounded-full bg-black/50 p-1 text-white/30 hover:text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="즐겨찾기 해제"
                    >
                      <HeartIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "stories" && (
            <div className="space-y-2 stagger-grid">
              {readStories.length === 0 ? (
                <EmptyState message="아직 읽은 스토리가 없습니다" />
              ) : (
                readStories.map(({ entry, story }) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <Link
                      href={`/stories?story=${story.id}`}
                      className="shrink-0 relative w-12 h-12 rounded-lg overflow-hidden bg-white/5"
                    >
                      <Image
                        src={story.thumbnail}
                        alt={story.subject}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/stories?story=${story.id}`}
                        className="text-sm font-medium text-white/80 truncate block hover:text-white/90"
                      >
                        {story.subject}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/30">
                          {formatIsoDate(entry.readAt)}에 읽음
                        </span>
                        {typeof entry.scrollProgress === "number" && entry.scrollProgress > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="h-1 w-12 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500/60"
                                style={{ width: `${Math.round(entry.scrollProgress * 100)}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-white/25">
                              {Math.round(entry.scrollProgress * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeStory(entry.id)}
                      className="shrink-0 rounded-lg p-1.5 text-white/20 hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="읽음 기록 삭제"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "maps" && (
            <div className="space-y-2 stagger-grid">
              {mapRecords.length === 0 ? (
                <EmptyState message="아직 기록한 맵이 없습니다" />
              ) : (
                mapRecords.map(({ entry, map }) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <Link
                      href="/maps"
                      className="shrink-0 relative w-12 h-12 rounded-lg overflow-hidden bg-white/5"
                    >
                      {map.thumbnail ? (
                        <Image
                          src={map.thumbnail}
                          alt={map.subject}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10 text-lg">
                          M
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href="/maps"
                        className="text-sm font-medium text-white/80 truncate block hover:text-white/90"
                      >
                        {map.subject}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-amber-400/70 font-mono">
                          {entry.personalBest}
                        </span>
                        {entry.clearedAt && (
                          <span className="text-[10px] text-white/25">
                            {formatIsoDate(entry.clearedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeMapRecord(entry.id)}
                      className="shrink-0 rounded-lg p-1.5 text-white/20 hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="기록 삭제"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
