import type { Metadata } from "next";
import { NoticesFeed } from "./notices-feed";

export const metadata: Metadata = {
  title: "공지사항 - 엘림스의 비공식 아카이브",
  description: "테일즈런너 공지사항 및 이벤트",
};

export default function NoticesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">공지사항</h1>
      <p className="mb-6 text-sm text-white/40">
        공식 홈페이지 공지사항을 실시간으로 가져옵니다.
      </p>
      <NoticesFeed />
    </div>
  );
}
