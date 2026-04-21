import { API_BASE, UPSTREAM_USER_AGENT } from "@/lib/constants";
import { logger } from "@/lib/logger";

// upstream (tr.rhaon.co.kr) 의 Cloudflare 가 non-KR IP 대역을 거부한다.
// Vercel Hobby 는 프로젝트 단위 리전이 한 군데로 고정되지만, Route
// 단위 `preferredRegion` 을 서울(icn1)로 지정하면 이 함수만큼은 해당
// 리전에서 실행돼 upstream 과 통신 가능.
export const preferredRegion = "icn1";
export const runtime = "nodejs";

export async function GET() {
  const url = `${API_BASE}/main/notices`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { "User-Agent": UPSTREAM_USER_AGENT },
    });
    const data = await res.json();
    logger.info("Fetched notices", { status: res.status });
    return Response.json(data);
  } catch (err) {
    logger.error("Failed to fetch notices", {
      url,
      error: err instanceof Error ? err.message : String(err),
    });
    return Response.json({ resCd: "9999" }, { status: 502 });
  }
}
