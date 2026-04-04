"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProfile } from "@/lib/use-profile";
import { useFavorites } from "@/lib/use-favorites";
import { db } from "@/lib/db";
import type { RunnerEntry, CostumeEntry, StoryEntry, MapEntry } from "@/lib/db";
import { useToast } from "@/components/toast";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/format";
import { getLevelRank } from "@/lib/constants";
import type { Character, CostumeItem, StoryItem, MapItem } from "@/lib/types";

// ── Avatar Picker ────────────────────────────────────

function AvatarPicker({
  characters,
  selectedId,
  onSelect,
}: {
  characters: Character[];
  selectedId: number | null;
  onSelect: (id: number, url: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-1">
      {characters.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id, c.circularImageUrl)}
          className={`relative rounded-full overflow-hidden ring-2 transition-all ${
            selectedId === c.id
              ? "ring-teal-400 scale-110"
              : "ring-transparent hover:ring-white/20"
          }`}
          title={c.characterNm}
        >
          <Image
            src={c.circularImageUrl}
            alt={c.characterNm}
            width={44}
            height={44}
            className="rounded-full"
          />
        </button>
      ))}
    </div>
  );
}

// ── Level Badge ──────────────────────────────────────

function LevelBadge({ level }: { level: number }) {
  const { rank, color, hex } = getLevelRank(level);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: `${hex}20`, color: hex }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: hex }}
      />
      Lv.{level} {color} {rank}
    </span>
  );
}

// ── Profile Card ─────────────────────────────────────

function ProfileSection({
  characters,
}: {
  characters: Character[];
}) {
  const { profile, ready, save } = useProfile();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [charId, setCharId] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [level, setLevel] = useState("");
  const toast = useToast();

  function startEdit() {
    setNickname(profile?.nickname ?? "");
    setCharId(profile?.characterId ?? null);
    setAvatarUrl(profile?.avatarUrl ?? "");
    setLevel(profile?.level ? String(profile.level) : "");
    setEditing(true);
  }

  async function handleSave() {
    if (!nickname.trim()) {
      toast("닉네임을 입력해 주세요");
      return;
    }
    const lvl = level.trim() ? Math.min(126, Math.max(1, parseInt(level))) : null;
    await save({
      nickname: nickname.trim(),
      avatarUrl,
      characterId: charId,
      level: isNaN(lvl as number) ? null : lvl,
    });
    setEditing(false);
    toast("프로필이 저장되었습니다");
  }

  if (!ready) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full skeleton" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-32 skeleton" />
            <div className="h-3 w-48 skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-card p-6 animate-fade-in space-y-4">
        <h2 className="text-lg font-bold text-white/90">프로필 수정</h2>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            placeholder="인게임 닉네임..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">레벨 (1~126)</label>
          <input
            type="number"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            min={1}
            max={126}
            placeholder="현재 레벨..."
            className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50"
          />
          {level && parseInt(level) >= 1 && parseInt(level) <= 126 && (
            <div className="mt-1.5">
              <LevelBadge level={parseInt(level)} />
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">프로필 캐릭터</label>
          <AvatarPicker
            characters={characters}
            selectedId={charId}
            onSelect={(id, url) => { setCharId(id); setAvatarUrl(url); }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 transition-colors"
          >
            저장
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/40 hover:bg-white/10 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-surface-card p-8 text-center animate-fade-in">
        <div className="text-3xl opacity-20 mb-3">?</div>
        <p className="text-sm text-white/40 mb-4">아직 프로필이 없습니다</p>
        <button
          onClick={startEdit}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 transition-colors"
        >
          프로필 만들기
        </button>
      </div>
    );
  }

  const createdDate = new Date(profile.createdAt);
  const dateStr = `${createdDate.getFullYear()}.${String(createdDate.getMonth() + 1).padStart(2, "0")}.${String(createdDate.getDate()).padStart(2, "0")}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-card p-6 animate-fade-in">
      <div className="flex items-center gap-4">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt=""
            width={64}
            height={64}
            className="rounded-full ring-2 ring-teal-500/30"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-2xl text-white/20">
            ?
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white/90 truncate">
            {profile.nickname}
          </h2>
          {profile.level && <LevelBadge level={profile.level} />}
          <p className="text-xs text-white/40 mt-1">
            {dateStr}부터 기록 중
          </p>
        </div>
        <button
          onClick={startEdit}
          className="shrink-0 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
        >
          수정
        </button>
      </div>
    </div>
  );
}

// ── Activity Dashboard ───────────────────────────────

function ActivityDashboard({
  totalStories,
  totalMaps,
}: {
  totalStories: number;
  totalMaps: number;
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-surface-card p-4 h-20 skeleton" />
        ))}
      </div>
    );
  }

  const readStories = storyEntries.filter((s) => s.readAt > 0);
  const clearedMaps = mapEntries.filter((m) => m.clearedAt);
  const ownedCostumes = favs.costumes.filter((c) => c.status === "owned");
  const wishlistCostumes = favs.costumes.filter((c) => c.status === "wishlist");

  const cards = [
    {
      label: "읽은 스토리",
      value: readStories.length,
      total: totalStories,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      href: "/stories",
    },
    {
      label: "기록한 맵",
      value: clearedMaps.length,
      total: totalMaps,
      color: "text-red-400",
      bg: "bg-red-500/10",
      href: "/maps",
    },
    {
      label: "보유 코스튬",
      value: ownedCostumes.length,
      sub: wishlistCostumes.length > 0 ? `위시 ${wishlistCostumes.length}` : undefined,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      href: "/closet",
    },
    {
      label: "즐겨찾기 런너",
      value: favs.runners.length,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      href: "/characters",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-grid">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className={`rounded-xl border border-white/5 ${card.bg} p-4 hover:border-white/10 transition-colors card-hover`}
        >
          <p className="text-[11px] text-white/40 mb-1">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color}`}>
            {card.value}
            {"total" in card && card.total && (
              <span className="text-sm font-normal text-white/20">
                /{card.total}
              </span>
            )}
          </p>
          {card.sub && (
            <p className="text-[10px] text-white/30 mt-0.5">{card.sub}</p>
          )}
        </Link>
      ))}
    </div>
  );
}

// ── Favorites Section ────────────────────────────────

type FavTab = "runners" | "costumes" | "stories" | "maps";

function FavoritesSection({
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
  const [tab, setTab] = useState<FavTab>("runners");
  const [storyEntries, setStoryEntries] = useState<StoryEntry[]>([]);
  const [mapEntries, setMapEntries] = useState<MapEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([db.stories.getAll(), db.maps.getAll()]).then(
      ([s, m]) => { setStoryEntries(s); setMapEntries(m); setLoaded(true); },
    );
  }, []);

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
    setStoryEntries((prev) => prev.filter((s) => s.id !== id));
    toast("읽음 기록을 삭제했습니다");
  }, [toast]);

  const removeMapRecord = useCallback(async (id: number) => {
    await db.maps.remove(id);
    setMapEntries((prev) => prev.filter((m) => m.id !== id));
    toast("맵 기록을 삭제했습니다");
  }, [toast]);

  if (!favs.ready || !loaded) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-card p-6">
        <div className="h-5 w-24 skeleton mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 skeleton" />
          ))}
        </div>
      </div>
    );
  }

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

          {/* Runners */}
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Costumes */}
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
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Stories */}
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
                          {new Date(entry.readAt).toLocaleDateString("ko-KR")}에 읽음
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Maps */}
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
                            {new Date(entry.clearedAt).toLocaleDateString("ko-KR")}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeMapRecord(entry.id)}
                      className="shrink-0 rounded-lg p-1.5 text-white/20 hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="기록 삭제"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
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

// ── Data Management ──────────────────────────────────

function DataSection() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    const data = await db.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elims-archive-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("백업 파일을 다운로드했습니다");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await db.importAll(data);
      toast("데이터를 복원했습니다. 새로고침해 주세요.");
    } catch {
      toast("올바른 백업 파일이 아닙니다");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-card p-6 animate-fade-in">
      <h2 className="text-lg font-bold text-white/90 mb-1">데이터 관리</h2>
      <p className="text-xs text-white/40 mb-4">
        프로필과 모든 기록을 JSON으로 백업하거나 복원할 수 있습니다
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 transition-colors"
        >
          내보내기
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 transition-colors"
        >
          가져오기
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────

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
      <ActivityDashboard totalStories={stories.length} totalMaps={maps.length} />
      <FavoritesSection
        characters={characters}
        costumes={costumes}
        stories={stories}
        maps={maps}
      />
      <DataSection />
    </div>
  );
}
