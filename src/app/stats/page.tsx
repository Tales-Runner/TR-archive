import type { Metadata } from "next";
import { StatsDashboard } from "./stats-dashboard";
import { ScholarComment } from "../scholar-comment";
import charactersJson from "@/data/characters.json";
import mapsJson from "@/data/maps.json";
import costumesJson from "@/data/costumes.json";
import storiesJson from "@/data/stories.json";
import probabilityJson from "@/data/probability.json";
import levelsJson from "@/data/levels.json";
import type { Character, MapItem, CostumeItem, StoryItem, ProbabilityData } from "@/lib/types";

export const metadata: Metadata = {
  title: "통계 - 엘림스의 비공식 아카이브",
  description: "테일즈런너 데이터 통계 및 분석",
};

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">통계</h1>
      <p className="mb-6 text-sm text-white/40">
        아카이브에 수집된 데이터를 분석한 결과.
      </p>
      <ScholarComment
        elims="데이터를 모으기만 하면 뭐하나. 분석을 해야 의미가 있지."
        r="...흥미로운 패턴이 많습니다."
      />
      <StatsDashboard
        characters={charactersJson as Character[]}
        maps={mapsJson as MapItem[]}
        costumes={costumesJson as CostumeItem[]}
        stories={storiesJson as StoryItem[]}
        probability={probabilityJson as ProbabilityData}
        levels={levelsJson as { level: number; exp: number }[]}
      />
    </div>
  );
}
