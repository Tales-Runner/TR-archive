import type { Metadata } from "next";
import { FeedbackForm } from "./feedback-form";
import { ScholarComment } from "../scholar-comment";

export const metadata: Metadata = {
  title: "건의함 - 엘림스의 비공식 아카이브",
  description: "아카이브에 대한 건의, 버그 제보, 데이터 오류 신고",
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">건의함</h1>
      <p className="mb-6 text-sm text-white/40">
        버그 제보, 기능 건의, 데이터 오류 신고 — 뭐든 괜찮아.
      </p>
      <ScholarComment
        elims="할 말이 있으면 여기에 적어. 내가 다 확인하니까."
      />
      <FeedbackForm />
    </div>
  );
}
