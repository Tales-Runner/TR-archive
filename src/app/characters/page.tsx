import type { Metadata } from "next";
import { CharacterTable } from "./character-table";
import { ScholarComment } from "../scholar-comment";
import charactersJson from "@/data/characters.json";
import type { Character } from "@/lib/types";

export const metadata: Metadata = {
  title: "캐릭터 비교 - 엘림스의 비공식 아카이브",
  description: "테일즈런너 35캐릭터 스탯·모션 시간 비교",
};

export default function CharactersPage() {
  const characters = charactersJson as Character[];
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">런너 능력치</h1>
      <p className="mb-6 text-sm text-white/40">
        35명의 런너 스탯과 모션 시간을 한눈에.
      </p>
      <ScholarComment
        elims="런너들 능력치를 다 까발려 놓는 게 좀 그렇냐고? 크크, 프라이버시 같은 건 아티팩터한테 없어."
        r="...엘림스. 이건 공개 데이터입니다."
      />
      <CharacterTable characters={characters} />
    </div>
  );
}
