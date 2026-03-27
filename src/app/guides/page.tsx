import type { Metadata } from "next";
import { GuideBrowser } from "./guide-browser";
import { ScholarComment } from "../scholar-comment";
import guidesJson from "@/data/guides.json";
import type { GuideItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "게임 가이드 - 엘림스 스마일의 비공식 아카이브",
  description: "테일즈런너 공식 게임 가이드 모음",
  openGraph: {
    title: "게임 가이드 - 엘림스 스마일의 비공식 아카이브",
    description: "테일즈런너 공식 게임 가이드 모음",
  },
};

export default function GuidesPage() {
  const guides = guidesJson as GuideItem[];
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">가이드</h1>
      <p className="mb-6 text-sm text-white/40">
        동화나라를 달리기 위해 알아야 할 것들.
      </p>
      <ScholarComment
        elims="가이드? 이런 건 직접 뛰어보면서 배우는 게 낫지. ...근데 뭐, R이 정리해 달라길래."
        r="궁금한 게 많아서요. ...정리하면서 저도 배웠습니다."
      />
      <GuideBrowser guides={guides} />
    </div>
  );
}
