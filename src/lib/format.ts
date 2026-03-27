/** YYYYMMDD → YYYY.MM.DD */
export function formatDate(dt: string) {
  return `${dt.slice(0, 4)}.${dt.slice(4, 6)}.${dt.slice(6, 8)}`;
}

/** ISO date string → YYYY.MM.DD */
export function formatIsoDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/))([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

const ALLOWED_IMAGE_HOSTS = ["trimage.rhaon.co.kr", "tr.rhaon.co.kr"];

export function isSafeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      ALLOWED_IMAGE_HOSTS.some(
        (h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`),
      )
    );
  } catch {
    return false;
  }
}
