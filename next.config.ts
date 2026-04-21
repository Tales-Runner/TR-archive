import type { NextConfig } from "next";

// Pretendard 웹폰트는 CDN (jsdelivr) 에서 로드 — 스타일시트 + 폰트 파일
// 양쪽 출처를 CSP 에 열어줘야 한다. 데이터 API / 이미지 CDN 도 명시.
const CDN_ORIGINS = {
  fonts: "https://cdn.jsdelivr.net",
  images: "https://trimage.rhaon.co.kr",
  api: "https://tr.rhaon.co.kr",
  youtube: "https://www.youtube-nocookie.com",
} as const;

/**
 * CSP 설계 노트
 *
 * - `'unsafe-inline'` 은 Next 의 hydration / runtime bootstrap 스크립트
 *   때문에 아직 유지. nonce 기반 strict-dynamic 으로 올리려면 모든
 *   라우트가 dynamic(SSR) 이 돼야 하는데 이 앱은 17/20 라우트가 SSG.
 *   보안 vs 비용 trade-off 에서 static 캐싱 유지를 선택했다.
 *
 * - `frame-ancestors 'none'` 가 X-Frame-Options 를 완전히 대체하지만
 *   일부 구버전 브라우저 호환을 위해 둘 다 유지
 *
 * - `upgrade-insecure-requests` 로 혼합 콘텐츠 자동 업그레이드
 *
 * - `manifest-src 'self'` / `worker-src 'self'` 는 PWA 매니페스트 + SW
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      `style-src 'self' 'unsafe-inline' ${CDN_ORIGINS.fonts}`,
      `img-src 'self' ${CDN_ORIGINS.images} data:`,
      `font-src 'self' ${CDN_ORIGINS.fonts}`,
      `connect-src 'self' ${CDN_ORIGINS.api}`,
      `frame-src ${CDN_ORIGINS.youtube}`,
      "worker-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trimage.rhaon.co.kr",
      },
    ],
  },
  headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
