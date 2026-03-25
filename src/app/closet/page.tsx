import type { Metadata } from "next";
import { CostumeCatalog } from "./costume-catalog";
import { ScholarComment } from "../scholar-comment";
import costumesJson from "@/data/costumes.json";
import type { CostumeItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "코스튬 - 엘림스의 비공식 아카이브",
  description: "테일즈런너 코스튬 세트 갤러리",
};

export default function ClosetPage() {
  const costumes = costumesJson as CostumeItem[];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">코스튬</h1>
      <p className="mb-6 text-sm text-white/40">
        런너들의 옷장. 세트를 눌러 아이템을 살펴보자.
      </p>
      <ScholarComment
        elims="옷 구경하러 왔어? 흥, 난 이런 거에 관심 없지만 정리는 해뒀지."
      />
      <CostumeCatalog costumes={costumes} />
    </div>
  );
}
