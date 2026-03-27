import { STORY_ARCS } from "@/data/lore";
import { LoreTimeline } from "./lore-client";
import { CharacterComment } from "../scholar-comment";

export const metadata = {
  title: "세계관 연대기 — 엘림스 스마일의 비공식 아카이브",
  description: "테일즈런너 공식 스토리 타임라인. 2009년부터 현재까지의 스토리 아크를 시간순으로 정리.",
};

export default function LorePage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white/90 mb-1">세계관 연대기</h1>
      <p className="text-sm text-white/40 mb-6">
        공식 스토리 아카이브 기반 — 2009년부터 현재까지
      </p>

      <CharacterComment
        lines={[
          { char: "elims", text: "내가 정리해 둔 동화나라의 연대기야. 공식 스토리 태그와 제목을 기반으로 정리했으니까 신뢰해도 좋아." },
          { char: "r", text: "이렇게 많은 이야기가 있었군요...! 카오스 시리즈가 2009년부터라니..." },
          { char: "elims", text: "크크, 이 세계의 역사는 꽤 길지. 관심 있는 에피소드를 눌러봐." },
        ]}
      />

      <div className="mt-8">
        <LoreTimeline arcs={STORY_ARCS} />
      </div>
    </section>
  );
}
