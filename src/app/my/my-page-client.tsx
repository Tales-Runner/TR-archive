"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProfile } from "@/lib/use-profile";
import { useFavorites } from "@/lib/use-favorites";
import { db } from "@/lib/db";
import type { RunnerEntry, CostumeEntry } from "@/lib/db";
import { useToast } from "@/components/toast";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/format";
import type { Character, CostumeItem } from "@/lib/types";

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
  const toast = useToast();

  function startEdit() {
    setNickname(profile?.nickname ?? "");
    setCharId(profile?.characterId ?? null);
    setAvatarUrl(profile?.avatarUrl ?? "");
    setEditing(true);
  }

  async function handleSave() {
    if (!nickname.trim()) {
      toast("닉네임을 입력해 주세요");
      return;
    }
    await save({ nickname: nickname.trim(), avatarUrl, characterId: charId });
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
          <p className="text-xs text-white/40">
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

// ── Favorites Section ────────────────────────────────

function FavoritesSection({
  characters,
  costumes,
}: {
  characters: Character[];
  costumes: CostumeItem[];
}) {
  const favs = useFavorites();
  const [tab, setTab] = useState<"runners" | "costumes">("runners");

  const charMap = useMemo(
    () => new Map(characters.map((c) => [c.id, c])),
    [characters],
  );
  const costumeMap = useMemo(
    () => new Map(costumes.map((c) => [c.id, c])),
    [costumes],
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

  if (!favs.ready) {
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

  const totalCount = favRunners.length + favCostumes.length;

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-white/90">즐겨찾기</h2>
        <span className="text-xs text-white/40">{totalCount}개</span>
      </div>

      {totalCount === 0 ? (
        <EmptyState message="아직 즐겨찾기가 없습니다" />
      ) : (
        <>
          <div className="flex rounded-lg border border-white/10 overflow-hidden text-sm mb-4">
            <button
              onClick={() => setTab("runners")}
              className={`px-3 py-1.5 transition-colors ${
                tab === "runners"
                  ? "bg-teal-600 text-white font-medium"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              런너 ({favRunners.length})
            </button>
            <button
              onClick={() => setTab("costumes")}
              className={`px-3 py-1.5 transition-colors ${
                tab === "costumes"
                  ? "bg-teal-600 text-white font-medium"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              코스튬 ({favCostumes.length})
            </button>
          </div>

          {tab === "runners" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-grid">
              {favRunners.length === 0 ? (
                <EmptyState message="즐겨찾기한 런너가 없습니다" />
              ) : (
                favRunners.map(({ entry, char }) => (
                  <Link
                    key={entry.id}
                    href="/characters"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors card-hover"
                  >
                    <Image
                      src={char.circularImageUrl}
                      alt={char.characterNm}
                      width={40}
                      height={40}
                      className="rounded-full ring-1 ring-white/10"
                    />
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
                    </div>
                    {entry.tags.length > 0 && (
                      <div className="flex gap-1 shrink-0">
                        {entry.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-white/30"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
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
                  <Link
                    key={entry.id}
                    href="/closet"
                    className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden hover:bg-white/[0.04] transition-colors card-hover"
                  >
                    <div className="relative aspect-[4/3] bg-white/5">
                      <Image
                        src={costume.thumbnail}
                        alt={costume.subject}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <span
                        className={`absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
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
        프로필과 즐겨찾기를 JSON으로 백업하거나 복원할 수 있습니다
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
}: {
  characters: Character[];
  costumes: CostumeItem[];
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-accent-light">
          마이페이지
        </h1>
        <p className="text-sm text-white/40">
          프로필과 즐겨찾기를 한곳에서 관리합니다
        </p>
      </div>
      <ProfileSection characters={characters} />
      <FavoritesSection characters={characters} costumes={costumes} />
      <DataSection />
    </div>
  );
}
