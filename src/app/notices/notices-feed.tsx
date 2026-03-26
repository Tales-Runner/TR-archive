"use client";

import { useState, useEffect, useMemo } from "react";
import { formatIsoDate } from "@/lib/format";
import { API_BASE, SITE_BASE } from "@/lib/constants";
import { EmptyState } from "@/components/empty-state";

const API = `${API_BASE}/main/notices`;

interface Notice {
  id: number;
  subject: string;
  createdAt: string;
  startAt: string;
  isPinned: boolean;
  viewOrder: number;
  isNew: boolean;
}

type Category = "all" | "patch" | "event" | "maintenance" | "other";

function categorize(subject: string): Category {
  if (/패치|업데이트/.test(subject)) return "patch";
  if (/점검/.test(subject)) return "maintenance";
  if (/이벤트|축하|기념|콜라보|시즌/.test(subject)) return "event";
  return "other";
}

const CAT_LABELS: Record<Category, string> = {
  all: "전체",
  patch: "패치",
  event: "이벤트",
  maintenance: "점검",
  other: "기타",
};

export function NoticesFeed() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [catFilter, setCatFilter] = useState<Category>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    fetch(API, { signal: ac.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.resCd === "0000") {
          setNotices(data.result.list);
        } else {
          setError(true);
        }
      })
      .catch(() => { if (!ac.signal.aborted) setError(true); })
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => ac.abort();
  }, []);

  const categorized = useMemo(
    () => notices.map((n) => ({ ...n, cat: categorize(n.subject) })),
    [notices]
  );

  const filtered = useMemo(() => {
    let list = categorized;
    if (catFilter !== "all") {
      list = list.filter((n) => n.cat === catFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((n) => n.subject.toLowerCase().includes(q));
    }
    return list;
  }, [categorized, catFilter, search]);

  if (loading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg px-4 py-3">
            <div className="skeleton h-4 flex-1" />
            <div className="skeleton h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-white/30 text-sm">
        공지사항을 불러올 수 없습니다.{" "}
        <a
          href={`${SITE_BASE}/news/notices`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-teal-400"
        >
          공식 홈페이지에서 확인
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Filter */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex overflow-x-auto rounded-lg border border-white/10 text-sm">
          {(Object.keys(CAT_LABELS) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 transition-colors ${
                catFilter === cat
                  ? "bg-teal-600 text-white font-medium"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              {CAT_LABELS[cat]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="공지 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50 sm:text-sm sm:py-1.5"
        />
        <span className="text-xs text-white/30">{filtered.length}개</span>
      </div>

      {/* List */}
      {filtered.length === 0 && <EmptyState message="조건에 맞는 공지가 없습니다" />}
      <div className="space-y-1">
        {filtered.map((n) => (
          <a
            key={n.id}
            href={`${SITE_BASE}/news/notices/${n.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.03]"
          >
            {n.isPinned && (
              <span className="shrink-0 rounded bg-teal-600/20 px-1.5 py-0.5 text-[10px] font-bold text-teal-300">
                고정
              </span>
            )}
            {n.isNew && (
              <span className="shrink-0 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                NEW
              </span>
            )}
            <span className="min-w-0 flex-1 text-sm text-white/80 truncate">
              {n.subject}
            </span>
            <span className="shrink-0 text-xs text-white/25 tabular-nums">
              {formatIsoDate(n.createdAt)}
            </span>
          </a>
        ))}
      </div>
    </>
  );
}
