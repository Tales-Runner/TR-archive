import type { Metadata } from "next";
import { FeedbackForm } from "./feedback-form";
import { ScholarComment } from "../scholar-comment";

export const metadata: Metadata = {
  title: "건의함 - 엘림스 스마일의 아카이브",
  description: "아카이브에 대한 건의, 버그 제보, 데이터 오류 신고",
  openGraph: {
    title: "건의함 - 엘림스 스마일의 아카이브",
    description: "아카이브에 대한 건의, 버그 제보, 데이터 오류 신고",
  },
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-accent-light">건의함</h1>
      <p className="mb-6 text-sm text-white/40">
        버그 제보, 기능 건의, 데이터 오류 신고 — 뭐든 괜찮아.
      </p>
      <ScholarComment
        elims="호오, 할 말이 있나? 어디, 적어 봐. 불편한 게 있다면 구체적으로 말해 주는 편이 좋겠군."
      />
      <FeedbackForm />
    </div>
  );
}
