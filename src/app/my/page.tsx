import type { Metadata } from "next";
import { MyPageClient } from "./my-page-client";
import charactersJson from "@/data/characters.json";
import costumesJson from "@/data/costumes.json";
import type { Character, CostumeItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "마이페이지 - 엘림스 스마일의 비공식 아카이브",
  description: "내 프로필과 즐겨찾기를 관리합니다",
  openGraph: {
    title: "마이페이지 - 엘림스 스마일의 비공식 아카이브",
    description: "내 프로필과 즐겨찾기를 관리합니다",
  },
};

export default function MyPage() {
  const characters = (charactersJson as Character[]).filter((c) => c.isView);
  const costumes = costumesJson as CostumeItem[];
  return <MyPageClient characters={characters} costumes={costumes} />;
}
