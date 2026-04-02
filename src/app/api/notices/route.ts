import { API_BASE } from "@/lib/constants";
import { logger } from "@/lib/logger";

export async function GET() {
  const url = `${API_BASE}/main/notices`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
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
