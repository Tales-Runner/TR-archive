"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TYPEWRITER_SPEED_MS } from "@/lib/constants";

const FIRST_VISIT = [
  "호오, 내 기록을 보러 온 건가?",
  "런너들의 능력부터 이 세계의 이야기까지. 꽤 쓸 만한 것들을 모아 뒀지.",
  "크크, 보는 눈은 있군. 자, 뭐부터 알고 싶지?",
];

const RETURN_VISIT = [
  "또 왔군. 내 기록이 제법 쓸 만했던 모양이지?",
  "그래서, 이번엔 뭘 알아볼 텐가?",
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
  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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
    typingTimer.current = timer;
    return () => {
      clearInterval(timer);
      typingTimer.current = null;
    };
  }, [dialogIdx, currentText]);

  function handleClick() {
    if (isTyping) {
      if (typingTimer.current !== null) {
        clearInterval(typingTimer.current);
        typingTimer.current = null;
      }
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
      <button
        type="button"
        onClick={handleClick}
        aria-label={`${currentText} ${isTyping ? "대사 전체 보기" : showChoices ? "엘림스의 대사" : "다음 대사"}`}
        className="relative block w-full cursor-pointer rounded-t-2xl border border-white/10 bg-black/70 backdrop-blur-md px-6 pt-4 pb-5 text-left select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400"
      >
        <span className="absolute -top-4 left-5 rounded-lg bg-teal-600 px-4 py-1 text-sm font-bold text-white shadow-lg">
          엘림스 스마일
        </span>

        <span className="mt-2 block min-h-[3.5rem] text-[15px] leading-relaxed text-white/90 font-[var(--font-sans)]">
          {displayedText}
          {isTyping && (
            <span className="ml-0.5 inline-block w-[2px] h-[1em] bg-white/70 animate-pulse align-middle" />
          )}
        </span>

        {!isTyping && !showChoices && (
          <span aria-hidden="true" className="absolute bottom-2 right-4 text-xs text-white/40 animate-pulse">
            ▼
          </span>
        )}
      </button>

      {showChoices && (
        <div className={`mt-3 grid gap-2 ${choices.length > 4 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          {choices.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm px-5 py-3.5 transition-all hover:border-teal-400/50 hover:bg-teal-950/50"
            >
              <span className="text-sm font-medium text-white/90 group-hover:text-teal-300">
                ▸ {c.label}
              </span>
              <span className="ml-2 text-xs text-white/40">{c.sub}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
