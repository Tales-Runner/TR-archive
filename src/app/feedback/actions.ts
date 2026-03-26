"use server";

const GITHUB_REPO = "Tales-Runner/TR-archive";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const CATEGORY_LABELS: Record<string, string> = {
  bug: "버그 제보",
  feature: "기능 건의",
  data: "데이터 오류",
  other: "기타",
};

interface FeedbackResult {
  ok: boolean;
  message: string;
  issueUrl?: string;
}

export async function submitFeedback(
  _prev: FeedbackResult | null,
  formData: FormData,
): Promise<FeedbackResult> {
  const category = formData.get("category") as string;
  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const nickname = (formData.get("nickname") as string)?.trim() || "익명";

  if (!title || title.length < 2) {
    return { ok: false, message: "제목을 2자 이상 입력해 주세요." };
  }
  if (!body || body.length < 5) {
    return { ok: false, message: "내용을 5자 이상 입력해 주세요." };
  }
  if (title.length > 100) {
    return { ok: false, message: "제목이 너무 깁니다 (100자 이하)." };
  }
  if (body.length > 3000) {
    return { ok: false, message: "내용이 너무 깁니다 (3000자 이하)." };
  }

  if (!GITHUB_TOKEN) {
    return { ok: false, message: "서버 설정 오류: 토큰이 없습니다. 관리자에게 문의해 주세요." };
  }

  const label = CATEGORY_LABELS[category] ?? "기타";
  const issueTitle = `[${label}] ${title}`;
  const issueBody = [
    `**분류:** ${label}`,
    `**작성자:** ${nickname}`,
    "",
    "---",
    "",
    body,
    "",
    "---",
    `> 아카이브 건의함에서 자동 생성됨`,
  ].join("\n");

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels: ["feedback", category],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("GitHub API error:", res.status, err);
      return { ok: false, message: "전송에 실패했습니다. 잠시 후 다시 시도해 주세요." };
    }

    const issue = await res.json();
    return {
      ok: true,
      message: "건의가 접수되었습니다!",
      issueUrl: issue.html_url,
    };
  } catch (e) {
    console.error("Feedback submit error:", e);
    return { ok: false, message: "네트워크 오류. 잠시 후 다시 시도해 주세요." };
  }
}
