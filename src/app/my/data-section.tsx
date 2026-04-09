"use client";

import { useRef } from "react";
import { db } from "@/lib/db";
import { useToast } from "@/components/toast";

export function DataSection() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    const data = await db.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elims-archive-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("백업 파일을 다운로드했습니다");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (typeof data !== "object" || data === null) throw new Error("invalid");
      const { runners, costumes, stories, maps, profile } = data;
      if (runners !== undefined && !Array.isArray(runners)) throw new Error("invalid");
      if (costumes !== undefined && !Array.isArray(costumes)) throw new Error("invalid");
      if (stories !== undefined && !Array.isArray(stories)) throw new Error("invalid");
      if (maps !== undefined && !Array.isArray(maps)) throw new Error("invalid");
      if (profile !== undefined && (typeof profile !== "object" || profile === null)) throw new Error("invalid");
      await db.importAll(data);
      toast("데이터를 복원했습니다. 새로고침해 주세요.");
    } catch {
      toast("올바른 백업 파일이 아닙니다");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-card p-6 animate-fade-in">
      <h2 className="text-lg font-bold text-white/90 mb-1">데이터 관리</h2>
      <p className="text-xs text-white/40 mb-4">
        프로필과 모든 기록을 JSON으로 백업하거나 복원할 수 있습니다
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 transition-colors"
        >
          내보내기
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 transition-colors"
        >
          가져오기
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </div>
  );
}
