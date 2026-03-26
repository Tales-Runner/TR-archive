"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TYPEWRITER_SPEED_MS } from "@/lib/constants";

const FIRST_VISIT = [
  "...뭐야, 또 왔군.",
  "여긴 내가 정리해 둔 비공식 아카이브다. 공식엔 없는 것들도 있지.",
  "크크, 감동받아서 울지나 말라고.",
  "그래서 무슨 용건으로 찾아왔지? 어서 얘기해보라구. 난 바쁜 몸이니까 말이야.",
];

const RETURN_VISIT = [
  "뭐야, 또 왔나?",
  "이번엔 무슨 용건이지?",
];

interface Choice {
  href: string;
  label: string;
  sub: string;
}

export function VNScene({ choices }: { choices: Choice[] }) {
  const [dialogues, setDialogues] = useState(FIRST_VISIT);
  const [dialogIdx, setDialogIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const currentText = dialogues[dialogIdx];
  const isLastDialog = dialogIdx === dialogues.length - 1;
  const showChoices = !isTyping && isLastDialog;

  // Check return visit (client-only to avoid hydration mismatch)
  useEffect(() => {
    try {
      if (localStorage.getItem("elims-visited")) {
        setDialogues(RETURN_VISIT);
      }
      localStorage.setItem("elims-visited", "1");
    } catch {}
  }, []);

  // Typewriter effect
  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayedText(currentText.slice(0, i));
      if (i >= currentText.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, TYPEWRITER_SPEED_MS);
    return () => clearInterval(timer);
  }, [dialogIdx, currentText]);

  function handleClick() {
    if (isTyping) {
      setDisplayedText(currentText);
      setIsTyping(false);
      return;
    }
    if (!isLastDialog) {
      setDialogIdx((d) => d + 1);
    }
  }

  return (
    <div className="relative z-20 w-full max-w-3xl px-4 pb-6">
      <div
        onClick={handleClick}
        className="relative cursor-pointer rounded-t-2xl border border-white/10 bg-black/70 backdrop-blur-md px-6 pt-4 pb-5 select-none"
      >
        <div className="absolute -top-4 left-5 rounded-lg bg-teal-600 px-4 py-1 text-sm font-bold text-white shadow-lg">
          엘림스 스마일
        </div>

        <p className="mt-2 min-h-[3.5rem] text-[15px] leading-relaxed text-white/90 font-[var(--font-sans)]">
          {displayedText}
          {isTyping && (
            <span className="ml-0.5 inline-block w-[2px] h-[1em] bg-white/70 animate-pulse align-middle" />
          )}
        </p>

        {!isTyping && !showChoices && (
          <div className="absolute bottom-2 right-4 text-xs text-white/40 animate-pulse">
            ▼
          </div>
        )}
      </div>

      {showChoices && (
        <div className={`mt-3 grid gap-2 ${choices.length > 4 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          {choices.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm px-5 py-3 transition-all hover:border-teal-400/50 hover:bg-teal-950/50"
            >
              <span className="text-sm font-medium text-white/90 group-hover:text-teal-300">
                ▸ {c.label}
              </span>
              <span className="ml-2 text-xs text-white/30">{c.sub}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
