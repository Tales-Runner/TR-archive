"use server";

import { headers } from "next/headers";
import { CATEGORY_LABEL_MAP, FEEDBACK_CATEGORIES } from "./categories";

const GITHUB_REPO = "Tales-Runner/TR-archive";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ALLOWED_CATEGORIES = new Set<string>(
  FEEDBACK_CATEGORIES.map((c) => c.value),
);

/* ── Rate Limiter ─────────────────────────────────────── */
// In-memory, per-instance. Good enough for a single low-traffic Vercel
// function; for horizontal scale move to Upstash/Redis. Opportunistically
// evicts stale IP keys so the Map doesn't grow unbounded on a warm worker.
const rateLimitMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const RATE_SWEEP_EVERY = 100;
let rateCallCount = 0;

function sweepRateLimit(now: number) {
  for (const [ip, ts] of rateLimitMap) {
    const live = ts.filter((t) => now - t < RATE_WINDOW_MS);
    if (live.length === 0) rateLimitMap.delete(ip);
    else if (live.length !== ts.length) rateLimitMap.set(ip, live);
  }
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (++rateCallCount % RATE_SWEEP_EVERY === 0) sweepRateLimit(now);

  const timestamps = (rateLimitMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (timestamps.length >= RATE_MAX) {
    rateLimitMap.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

interface FeedbackResult {
  ok: boolean;
  message: string;
  issueUrl?: string;
}

export async function submitFeedback(
  _prev: FeedbackResult | null,
  formData: FormData,
): Promise<FeedbackResult> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return { ok: false, message: "요청이 너무 많습니다. 1분 후 다시 시도해 주세요." };
  }

  const category = formData.get("category") as string;
  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const nickname = (formData.get("nickname") as string)?.trim() || "익명";

  // Whitelist category — otherwise a malicious client could forge arbitrary
  // GitHub label strings, since `labels: [..., category]` hits the API as-is
  // (non-existent labels are auto-created, polluting the repo).
  if (!ALLOWED_CATEGORIES.has(category)) {
    return { ok: false, message: "잘못된 분류입니다." };
  }

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

  const label = CATEGORY_LABEL_MAP[category] ?? "기타";
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
      console.error("GitHub API error:", res.status);
      return { ok: false, message: "건의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요." };
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
