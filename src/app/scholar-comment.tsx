"use client";

import { useState } from "react";
import { ELIMS_CIRCULAR, R_CIRCULAR, KAI_CIRCULAR } from "@/lib/constants";

const CHARS = {
  elims: {
    name: "엘림스 스마일",
    img: ELIMS_CIRCULAR,
    color: "text-teal-400",
    ring: "ring-teal-500/30",
  },
  r: {
    name: "R",
    img: R_CIRCULAR,
    color: "text-white/40",
    ring: "ring-white/10",
  },
  drHell: {
    name: "닥터헬",
    img: "",
    color: "text-red-400",
    ring: "ring-red-500/30",
  },
  kai: {
    name: "카이",
    img: KAI_CIRCULAR,
    color: "text-purple-400",
    ring: "ring-purple-500/30",
  },
} as const;

type CharKey = keyof typeof CHARS;

interface Line {
  char: CharKey;
  text: string;
}

interface Props {
  lines: Line[];
}

// Shorthand for the common Elims + R pattern
interface SimpleProps {
  elims: string;
  r?: string;
}

function Avatar({ char, size }: { char: typeof CHARS[CharKey]; size: number }) {
  if (char.img) {
    return (
      <img
        src={char.img}
        alt={char.name}
        width={size}
        height={size}
        className={`shrink-0 rounded-full ring-1 ${char.ring} mt-0.5`}
      />
    );
  }
  return (
    <div
      className={`shrink-0 rounded-full ring-1 ${char.ring} mt-0.5 flex items-center justify-center bg-white/5 font-bold ${char.color}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {char.name[0]}
    </div>
  );
}

function CommentBox({ lines }: Props) {
  const [show, setShow] = useState(true);
  if (!show) return null;

  const main = lines[0];
  const replies = lines.slice(1);
  const mainChar = CHARS[main.char];

  return (
    <div className="mb-6 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm px-4 py-3 animate-fade-in">
      <div className="flex items-start gap-3">
        <Avatar char={mainChar} size={32} />
        <div className="min-w-0 flex-1">
          <span className={`text-[11px] font-bold ${mainChar.color}`}>
            {mainChar.name}
          </span>
          <p className="text-sm text-white/70 leading-relaxed">{main.text}</p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="shrink-0 text-white/20 hover:text-white/40 text-xs"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      {replies.map((line, i) => {
        const ch = CHARS[line.char];
        return (
          <div
            key={i}
            className="flex items-start gap-3 mt-2.5 ml-3 sm:ml-6 pl-3 sm:pl-5 border-l border-white/5"
          >
            <Avatar char={ch} size={24} />
            <div className="min-w-0">
              <span className={`text-[10px] font-bold ${ch.color}`}>
                {ch.name}
              </span>
              <p className="text-xs text-white/50 leading-relaxed">
                {line.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Simple wrapper for backward compatibility (Elims + R)
export function ScholarComment({ elims, r }: SimpleProps) {
  const lines: Line[] = [{ char: "elims", text: elims }];
  if (r) lines.push({ char: "r", text: r });
  return <CommentBox lines={lines} />;
}

// Full version with any character combo
export function CharacterComment({ lines }: Props) {
  return <CommentBox lines={lines} />;
}
