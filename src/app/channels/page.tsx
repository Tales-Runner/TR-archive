import type { Metadata } from "next";
import { ChannelsHub } from "./channels-hub";
import { ScholarComment } from "../scholar-comment";

export const metadata: Metadata = {
  title: "공식 채널 - 엘림스 스마일의 비공식 아카이브",
  description: "테일즈런너 공식 YouTube 채널 및 소셜 미디어 계정 모음",
  openGraph: {
    title: "공식 채널 - 엘림스 스마일의 비공식 아카이브",
    description: "테일즈런너 공식 YouTube 채널 및 소셜 미디어 계정 모음",
  },
};

export default function ChannelsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">공식 채널</h1>
      <p className="mb-6 text-sm text-white/40">
        테일즈런너 공식 채널 및 소셜 미디어 계정을 모아둔 허브.
      </p>
      <ScholarComment
        elims="공식 채널을 모아뒀다. 업데이트 영상 끝에는 쿠폰이 숨어있으니 놓치지 마라."
      />
      <ChannelsHub />
    </div>
  );
}
