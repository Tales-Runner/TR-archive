import type { Metadata } from "next";
import { ProbabilityCalculator } from "./probability-calculator";
import { ScholarComment } from "../scholar-comment";
import probabilityJson from "@/data/probability.json";
import type { ProbabilityData } from "@/lib/types";

export const metadata: Metadata = {
  title: "변경권 계산기 - 엘림스의 비공식 아카이브",
  description: "테일즈런너 변경권 확률 조회 및 기대값 시뮬레이션",
};

export default function ProbabilityPage() {
  const data = probabilityJson as ProbabilityData;
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">변경권 확률</h1>
      <p className="mb-6 text-sm text-white/40">
        운명을 시험해 보기 전에, 확률부터 확인하는 게 현명하지.
      </p>
      <ScholarComment
        elims="크큭. 이건 조수가 만든 거라 정확하지 않을 수도 있다고. 결과가 이상하면 나한테 따지지 말고."
        r="...공식 확률 데이터 그대로예요. 엘림스가 왜 그렇게 말하는 건지는 잘 모르겠어요."
      />
      <ProbabilityCalculator data={data} />
    </div>
  );
}
