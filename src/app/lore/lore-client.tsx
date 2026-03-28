"use client";

import { useState } from "react";
import Link from "next/link";
import type { StoryArc } from "@/data/lore";

function ArcCard({ arc, isOpen, onToggle }: { arc: StoryArc; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="relative pl-8 pb-8 border-l border-white/10 last:border-l-0 last:pb-0">
      {/* Timeline dot */}
      <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-teal-500 ring-2 ring-[#0f0b1a]" />

      <button
        onClick={onToggle}
        className="w-full text-left group"
      >
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs text-teal-400 font-mono tabular-nums">{arc.period}</span>
          <h3 className="text-sm font-bold text-white/90 group-hover:text-teal-300 transition-colors">
            {arc.title}
          </h3>
          <span className="text-[10px] text-white/40">{arc.episodes}화</span>
          {arc.hasVideo && (
            <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-300">영상</span>
          )}
        </div>
        {arc.characters.length > 0 && (
          <div className="flex gap-1.5 mb-1">
            {arc.characters.map((c) => (
              <span key={c} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                {c}
              </span>
            ))}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 animate-fade-in">
          <p className="text-sm text-white/70 leading-relaxed mb-4">{arc.summary}</p>

          {arc.storyTags.length > 0 && (
            <Link
              href={`/stories?tag=${encodeURIComponent(arc.storyTags[0])}`}
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >
              관련 스토리 보기 →
            </Link>
          )}

          {/* 감초 대사 — 캐릭터 해석 재검토 후 복원 예정
          <div className="border-t border-white/5 pt-3 space-y-2">
            <div className="flex gap-2">
              <span className="shrink-0 text-[10px] font-bold text-teal-400">엘림스</span>
              <p className="text-xs text-white/50 leading-relaxed">{arc.elimsComment}</p>
            </div>
            {arc.rComment && (
              <div className="flex gap-2">
                <span className="shrink-0 text-[10px] font-bold text-white/40">R</span>
                <p className="text-xs text-white/40 leading-relaxed">{arc.rComment}</p>
              </div>
            )}
          </div>
          */}
        </div>
      )}
    </div>
  );
}

export function LoreTimeline({ arcs }: { arcs: StoryArc[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="relative">
      {arcs.map((arc) => (
        <ArcCard
          key={arc.id}
          arc={arc}
          isOpen={openId === arc.id}
          onToggle={() => setOpenId(openId === arc.id ? null : arc.id)}
        />
      ))}
    </div>
  );
}
