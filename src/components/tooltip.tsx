"use client";

import { useState, useRef } from "react";

export function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#1a1530]/95 backdrop-blur-md px-3 py-1.5 text-xs text-white/80 shadow-lg shadow-black/30 animate-tooltip pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#1a1530]/95" />
        </div>
      )}
    </div>
  );
}
