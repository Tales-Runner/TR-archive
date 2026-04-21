import { API_BASE, UPSTREAM_USER_AGENT } from "@/lib/constants";
import { logger } from "@/lib/logger";

// See src/app/api/notices/route.ts 의 preferredRegion 설명.
// upstream Cloudflare 가 non-KR IP 를 차단하므로 icn1(서울) 에서 실행.
export const preferredRegion = "icn1";
export const runtime = "nodejs";

export async function GET() {
  const url = `${API_BASE}/code/maintenance`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { "User-Agent": UPSTREAM_USER_AGENT },
    });
    const data = await res.json();
    logger.info("Fetched maintenance status", { status: res.status });
    return Response.json(data);
  } catch (err) {
    logger.error("Failed to fetch maintenance status", {
      url,
      error: err instanceof Error ? err.message : String(err),
    });
    return Response.json({ resCd: "9999" }, { status: 502 });
  }
}
