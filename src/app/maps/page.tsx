import type { Metadata } from "next";
import { Suspense } from "react";
import { MapCatalog } from "./map-catalog";
import { CharacterComment } from "../scholar-comment";
import mapsJson from "@/data/maps.json";
import mapTypesJson from "@/data/map-types.json";
import type { MapItem, MapType } from "@/lib/types";

export const metadata: Metadata = {
  title: "맵 백과 - 엘림스 스마일의 비공식 아카이브",
  description: "테일즈런너 전체 맵 목록 및 상세 정보",
  openGraph: {
    title: "맵 백과 - 엘림스 스마일의 비공식 아카이브",
    description: "테일즈런너 전체 맵 목록 및 상세 정보",
  },
};

export default function MapsPage() {
  const maps = mapsJson as MapItem[];
  const types = mapTypesJson as MapType[];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">맵 도감</h1>
      <p className="mb-6 text-sm text-white/40">
        동화나라 곳곳의 기록. 총 {(mapsJson as MapItem[]).length}개의 맵.
      </p>
      <CharacterComment
        lines={[
          { char: "drHell", text: "런너들! 맵 정보를 찾고 있다면 잘 왔다네. 내 연구실에서 정리해 둔 자료들이라네." },
          { char: "kai", text: "...우리 아빠가 만든 것도 있어." },
        ]}
      />
      <Suspense fallback={
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-surface-card overflow-hidden">
              <div className="aspect-video skeleton" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 skeleton" />
                <div className="h-3 w-1/2 skeleton" />
              </div>
            </div>
          ))}
        </div>
      }><MapCatalog maps={maps} types={types} /></Suspense>
    </div>
  );
}
