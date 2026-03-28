import { describe, it, expect } from "vitest";
import { formatDate, formatIsoDate, youtubeId, isSafeImageUrl } from "./format";

describe("formatDate", () => {
  it("YYYYMMDD 형식을 YYYY.MM.DD로 변환", () => {
    expect(formatDate("20231225")).toBe("2023.12.25");
  });

  it("연초 날짜도 올바르게 변환", () => {
    expect(formatDate("20240101")).toBe("2024.01.01");
  });

  it("경계값: 연말", () => {
    expect(formatDate("20251231")).toBe("2025.12.31");
  });
});

describe("formatIsoDate", () => {
  it("ISO 문자열을 YYYY.MM.DD 포맷으로 변환", () => {
    const result = formatIsoDate("2023-12-25T00:00:00Z");
    expect(result).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });

  it("월/일이 한 자리일 때 0으로 패딩", () => {
    const result = formatIsoDate("2024-01-05T12:00:00Z");
    expect(result).toMatch(/^2024\.01\.0[45]$/);
  });
});

describe("youtubeId", () => {
  it("표준 youtube.com URL에서 ID 추출", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("youtu.be 단축 URL에서 ID 추출", () => {
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("embed URL에서 ID 추출", () => {
    expect(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("유효하지 않은 URL은 null 반환", () => {
    expect(youtubeId("https://example.com/video")).toBeNull();
  });

  it("빈 문자열은 null 반환", () => {
    expect(youtubeId("")).toBeNull();
  });

  it("추가 쿼리 파라미터가 있어도 ID 추출", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42")).toBe("dQw4w9WgXcQ");
  });
});

describe("isSafeImageUrl", () => {
  it("허용된 호스트(trimage.rhaon.co.kr)는 true", () => {
    expect(isSafeImageUrl("https://trimage.rhaon.co.kr/images/test.png")).toBe(true);
  });

  it("허용된 호스트(tr.rhaon.co.kr)는 true", () => {
    expect(isSafeImageUrl("https://tr.rhaon.co.kr/path/image.jpg")).toBe(true);
  });

  it("서브도메인도 허용", () => {
    expect(isSafeImageUrl("https://cdn.trimage.rhaon.co.kr/img.png")).toBe(true);
  });

  it("HTTP는 거부 (HTTPS만 허용)", () => {
    expect(isSafeImageUrl("http://trimage.rhaon.co.kr/images/test.png")).toBe(false);
  });

  it("허용되지 않은 호스트는 거부", () => {
    expect(isSafeImageUrl("https://evil.com/images/test.png")).toBe(false);
  });

  it("잘못된 URL은 거부", () => {
    expect(isSafeImageUrl("not-a-url")).toBe(false);
  });

  it("빈 문자열은 거부", () => {
    expect(isSafeImageUrl("")).toBe(false);
  });

  it("호스트 이름이 유사하지만 다른 도메인은 거부", () => {
    expect(isSafeImageUrl("https://faketrimage.rhaon.co.kr/img.png")).toBe(false);
  });
});
