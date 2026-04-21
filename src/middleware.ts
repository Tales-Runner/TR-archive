import { NextRequest, NextResponse } from "next/server";

/**
 * CSP nonce middleware.
 *
 * Generates a fresh base64 nonce per request, injects it into the CSP via
 * `script-src 'nonce-...' 'strict-dynamic'`, and forwards the nonce to the
 * render layer via `x-nonce` header (Next picks it up automatically for
 * built-in inline scripts, and `next/script` reads it too).
 *
 * Trade-off: this route is no longer statically cacheable — every request
 * needs a fresh nonce. The `matcher` excludes static assets so they stay
 * on the CDN.
 *
 * Headers that don't depend on per-request state live in `next.config.ts`
 * (HSTS, X-Frame-Options, Permissions-Policy, …). Keeping the nonce-bound
 * CSP here avoids a brittle coordination between the two places.
 */
export function middleware(request: NextRequest) {
  const nonce = generateNonce();

  const csp = [
    "default-src 'self'",
    // `'strict-dynamic'` tells browsers that support CSP3 to trust any
    // script loaded transitively by a nonced script, and to ignore the
    // other allow-list sources. `'unsafe-inline'` + https: remain as
    // fallbacks for CSP1/2 browsers (they simply ignore 'strict-dynamic').
    `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:`,
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "img-src 'self' https://trimage.rhaon.co.kr data:",
    "font-src 'self' https://cdn.jsdelivr.net",
    "connect-src 'self' https://tr.rhaon.co.kr",
    "frame-src https://www.youtube-nocookie.com",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("content-security-policy", csp);
  return response;
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // btoa isn't available on every edge runtime fork; go via
  // String.fromCharCode + Buffer shim or use base64url by hand.
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export const config = {
  matcher: [
    /*
     * Apply to every route except:
     *   - _next/static (build artifacts, immutable, served directly)
     *   - _next/image  (image optimization, own caching)
     *   - favicon.ico, robots.txt, sitemap.xml, manifest.json, sw.js (static)
     *   - public assets with a file extension (.png, .svg, etc.)
     *
     * The `?!` negative lookahead keeps the SW + manifest nonce-free so the
     * browser can cache them without the CSP re-issuing on every request.
     */
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|sw.js|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|woff2?)).*)",
    },
  ],
};
