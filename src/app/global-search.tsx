"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SEARCH_TYPE_COLORS } from "@/lib/constants";
import { isSafeImageUrl } from "@/lib/format";
import { useDocumentKeydown } from "@/lib/use-document-keydown";

export interface SearchEntry {
  type: string;
  label: string;
  sub: string;
  href: string;
  img?: string;
}

const MAX_VISIBLE = 20;

export function GlobalSearch({ index }: { index: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, dialogRef, inputRef);
  useBodyScrollLock(open);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return index
      .filter(
        (r) =>
          r.label.toLowerCase().includes(q) ||
          r.sub.toLowerCase().includes(q)
      )
      .slice(0, MAX_VISIBLE);
  }, [query, index]);

  // Reset selection when query changes — tracked via previous value in state
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setSelectedIndex(-1);
  }

  useDocumentKeydown(
    useCallback((e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!document.querySelector('[role="dialog"]')) setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }, []),
  );


  function go(href: string) {
    setOpen(false);
    setQuery("");
    if (/^https?:\/\//.test(href)) {
      window.location.assign(href);
      return;
    }
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(selectedIndex + 1, results.length - 1);
      setSelectedIndex(next);
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = results.length ? Math.max(selectedIndex - 1, 0) : -1;
      setSelectedIndex(next);
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && !e.nativeEvent.isComposing && results.length > 0) {
      e.preventDefault();
      go(results[Math.max(selectedIndex, 0)].href);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 hover:bg-white/10 transition-colors"
      >
        검색
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/40">⌘K</kbd>
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

      {open && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[8dvh] sm:pt-[15dvh] bg-black/60 backdrop-blur-sm px-4"
          onClick={() => { setOpen(false); setQuery(""); }}
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="검색"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[80dvh] w-full max-w-lg flex-col rounded-2xl border border-white/10 bg-[#13101f] shadow-2xl overflow-hidden animate-scale-in"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40 shrink-0">
                <circle cx="9" cy="9" r="6" />
                <path d="M13.5 13.5L17 17" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="캐릭터, 맵, 코스튬, 가이드, 스토리 검색..."
                className="min-w-0 flex-1 bg-transparent text-base text-white/90 placeholder:text-white/40 outline-none"
                role="combobox"
                aria-label="아카이브 검색"
                aria-expanded={results.length > 0}
                aria-controls="archive-search-results"
                aria-autocomplete="list"
                aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
              />
              <button
                type="button"
                aria-label="검색 닫기"
                onClick={() => { setOpen(false); setQuery(""); }}
                className="cursor-pointer rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/40 hover:text-white/50"
              >
                닫기
              </button>
            </div>

            {results.length > 0 && (
              <div id="archive-search-results" ref={listRef} className="min-h-0 overflow-y-auto overscroll-contain py-2" role="listbox" aria-label="검색 결과">
                {results.map((r, i) => (
                  <button
                    id={`search-result-${i}`}
                    key={`${r.type}-${r.label}-${i}`}
                    role="option"
                    aria-selected={i === selectedIndex}
                    onClick={() => go(r.href)}
                    onMouseEnter={() => { if (i !== selectedIndex) setSelectedIndex(i); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === selectedIndex ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    {r.img && isSafeImageUrl(r.img) ? (
                      <Image src={r.img} alt="" width={24} height={24} className="rounded-full shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/5 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white/80 truncate">{r.label}</div>
                      <div className="text-[11px] text-white/40 truncate">{r.sub}</div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${SEARCH_TYPE_COLORS[r.type] ?? "text-white/40 bg-white/5"}`}>
                      {r.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {query.trim() && results.length === 0 && (
              <div className="py-8 text-center text-sm text-white/40">
                결과 없음
              </div>
            )}

            {results.length > 0 && (
              <div className="border-t border-white/5 px-4 py-2 text-[10px] text-white/40 flex gap-3">
                <span>↑↓ 이동</span>
                <span>↵ 선택</span>
                <span>esc 닫기</span>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
