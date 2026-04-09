"use client";

import { useState } from "react";
import Image from "next/image";
import { useProfile } from "@/lib/use-profile";
import { useToast } from "@/components/toast";
import { formatIsoDate } from "@/lib/format";
import { getLevelRank } from "@/lib/constants";
import type { Character } from "@/lib/types";

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

export function ProfileSection({
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
    const parsed = level.trim() ? parseInt(level) : null;
    const validLevel = parsed !== null && !isNaN(parsed)
      ? Math.min(126, Math.max(1, parsed))
      : null;
    await save({
      nickname: nickname.trim(),
      avatarUrl,
      characterId: charId,
      level: validLevel,
    });
    setEditing(false);
    toast("프로필을 저장되었습니다");
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
    const parsedLevel = parseInt(level);
    const showPreview = !isNaN(parsedLevel) && parsedLevel >= 1 && parsedLevel <= 126;

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
          {showPreview && (
            <div className="mt-1.5">
              <LevelBadge level={parsedLevel} />
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
            {formatIsoDate(profile.createdAt)}부터 기록 중
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
