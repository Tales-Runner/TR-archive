import type { Metadata } from "next";
import { StoryTimeline } from "./story-timeline";
import { ScholarComment } from "../scholar-comment";
import storiesJson from "@/data/stories.json";
import type { StoryItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "스토리 - 엘림스의 비공식 아카이브",
  description: "테일즈런너 스토리 타임라인",
};

export default function StoriesPage() {
  const stories = storiesJson as StoryItem[];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">스토리</h1>
      <p className="mb-6 text-sm text-white/40">
        동화나라에 남겨진 이야기들. 감정 에너지가 가장 많이 깃든 기록이지.
      </p>
      <ScholarComment
        elims="여태까지의 이벤트 스토리를 모아 둔 거야. 공식에선 모바일로 보면 깨지던데... 내가 고쳐놨지."
        r="...세로로 스크롤하면 읽을 수 있어요."
      />
      <StoryTimeline stories={stories} />
    </div>
  );
}
