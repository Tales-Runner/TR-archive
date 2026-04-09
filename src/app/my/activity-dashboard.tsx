"use client";

import Link from "next/link";
import type { StoryEntry, MapEntry } from "@/lib/db";
import type { useFavorites } from "@/lib/use-favorites";

export function ActivityDashboard({
  totalStories,
  totalMaps,
  storyEntries,
  mapEntries,
  favs,
}: {
  totalStories: number;
  totalMaps: number;
  storyEntries: StoryEntry[];
  mapEntries: MapEntry[];
  favs: ReturnType<typeof useFavorites>;
}) {
  const readStories = storyEntries.filter((s) => s.readAt > 0);
  const clearedMaps = mapEntries.filter((m) => m.clearedAt);
  const ownedCostumes = favs.costumes.filter((c) => c.status === "owned");
  const wishlistCostumes = favs.costumes.filter((c) => c.status === "wishlist");

  interface DashCard {
    label: string;
    value: number;
    total?: number;
    sub?: string;
    color: string;
    bg: string;
    href: string;
  }

  const cards: DashCard[] = [
    {
      label: "읽은 스토리",
      value: readStories.length,
      total: totalStories,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      href: "/stories",
    },
    {
      label: "기록한 맵",
      value: clearedMaps.length,
      total: totalMaps,
      color: "text-red-400",
      bg: "bg-red-500/10",
      href: "/maps",
    },
    {
      label: "보유 코스튬",
      value: ownedCostumes.length,
      sub: wishlistCostumes.length > 0 ? `위시 ${wishlistCostumes.length}` : undefined,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      href: "/closet",
    },
    {
      label: "즐겨찾기 런너",
      value: favs.runners.length,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      href: "/characters",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-grid">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className={`rounded-xl border border-white/5 ${card.bg} p-4 hover:border-white/10 transition-colors card-hover`}
        >
          <p className="text-[11px] text-white/40 mb-1">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color}`}>
            {card.value}
            {card.total != null && (
              <span className="text-sm font-normal text-white/20">
                /{card.total}
              </span>
            )}
          </p>
          {card.sub && (
            <p className="text-[10px] text-white/30 mt-0.5">{card.sub}</p>
          )}
        </Link>
      ))}
    </div>
  );
}
