import type { Metadata } from "next";
import Link from "next/link";
import { ScholarComment } from "../scholar-comment";
import storiesJson from "@/data/stories.json";
import { TR_STORY_URL, trStoryHref } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { StoryItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "스토리 안내 - 엘림스 스마일의 비공식 아카이브",
  description: "테일즈런너 스토리 감상은 TR Story에서 제공합니다",
  openGraph: {
    title: "스토리 안내 - 엘림스 스마일의 비공식 아카이브",
    description: "테일즈런너 스토리 감상은 TR Story에서 제공합니다",
  },
};

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tag, story } = await searchParams;
  const storyParam = typeof story === "string" ? Number(story) : undefined;
  const initialStoryId = storyParam && !isNaN(storyParam) ? storyParam : undefined;
  const stories = storiesJson as StoryItem[];
  const latest = stories[0];
  const targetHref = initialStoryId
    ? trStoryHref(`/stories/${initialStoryId}/`)
    : typeof tag === "string"
      ? `${TR_STORY_URL}/?q=${encodeURIComponent(tag)}`
      : TR_STORY_URL;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">스토리 안내</h1>
      <p className="mb-6 text-sm text-white/40">웹툰 감상은 TR Story가 맡고 있습니다.</p>
      <ScholarComment
        elims="이 세계의 이야기가 궁금한가? 좋아. 어디서부터 볼지 골라 봐."
      />

      <section className="mt-6 rounded-2xl border border-teal-500/20 bg-teal-950/20 p-6">
        <p className="text-sm font-medium text-teal-200">TR Story</p>
        <h2 className="mt-2 text-2xl font-black text-white/90">
          테일즈런너 웹툰과 영상 감상
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
          {stories.length}편의 스토리를 감상하고 회차를 이동할 수 있습니다. 새 읽음 표시와 진행률은
          TR Story에 별도로 저장됩니다. 이 아카이브는 엘림스 스마일의 데이터 색인,
          연대기, 관계도, 도감 기능에 집중합니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={targetHref}
            className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-teal-300"
          >
            TR Story에서 열기
          </a>
          {latest && (
            <a
              href={trStoryHref(`/stories/${latest.id}/`)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10"
            >
              최신화 바로 보기
            </a>
          )}
          <Link
            href="/lore"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/55 transition-colors hover:bg-white/10 hover:text-white/75"
          >
            연대기 보기
          </Link>
        </div>
      </section>

      <p className="mt-4 text-sm text-white/50">이 아카이브의 기존 읽기 기록은 마이페이지에서 백업할 수 있습니다. TR Story로 자동 이전되지는 않습니다.</p>

      {latest && (
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-white/35">최근 수집된 스토리</p>
          <p className="mt-1 text-sm font-semibold text-white/75">{latest.subject}</p>
          <p className="mt-0.5 text-xs text-white/35">{formatDate(latest.openDt)}</p>
        </section>
      )}
    </div>
  );
}
