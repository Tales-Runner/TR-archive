"use client";

import { useState, useEffect, useRef } from "react";

export function WebtoonImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(!!priority);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  return (
    <div
      ref={ref}
      className="w-full leading-[0]"
      style={{
        minHeight: loaded ? undefined : 200,
        background: loaded ? "transparent" : "rgba(255,255,255,0.03)",
      }}
    >
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`block w-full align-top transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          draggable={false}
        />
      )}
    </div>
  );
}
