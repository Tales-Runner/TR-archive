"use client";

import { useState } from "react";
import { submitFeedback } from "./actions";
import { FEEDBACK_CATEGORIES } from "./categories";

export function FeedbackForm() {
  const [category, setCategory] = useState("feature");
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; issueUrl?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setResult(null);

    const fd = new FormData();
    fd.set("category", category);
    fd.set("nickname", nickname);
    fd.set("title", title);
    fd.set("body", body);

    const res = await submitFeedback(null, fd);
    setResult(res);
    setPending(false);

    // 성공 시에만 폼 비우기
    if (res.ok) {
      setTitle("");
      setBody("");
      setNickname("");
    }
  }

  if (result?.ok) {
    return (
      <div className="rounded-xl border border-teal-500/20 bg-teal-950/30 p-6 text-center animate-scale-in">
        <div className="text-2xl mb-3">✓</div>
        <h3 className="text-lg font-bold text-teal-300 mb-2">{result.message}</h3>
        <p className="text-sm text-white/50 mb-4">
          소중한 의견 감사합니다. 확인 후 반영하겠습니다.
        </p>
        {result.issueUrl && (
          <a
            href={result.issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-white/5 px-4 py-2 text-sm text-teal-300 hover:bg-white/10 transition-colors"
          >
            GitHub에서 확인하기 →
          </a>
        )}
        <div className="mt-4">
          <button
            onClick={() => setResult(null)}
            className="text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            다른 건의 작성하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-white/50">분류</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FEEDBACK_CATEGORIES.map((cat) => (
            <label
              key={cat.value}
              className={`cursor-pointer rounded-xl border p-3 text-center transition-all hover:border-teal-500/30 hover:bg-white/[0.04] ${
                category === cat.value
                  ? "border-teal-500/50 bg-teal-950/30"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={cat.value}
                checked={category === cat.value}
                onChange={(e) => setCategory(e.target.value)}
                className="sr-only"
              />
              <div className="text-sm font-medium text-white/80">{cat.label}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{cat.desc}</div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Nickname */}
      <div>
        <label htmlFor="nickname" className="mb-1.5 block text-sm font-medium text-white/50">
          닉네임 <span className="text-white/40">(선택)</span>
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          placeholder="익명"
          maxLength={30}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50 transition-colors"
        />
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-white/50">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={100}
          placeholder="한 줄로 요약해 주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50 transition-colors"
        />
      </div>

      {/* Body */}
      <div>
        <label htmlFor="body" className="mb-1.5 block text-sm font-medium text-white/50">
          내용
        </label>
        <textarea
          id="body"
          name="body"
          required
          minLength={5}
          maxLength={3000}
          rows={6}
          placeholder="자세히 설명해 주세요. 스크린샷 URL이 있으면 함께 첨부해 주세요."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-teal-500/50 transition-colors"
        />
      </div>

      {/* Error */}
      {result && !result.ok && (
        <div className="rounded-lg border border-red-500/20 bg-red-950/20 px-4 py-2.5 text-sm text-red-300">
          {result.message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal-600 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "전송 중..." : "건의하기"}
      </button>

      <p className="text-[11px] text-white/40 text-center">
        건의 내용은 GitHub Issues에 등록됩니다. 개인정보를 포함하지 마세요.
      </p>
    </form>
  );
}
