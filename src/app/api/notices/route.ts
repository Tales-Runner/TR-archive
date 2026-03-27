import { API_BASE } from "@/lib/constants";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/main/notices`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ resCd: "9999" }, { status: 502 });
  }
}
