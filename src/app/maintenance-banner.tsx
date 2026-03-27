"use client";

import { useState, useEffect } from "react";
const API = "/api/maintenance";

export function MaintenanceBanner() {
  const [info, setInfo] = useState<{ subject?: string } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    fetch(API, { signal: ac.signal })
      .then((r) => {
        if (r.status === 404) return null;
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data?.resCd === "0000" && data.result?.info) {
          setInfo(data.result.info);
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => ac.abort();
  }, []);

  if (error) {
    return (
      <div className="bg-red-900/60 text-white/70 text-center text-xs py-1.5 px-4">
        점검 정보를 불러올 수 없습니다
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="bg-amber-600/90 text-white text-center text-sm py-2 px-4">
      <span className="font-bold">점검 중</span>
      {info.subject && <span className="ml-2">{info.subject}</span>}
    </div>
  );
}
