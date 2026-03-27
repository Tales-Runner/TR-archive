import { DOSSIERS } from "@/data/dossier";
import { RelationshipExplorer } from "./relationship-explorer";
import { CharacterComment } from "../scholar-comment";
import charactersJson from "@/data/characters.json";
import type { Character } from "@/lib/types";

export const metadata = {
  title: "인물 관계도 — 엘림스 스마일의 비공식 아카이브",
  description: "테일즈런너 캐릭터 관계도. 공식 프로필 기반 인물 관계와 스토리 등장 정보.",
};

export default function RelationshipsPage() {
  const characters = (charactersJson as Character[]).filter((c) => c.isView);

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white/90 mb-1">인물 관계도</h1>
      <p className="text-sm text-white/40 mb-6">
        공식 프로필 기반 — 캐릭터를 선택하면 관계와 등장 스토리를 볼 수 있습니다
      </p>

      <CharacterComment
        lines={[
          { char: "elims", text: "내가 조사해 둔 인물 관계도야. 전부 공식 프로필에 근거한 내용이니까 안심하라고." },
          { char: "r", text: "관계가... 복잡하네요. 저도 여기 있나요?" },
          { char: "elims", text: "당연하지. 넌 내 조수잖아. 프로필에도 그렇게 적혀 있고." },
        ]}
      />

      <div className="mt-8">
        <RelationshipExplorer characters={characters} dossiers={DOSSIERS} />
      </div>
    </section>
  );
}
