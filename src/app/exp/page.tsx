import type { Metadata } from "next";
import { ExpCalculator } from "./exp-calculator";
import { ScholarComment } from "../scholar-comment";
import levelsJson from "@/data/levels.json";

export const metadata: Metadata = {
  title: "경험치 계산기 - 엘림스의 비공식 아카이브",
  description: "테일즈런너 레벨업 필요 경험치 계산",
};

export default function ExpPage() {
  const levels = levelsJson as { level: number; exp: number }[];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">
        경험치 계산기
      </h1>
      <p className="mb-6 text-sm text-white/40">
        현재 레벨에서 목표 레벨까지 필요한 경험치를 계산합니다.
      </p>
      <ScholarComment
        elims="크큭. 레벨업에 얼마나 걸리는지 알고 싶다고? 현실을 직시하는 건 좋은 습관이지."
        r="...숫자를 입력하면 계산됩니다."
      />
      <ExpCalculator levels={levels} />
    </div>
  );
}
