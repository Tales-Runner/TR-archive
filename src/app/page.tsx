import Link from "next/link";
import { VNScene } from "./vn-scene";
import mapsJson from "@/data/maps.json";
import costumesJson from "@/data/costumes.json";
import storiesJson from "@/data/stories.json";
import type { MapItem, CostumeItem, StoryItem } from "@/lib/types";
import { formatDate } from "@/lib/format";

const ELIMS = {
  mainImage:
    "https://trimage.rhaon.co.kr/images/trintro/character/mainImageUrl/2d8NfCsBO9RRDObt3pw8NA.png",
};

const recentMaps = (mapsJson as MapItem[]).slice(0, 3);
const recentCostumes = (costumesJson as CostumeItem[]).slice(0, 3);
const recentStories = (storiesJson as StoryItem[]).slice(0, 3);

const CHOICES = [
  {
    href: "/characters",
    label: "런너들의 능력치가 궁금해",
    sub: "런너 능력치",
  },
  {
    href: "/probability",
    label: "변경권 확률이 궁금해",
    sub: "변경권 확률",
  },
  {
    href: "/maps",
    label: "어떤 맵들이 있는지 알려줘",
    sub: "맵 도감",
  },
  {
    href: "/closet",
    label: "코스튬 구경하러 왔어",
    sub: "코스튬",
  },
  {
    href: "/guides",
    label: "동화나라에 대해 알려줘",
    sub: "가이드",
  },
  {
    href: "/stories",
    label: "이 세계의 이야기가 궁금해",
    sub: "스토리",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* BG */}
      <div className="relative flex flex-1 flex-col items-center justify-end bg-gradient-to-b from-[#0e1a1f] via-[#133040] to-[#0e1a1f] overflow-hidden">
        {/* Subtle particle/star effect via radial gradients */}
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_20%_50%,rgba(45,212,191,0.2),transparent_50%),radial-gradient(ellipse_at_80%_30%,rgba(94,234,212,0.15),transparent_50%)]" />

        {/* Character */}
        <div className="relative z-10 mb-0 translate-y-4">
          <img
            src={ELIMS.mainImage}
            alt="엘림스 스마일"
            width={320}
            height={320}
            style={{ maxWidth: "min(320px, 70vw)" }}
            className="drop-shadow-[0_0_40px_rgba(45,212,191,0.25)] select-none"
            draggable={false}
          />
        </div>

        {/* VN Dialog Box */}
        <VNScene choices={CHOICES} />
      </div>

      {/* Recent updates */}
      <div className="mx-auto max-w-6xl w-full px-4 py-8">
        <h2 className="text-lg font-bold text-accent-light mb-4">최근 업데이트</h2>
        <div className="grid gap-3 sm:gap-6 sm:grid-cols-3">
          {/* Recent Maps */}
          <div>
            <Link href="/maps" className="text-sm font-medium text-teal-400 hover:text-teal-300 mb-2 block">맵 도감 →</Link>
            <div className="space-y-2">
              {recentMaps.map((m) => (
                <Link key={m.id} href="/maps" className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.05] transition-colors">
                  <img src={m.thumbnail} alt="" className="w-12 h-8 rounded object-cover shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-white/80 truncate">{m.subject}</div>
                    <div className="text-[10px] text-white/30">{formatDate(m.openDt)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Costumes */}
          <div>
            <Link href="/closet" className="text-sm font-medium text-teal-400 hover:text-teal-300 mb-2 block">코스튬 →</Link>
            <div className="space-y-2">
              {recentCostumes.map((c) => (
                <Link key={c.id} href="/closet" className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.05] transition-colors">
                  <img src={c.thumbnail} alt="" className="w-12 h-8 rounded object-cover shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-white/80 truncate">{c.subject}</div>
                    <div className="text-[10px] text-white/30">{formatDate(c.openDt)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Stories */}
          <div>
            <Link href="/stories" className="text-sm font-medium text-teal-400 hover:text-teal-300 mb-2 block">스토리 →</Link>
            <div className="space-y-2">
              {recentStories.map((s) => (
                <Link key={s.id} href="/stories" className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.05] transition-colors">
                  <img src={s.thumbnail} alt="" className="w-12 h-8 rounded object-cover shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-white/80 truncate">{s.subject}</div>
                    <div className="text-[10px] text-white/30">{formatDate(s.openDt)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
