"use client";

import DOMPurify from "dompurify";

// DOMPurify needs the browser DOM. Load this component only on the client,
// including when a shared URL opens a guide on the initial page request.
export default function GuideContent({ html }: { html: string }) {
  let sanitized: string;
  try {
    sanitized = DOMPurify.sanitize(html);
  } catch {
    return <p className="p-5 text-sm text-white/50">콘텐츠를 표시할 수 없습니다</p>;
  }
  return <div className="guide-content p-3 sm:p-5" dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
