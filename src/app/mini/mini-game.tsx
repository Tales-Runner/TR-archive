"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialState,
  step,
  VIEW_H,
  VIEW_W,
  type GameState,
  type GameStateSnapshot,
} from "./engine";
import { render } from "./renderer";

const HI_SCORE_KEY = "tr-mini:hiscore";

/**
 * 피처폰 감성 LCD 러너. 가상 144×108 캔버스를 실제 뷰포트에 정수배
 * 스케일 (최대 6배) 로 확대. requestAnimationFrame 루프는 엔진 step 을
 * 60fps 로 호출 — state 는 ref 에 두고 상태 읽기용 mirror 만 useState.
 */
export function MiniGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameStateSnapshot>(initialState());
  const inputRef = useRef({ jumpPressed: false, startPressed: false });
  const [hiScore, setHiScore] = useState(0);
  const hiScoreRef = useRef(0);
  // 게임 상태는 ref 에서 매 프레임 흐르고, UI 표시용으로 상태 라벨만
  // mirror — 전체 snapshot 을 state 로 두면 매 프레임 리렌더 발생.
  const [stateLabel, setStateLabel] = useState<GameState>("ready");
  const [scale, setScale] = useState(4);

  // --- hi score persistence ---
  // Render-time hydration — useEffect 안 setState 는 React Compiler lint
  // 가 금지. one-shot 체크 + window 가드로 SSR 안전 + 한 번만 실행.
  const [hiHydrated, setHiHydrated] = useState(false);
  if (!hiHydrated && typeof window !== "undefined") {
    setHiHydrated(true);
    try {
      const saved = Number(localStorage.getItem(HI_SCORE_KEY));
      if (Number.isFinite(saved) && saved > 0) setHiScore(saved);
    } catch {}
  }

  // hiScore 를 ref 로 mirror — 게임 루프 내에서 stale closure 방지.
  useEffect(() => {
    hiScoreRef.current = hiScore;
  }, [hiScore]);

  // --- responsive scale ---
  useEffect(() => {
    function recompute() {
      // 컨테이너 폭에 맞춰 정수배 스케일. 1-6배 범위.
      const maxW = Math.min(window.innerWidth - 32, 720);
      const maxH = window.innerHeight * 0.7;
      const byW = Math.floor(maxW / VIEW_W);
      const byH = Math.floor(maxH / VIEW_H);
      const s = Math.max(1, Math.min(byW, byH, 6));
      setScale(s);
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

  // --- input handlers ---
  const doJump = useCallback(() => {
    if (stateRef.current.state === "ready" || stateRef.current.state === "over") {
      inputRef.current.startPressed = true;
    }
    inputRef.current.jumpPressed = true;
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        doJump();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doJump]);

  // --- game loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;

    function loop() {
      if (!running) return;
      const input = inputRef.current;
      const prev = stateRef.current;
      const next = step(prev, input);

      // 게임오버 전이 시 hiScore 갱신
      if (prev.state === "running" && next.state === "over") {
        if (next.distance > hiScoreRef.current) {
          hiScoreRef.current = next.distance;
          setHiScore(next.distance);
          try {
            localStorage.setItem(HI_SCORE_KEY, String(next.distance));
          } catch {}
        }
      }

      stateRef.current = next;
      inputRef.current = { jumpPressed: false, startPressed: false };

      render(ctx!, next, scale, hiScoreRef.current);

      // 상태 변화가 UI 에 영향 있는 전이만 mirror 갱신 (불필요 리렌더 방지)
      if (next.state !== prev.state) {
        setStateLabel(next.state);
      }

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [scale]);

  // canvas 크기는 실제 픽셀로; 좌표계 스케일은 render 함수가 처리
  const cssWidth = VIEW_W * scale;
  const cssHeight = VIEW_H * scale;

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <canvas
        ref={canvasRef}
        width={cssWidth}
        height={cssHeight}
        aria-label="테일즈런너 미니게임 캔버스"
        role="img"
        onPointerDown={(e) => {
          e.preventDefault();
          doJump();
        }}
        className="rounded-sm shadow-[0_0_0_2px_#0f380f,0_0_0_6px_#306230] touch-none"
        style={{ imageRendering: "pixelated" }}
      />

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-white/50">
        <span>
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">SPACE</kbd>{" "}
          / <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">↑</kbd>{" "}
          / 탭 = 점프
        </span>
        <span className="text-white/40">최고 {hiScore}m</span>
        <span className="text-white/30">상태: {labelForState(stateLabel)}</span>
      </div>

      <p className="max-w-xl text-center text-[11px] leading-relaxed text-white/35">
        테일즈런너는 원래 피처폰 시절 모바일 횡스크롤 게임으로 기획됐다가
        PC 레이싱으로 피봇한 역사가 있다. 그 시절 LCD 도트 감성을 팬게임으로
        되살린 미니 버전. 캐릭터는 추후 엘림스 / R / 카이 선택 가능하게 확장
        예정.
      </p>
    </div>
  );
}

function labelForState(s: GameState): string {
  switch (s) {
    case "ready":
      return "대기";
    case "running":
      return "플레이";
    case "over":
      return "종료";
  }
}
