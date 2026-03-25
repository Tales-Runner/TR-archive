"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

export interface SearchEntry {
  type: string;
  label: string;
  sub: string;
  href: string;
  img?: string;
}

const TYPE_COLORS: Record<string, string> = {
  런너: "text-teal-300 bg-teal-600/20",
  맵: "text-red-300 bg-red-600/20",
  코스튬: "text-pink-300 bg-pink-600/20",
  가이드: "text-amber-300 bg-amber-600/20",
  스토리: "text-blue-300 bg-blue-600/20",
};

export function GlobalSearch({ index }: { index: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return index
      .filter(
        (r) =>
          r.label.toLowerCase().includes(q) ||
          r.sub.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [query, index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/30 hover:bg-white/10 transition-colors"
      >
        검색
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/20">⌘K</kbd>
      </button>

      <button
        onClick={() => setOpen(true)}
        className="sm:hidden rounded-md p-2 text-white/40 hover:bg-white/5"
        aria-label="검색"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="9" r="6" />
          <path d="M13.5 13.5L17 17" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm px-4"
          onClick={() => { setOpen(false); setQuery(""); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#13101f] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30 shrink-0">
                <circle cx="9" cy="9" r="6" />
                <path d="M13.5 13.5L17 17" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="캐릭터, 맵, 코스튬, 가이드, 스토리 검색..."
                className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/25 outline-none"
              />
              <kbd
                onClick={() => { setOpen(false); setQuery(""); }}
                className="cursor-pointer rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/30 hover:text-white/50"
              >
                ESC
              </kbd>
            </div>

            {results.length > 0 && (
              <div className="max-h-[50vh] overflow-y-auto py-2">
                {results.map((r, i) => (
                  <button
                    key={`${r.type}-${r.label}-${i}`}
                    onClick={() => go(r.href)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                  >
                    {r.img ? (
                      <img src={r.img} alt="" width={24} height={24} className="rounded-full shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/5 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white/80 truncate">{r.label}</div>
                      <div className="text-[11px] text-white/30 truncate">{r.sub}</div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[r.type] ?? "text-white/40 bg-white/5"}`}>
                      {r.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {query.trim() && results.length === 0 && (
              <div className="py-8 text-center text-sm text-white/30">
                결과 없음
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
