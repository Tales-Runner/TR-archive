import type { Metadata } from "next";
import { MiniGame } from "./mini-game";

export const metadata: Metadata = {
  title: "도트 러너 — 엘림스 스마일의 비공식 아카이브",
  description:
    "테일즈런너가 원래 모바일 횡스크롤로 기획됐던 시절에 경의를 표하는 팬제작 LCD 미니게임",
};

export default function MiniPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white/80">도트 러너</h1>
        <p className="mt-1 text-sm text-white/40">
          피처폰 시절 횡스크롤 원형에 바치는 4색 LCD 팬게임
        </p>
      </header>
      <MiniGame />
    </div>
  );
}
