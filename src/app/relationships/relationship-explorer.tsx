"use client";

import { Fragment, useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import type { Character } from "@/lib/types";
import type { Dossier } from "@/data/dossier";
import { STORY_ARCS } from "@/data/lore";
import { useDebouncedValue } from "@/lib/use-debounce";
import { EmptyState } from "@/components/empty-state";

const RELATION_COLORS: Record<string, string> = {
  가족: "bg-pink-500/20 text-pink-300",
  창조: "bg-purple-500/20 text-purple-300",
  동료: "bg-teal-500/20 text-teal-300",
  적대: "bg-red-500/20 text-red-300",
  보호: "bg-blue-500/20 text-blue-300",
  동행: "bg-amber-500/20 text-amber-300",
  소속: "bg-indigo-500/20 text-indigo-300",
  연관: "bg-white/10 text-white/50",
};

function DossierCard({
  dossier,
  character,
  allCharacters,
  onSelectCharacter,
}: {
  dossier: Dossier;
  character: Character;
  allCharacters: Character[];
  onSelectCharacter: (id: number) => void;
}) {
  const storyArcs = useMemo(
    () => STORY_ARCS.filter((a) => dossier.storyArcIds.includes(a.id)),
    [dossier.storyArcIds],
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-card overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 bg-white/[0.02] p-5">
        <Image
          src={character.mainImageUrl}
          alt={character.characterNm}
          width={72}
          height={72}
          className="rounded-xl ring-1 ring-white/10"
        />
        <div>
          <h2 className="text-lg font-bold text-white/90">{character.characterNm}</h2>
          <p className="text-sm text-teal-400">{character.catchPhrase}</p>
          {dossier.faction && (
            <span className="inline-block mt-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-white/40">
              {dossier.faction}
            </span>
          )}
        </div>
      </div>

      {/* Trivia */}
      <div className="p-5 border-b border-white/10">
        <h3 className="text-xs font-medium text-white/40 mb-2">공식 프로필</h3>
        <ul className="space-y-1">
          {dossier.trivia.map((t, i) => (
            <li key={i} className="text-xs text-white/60 leading-relaxed">
              <span className="text-white/20 mr-1.5">·</span>{t}
            </li>
          ))}
        </ul>
      </div>

      {/* Relations */}
      {dossier.relations.length > 0 && (
        <div className="p-5 border-b border-white/10">
          <h3 className="text-xs font-medium text-white/40 mb-3">관계</h3>
          <div className="space-y-2">
            {dossier.relations.map((rel, i) => {
              const targetChar = rel.targetId
                ? allCharacters.find((c) => c.id === rel.targetId)
                : undefined;
              return (
                <div key={i} className="flex items-start gap-2">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${RELATION_COLORS[rel.type] ?? RELATION_COLORS["연관"]}`}>
                    {rel.type}
                  </span>
                  <div className="min-w-0">
                    {targetChar ? (
                      <button
                        onClick={() => onSelectCharacter(targetChar.id)}
                        className="text-xs text-teal-300 hover:underline"
                      >
                        {rel.targetName}
                      </button>
                    ) : (
                      <span className="text-xs text-white/70">{rel.targetName}</span>
                    )}
                    <p className="text-[11px] text-white/40 leading-relaxed">{rel.label}</p>
                    <p className="text-[10px] text-white/20">출처: {rel.source}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Story Appearances */}
      {storyArcs.length > 0 && (
        <div className="p-5 border-b border-white/10">
          <h3 className="text-xs font-medium text-white/40 mb-2">등장 스토리</h3>
          <div className="flex flex-wrap gap-1.5">
            {storyArcs.map((arc) => (
              <span key={arc.id} className="rounded-full bg-teal-600/15 px-2.5 py-0.5 text-[11px] text-teal-300">
                {arc.title} ({arc.period})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Elims Note */}
      <div className="p-5 space-y-2">
        <div className="flex gap-2">
          <span className="shrink-0 text-[10px] font-bold text-teal-400">엘림스</span>
          <p className="text-xs text-white/50 leading-relaxed">{dossier.elimsNote}</p>
        </div>
        {dossier.rNote && (
          <div className="flex gap-2">
            <span className="shrink-0 text-[10px] font-bold text-white/40">R</span>
            <p className="text-xs text-white/40 leading-relaxed">{dossier.rNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function RelationshipExplorer({
  characters,
  dossiers,
}: {
  characters: Character[];
  dossiers: Dossier[];
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const cardRef = useRef<HTMLDivElement>(null);

  const dossierMap = useMemo(
    () => new Map(dossiers.map((d) => [d.characterId, d])),
    [dossiers],
  );

  const charsWithDossier = useMemo(() => {
    let list = characters.filter((c) => dossierMap.has(c.id));
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.characterNm.toLowerCase().includes(q) ||
          c.catchPhrase.toLowerCase().includes(q),
      );
    }
    return list;
  }, [characters, dossierMap, debouncedSearch]);

  const selectedChar = selectedId !== null ? characters.find((c) => c.id === selectedId) : null;
  const selectedDossier = selectedId !== null ? dossierMap.get(selectedId) : undefined;

  useEffect(() => {
    if (selectedChar && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  const handleSelect = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="캐릭터 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50 sm:text-sm sm:py-1.5"
        />
        <span className="text-xs text-white/30">{charsWithDossier.length}명</span>
      </div>

      {/* Character Grid — DossierCard inserted inline after selected icon */}
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 mb-6">
        {charsWithDossier.map((c) => (
          <Fragment key={c.id}>
            <button
              onClick={() => handleSelect(c.id)}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${
                selectedId === c.id
                  ? "bg-teal-600/20 ring-1 ring-teal-500/50"
                  : "hover:bg-white/5"
              }`}
            >
              <Image
                src={c.circularImageUrl}
                alt={c.characterNm}
                width={40}
                height={40}
                className="rounded-full ring-1 ring-white/10"
              />
              <span className="text-[10px] text-white/60 truncate w-full text-center">
                {c.characterNm}
              </span>
            </button>
            {selectedId === c.id && selectedChar && selectedDossier && (
              <div ref={cardRef} className="col-span-full py-2">
                <DossierCard
                  dossier={selectedDossier}
                  character={selectedChar}
                  allCharacters={characters}
                  onSelectCharacter={handleSelect}
                />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {charsWithDossier.length === 0 && <EmptyState message="검색 결과가 없습니다" />}

      {!selectedChar && charsWithDossier.length > 0 && (
        <div className="text-center py-12 text-sm text-white/20">
          캐릭터를 선택하면 상세 소개가 열립니다
        </div>
      )}
    </>
  );
}
