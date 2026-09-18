import type { Metadata } from "next";
import { ProbabilityCalculator } from "./probability-calculator";
import { ScholarComment } from "../scholar-comment";
import probabilityMeta from "@/data/probability-meta.json";
import type { ProbabilityCategoryMeta } from "@/lib/types";

export const metadata: Metadata = {
  title: "확률 정보 - 엘림스 스마일의 아카이브",
  description: "테일즈런너 아이템 확률 조회 및 기대값 시뮬레이션",
  openGraph: {
    title: "확률 정보 - 엘림스 스마일의 아카이브",
    description: "테일즈런너 아이템 확률 조회 및 기대값 시뮬레이션",
  },
};

export default function ProbabilityPage() {
  const categories = probabilityMeta as ProbabilityCategoryMeta[];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">확률 정보</h1>
      <p className="mb-6 text-sm text-white/40">
        운명을 시험해 보기 전에, 확률부터 확인하는 게 현명하지.
      </p>
      <ScholarComment
        elims="운을 시험해 보겠다고? 좋아. 그래도 확률쯤은 보고 덤벼야지. 기대와 확률은 다른 법이니까."
      />
      <ProbabilityCalculator categories={categories} />
    </div>
  );
}
