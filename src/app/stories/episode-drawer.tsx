"use client";

import { useEffect, useRef } from "react";
import { formatDate } from "@/lib/format";
import type { SeriesInfo } from "./story-utils";

export function EpisodeDrawer({
  series,
  currentId,
  readIds,
  onSelect,
  onClose,
}: {
  series: SeriesInfo;
  currentId: number;
  readIds: Set<number>;
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector('[data-current="true"]')
        ?.scrollIntoView({ block: "center" });
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[60vh] rounded-t-2xl bg-[#13101f] border-t border-white/10 overflow-hidden animate-slide-up"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[#13101f] px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white/80">{series.name}</h3>
            <p className="text-xs text-white/40">
              {series.episodes.length}화
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/40 hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            닫기
          </button>
        </div>
        <div
          ref={listRef}
          className="overflow-y-auto max-h-[calc(60vh-56px)] p-2"
        >
          {series.episodes.map((ep, i) => (
            <button
              key={ep.id}
              data-current={ep.id === currentId}
              onClick={() => {
                onSelect(ep.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                ep.id === currentId
                  ? "bg-teal-600/20 border border-teal-500/30"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <span
                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  ep.id === currentId
                    ? "bg-teal-600 text-white"
                    : "bg-white/5 text-white/40"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm truncate ${
                    ep.id === currentId
                      ? "text-teal-300 font-medium"
                      : readIds.has(ep.id)
                        ? "text-white/40"
                        : "text-white/70"
                  }`}
                >
                  {ep.subject}
                </p>
                <p className="text-[10px] text-white/30">
                  {formatDate(ep.openDt)}
                </p>
              </div>
              {readIds.has(ep.id) && ep.id !== currentId && (
                <span className="text-[10px] text-teal-400/40">읽음</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
