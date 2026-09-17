import type { Metadata } from "next";
import { CharacterTable } from "./character-table";
import { ScholarComment } from "../scholar-comment";
import charactersJson from "@/data/characters.json";
import type { Character } from "@/lib/types";

export const metadata: Metadata = {
  title: "캐릭터 비교 - 엘림스 스마일의 비공식 아카이브",
  description: "테일즈런너 35캐릭터 스탯·모션 시간 비교",
  openGraph: {
    title: "캐릭터 비교 - 엘림스 스마일의 비공식 아카이브",
    description: "테일즈런너 35캐릭터 스탯·모션 시간 비교",
  },
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
        elims="누가 더 나은지 궁금한가? 나란히 놓고 봐. 차이라는 건 비교할수록 선명해지지."
      />
      <CharacterTable characters={characters} />
    </div>
  );
}
