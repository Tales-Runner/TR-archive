import type { Metadata } from "next";
import { StoryTimeline } from "./story-timeline";
import { ScholarComment } from "../scholar-comment";
import storiesJson from "@/data/stories.json";
import type { StoryItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "스토리 - 엘림스 스마일의 비공식 아카이브",
  description: "테일즈런너 스토리 타임라인",
  openGraph: {
    title: "스토리 - 엘림스 스마일의 비공식 아카이브",
    description: "테일즈런너 스토리 타임라인",
  },
};

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tag, story } = await searchParams;
  const initialTag = typeof tag === "string" ? tag : undefined;
  const storyParam = typeof story === "string" ? Number(story) : undefined;
  const initialStoryId =
    storyParam && !isNaN(storyParam) ? storyParam : undefined;
  const stories = storiesJson as StoryItem[];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">스토리</h1>
      <p className="mb-6 text-sm text-white/40">
        동화나라에 남겨진 이야기들. 감정 에너지가 가장 많이 깃든 기록이지.
      </p>
      <ScholarComment
        elims="이 세계에 무슨 일이 있었는지 궁금한가? 어디, 직접 읽어 봐. 제법 흥미로운 이야기도 있을 테니."
        r="...세로로 스크롤하면 읽을 수 있어요."
      />
      <StoryTimeline
        stories={stories}
        initialTag={initialTag}
        initialStoryId={initialStoryId}
      />
    </div>
  );
}
