"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/constants";

const API = `${API_BASE}/code/maintenance`;

export function MaintenanceBanner() {
  const [info, setInfo] = useState<{ subject?: string } | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch(API, { signal: ac.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.resCd === "0000" && data.result?.info) {
          setInfo(data.result.info);
        }
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  if (!info) return null;

  return (
    <div className="bg-amber-600/90 text-white text-center text-sm py-2 px-4">
      <span className="font-bold">점검 중</span>
      {info.subject && <span className="ml-2">{info.subject}</span>}
    </div>
  );
}
