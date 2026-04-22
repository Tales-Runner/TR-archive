import {
  GROUND_Y,
  PLAYER_W,
  PLAYER_X,
  VIEW_H,
  VIEW_W,
  type GameStateSnapshot,
} from "./engine";

/**
 * Game Boy DMG 파스텔 팔레트 (4색). 원본 정확 hex 가 아니라 현대 디스플레이
 * 에서 눈이 편하도록 살짝 warm 하게 조정한 값.
 */
export const LCD_PALETTE = {
  bg: "#9bbc0f", // 가장 밝음 (빈 하늘)
  light: "#8bac0f", // 밝은 그림자
  dark: "#306230", // 어두운 색
  ink: "#0f380f", // 가장 진함 (윤곽선)
} as const;

/**
 * 가상 144×108 캔버스를 실제 디스플레이 픽셀로 그린다. 호출측에서
 * canvas 크기를 VIEW_W × scale 로 맞춰두고 본 함수에 그 scale 을 전달.
 */
export function render(
  ctx: CanvasRenderingContext2D,
  s: GameStateSnapshot,
  scale: number,
  hiScore: number,
) {
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.scale(scale, scale);

  // --- background ---
  ctx.fillStyle = LCD_PALETTE.bg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  drawClouds(ctx, s.scroll);
  drawMountains(ctx, s.scroll);

  // --- ground ---
  ctx.fillStyle = LCD_PALETTE.dark;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = LCD_PALETTE.ink;
  ctx.fillRect(0, GROUND_Y, VIEW_W, 1);

  // 땅 무늬 — dithered 스크롤 라인
  ctx.fillStyle = LCD_PALETTE.ink;
  const grassOffset = Math.floor(s.scroll) % 8;
  for (let x = -grassOffset; x < VIEW_W; x += 4) {
    if ((Math.floor((x + s.scroll) / 4) & 1) === 0) {
      ctx.fillRect(x, GROUND_Y + 2, 2, 1);
    }
  }

  // --- coins ---
  for (const c of s.coins) {
    if (c.collected) continue;
    ctx.fillStyle = LCD_PALETTE.ink;
    ctx.fillRect(c.x, c.y, 3, 3);
    ctx.fillStyle = LCD_PALETTE.light;
    ctx.fillRect(c.x + 1, c.y + 1, 1, 1);
  }

  // --- obstacles ---
  for (const o of s.obstacles) {
    ctx.fillStyle = LCD_PALETTE.ink;
    if (o.kind === "stump") {
      // 그루터기 — 직사각형 + 위 한줄 라이트
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = LCD_PALETTE.dark;
      ctx.fillRect(o.x + 1, o.y + 1, o.w - 2, 2);
    } else if (o.kind === "rock") {
      // 돌 — 둥글게 보이도록 코너 한 픽셀씩 제거
      ctx.fillRect(o.x + 1, o.y, o.w - 2, o.h);
      ctx.fillRect(o.x, o.y + 1, o.w, o.h - 1);
      ctx.fillStyle = LCD_PALETTE.dark;
      ctx.fillRect(o.x + 2, o.y + 2, 3, 2);
    } else {
      // bird — 간단한 V 날개 (flap 애니메이션 2프레임)
      const frame = Math.floor(s.tick / 8) % 2;
      if (frame === 0) {
        ctx.fillRect(o.x, o.y + 2, 4, 1);
        ctx.fillRect(o.x + 4, o.y, 4, 1);
        ctx.fillRect(o.x + 8, o.y + 2, 4, 1);
      } else {
        ctx.fillRect(o.x, o.y, 4, 1);
        ctx.fillRect(o.x + 4, o.y + 2, 4, 1);
        ctx.fillRect(o.x + 8, o.y, 4, 1);
      }
    }
  }

  // --- player ---
  drawPlayer(ctx, s);

  // --- HUD ---
  drawHud(ctx, s, hiScore);

  // --- overlays ---
  if (s.state === "ready") {
    drawCenterText(ctx, "TAP / SPACE 로 시작", VIEW_H / 2);
  } else if (s.state === "over") {
    drawOverlay(ctx, s, hiScore);
  }

  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, s: GameStateSnapshot) {
  const { y, onGround } = s.player;
  const x = PLAYER_X;

  // 2프레임 달리기 애니메이션 — onGround 일 때만 토글
  const animFrame = onGround ? Math.floor(s.tick / 6) % 2 : 0;
  const legOffset = animFrame === 0 ? 0 : 1;

  ctx.fillStyle = LCD_PALETTE.ink;

  // body
  ctx.fillRect(x + 2, y + 2, PLAYER_W - 4, 6);
  // head
  ctx.fillStyle = LCD_PALETTE.dark;
  ctx.fillRect(x + 3, y, PLAYER_W - 6, 3);
  ctx.fillStyle = LCD_PALETTE.ink;
  ctx.fillRect(x + 3, y, PLAYER_W - 6, 1); // 머리카락/모자
  // eye (1px)
  ctx.fillStyle = LCD_PALETTE.bg;
  ctx.fillRect(x + 5, y + 1, 1, 1);

  // arms — 뻗은 정도로 달리는 모션 암시
  ctx.fillStyle = LCD_PALETTE.ink;
  if (onGround) {
    if (animFrame === 0) {
      ctx.fillRect(x + 1, y + 3, 1, 3);
      ctx.fillRect(x + PLAYER_W - 2, y + 4, 1, 2);
    } else {
      ctx.fillRect(x + 1, y + 4, 1, 2);
      ctx.fillRect(x + PLAYER_W - 2, y + 3, 1, 3);
    }
  } else {
    ctx.fillRect(x + 1, y + 3, 1, 2);
    ctx.fillRect(x + PLAYER_W - 2, y + 3, 1, 2);
  }

  // legs
  ctx.fillRect(x + 3, y + 8, 2, 4 - legOffset);
  ctx.fillRect(x + PLAYER_W - 5, y + 8 + legOffset, 2, 4 - legOffset);
}

// [baseX, y, width] 한 번만 정의 — 매 프레임 재할당 방지
const CLOUDS: ReadonlyArray<readonly [number, number, number]> = [
  [10, 16, 14],
  [55, 26, 10],
  [95, 12, 16],
  [130, 22, 12],
];

function drawClouds(ctx: CanvasRenderingContext2D, scroll: number) {
  ctx.fillStyle = LCD_PALETTE.light;
  const ox = Math.floor(scroll * 0.2) % 120;
  for (const [cx, cy, cw] of CLOUDS) {
    const x = ((cx - ox) % (VIEW_W + 40) + VIEW_W + 40) % (VIEW_W + 40) - 20;
    ctx.fillRect(x, cy, cw, 3);
    ctx.fillRect(x + 2, cy - 1, cw - 4, 1);
    ctx.fillRect(x + 2, cy + 3, cw - 4, 1);
  }
}

function drawMountains(ctx: CanvasRenderingContext2D, scroll: number) {
  ctx.fillStyle = LCD_PALETTE.light;
  const ox = Math.floor(scroll * 0.5) % 64;
  for (let x = -ox; x < VIEW_W; x += 32) {
    // 삼각형 근사 — 픽셀 계단
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(x + 6 + i, GROUND_Y - 10 + i, 20 - i * 2, 1);
    }
  }
}

// --- HUD / text ---

/**
 * 픽셀 폰트: 0-9, '.', '/', 'M', 콜론 정도만 필요. 3×5 그리드 미니멀.
 * 각 글리프는 "#" = on 픽셀을 나타내는 문자열 배열.
 */
const GLYPHS_3x5: Record<string, string[]> = {
  "0": ["###", "# #", "# #", "# #", "###"],
  "1": [" # ", "## ", " # ", " # ", "###"],
  "2": ["###", "  #", "###", "#  ", "###"],
  "3": ["###", "  #", "###", "  #", "###"],
  "4": ["# #", "# #", "###", "  #", "  #"],
  "5": ["###", "#  ", "###", "  #", "###"],
  "6": ["###", "#  ", "###", "# #", "###"],
  "7": ["###", "  #", "  #", "  #", "  #"],
  "8": ["###", "# #", "###", "# #", "###"],
  "9": ["###", "# #", "###", "  #", "###"],
  M: ["# #", "###", "###", "# #", "# #"],
  m: [" # ", "###", "###", "# #", "# #"],
  "★": ["  #", " ##", "###", " ##", "# #"],
  ":": [" ", "#", " ", "#", " "],
  " ": ["   ", "   ", "   ", "   ", "   "],
};

function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string = LCD_PALETTE.ink,
) {
  ctx.fillStyle = color;
  let cx = x;
  for (const ch of text) {
    const glyph = GLYPHS_3x5[ch] ?? GLYPHS_3x5[" "];
    for (let row = 0; row < glyph.length; row++) {
      for (let col = 0; col < glyph[row].length; col++) {
        if (glyph[row][col] === "#") {
          ctx.fillRect(cx + col, y + row, 1, 1);
        }
      }
    }
    cx += (glyph[0]?.length ?? 3) + 1;
  }
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  s: GameStateSnapshot,
  hiScore: number,
) {
  // distance (상단 좌측)
  drawPixelText(ctx, `${s.distance}m`, 3, 3);
  // coins (상단 우측)
  const coinStr = `★${s.coinsCollected}`;
  const w = coinStr.length * 4;
  drawPixelText(ctx, coinStr, VIEW_W - w - 3, 3);

  // 최고기록 — 현재보다 높은 값만 표시해서 HUD 혼잡 방지
  if (hiScore > 0 && hiScore > s.distance) {
    drawPixelText(ctx, `${hiScore}m`, 3, 11, LCD_PALETTE.dark);
  }
}

// (font, text) → 측정된 width. 매 프레임 같은 문자열을 재측정하지 않도록
// lazy 캐시. 글리프가 작고 종류가 한정돼 있어 무한 성장 위험 없음.
const textWidthCache = new Map<string, number>();
function measureCached(
  ctx: CanvasRenderingContext2D,
  font: string,
  text: string,
): number {
  const key = `${font}|${text}`;
  let w = textWidthCache.get(key);
  if (w === undefined) {
    ctx.font = font;
    w = ctx.measureText(text).width;
    textWidthCache.set(key, w);
  }
  return w;
}

function drawCenterText(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
) {
  // 한글은 3x5 글리프에 없으므로 네이티브 폰트 fallback — 다만 LCD 룩을
  // 최대한 유지하기 위해 dark color + 작은 사이즈.
  const font = "bold 7px monospace";
  const w = measureCached(ctx, font, text);
  ctx.fillStyle = LCD_PALETTE.ink;
  ctx.font = font;
  ctx.fillText(text, Math.floor((VIEW_W - w) / 2), y);
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  s: GameStateSnapshot,
  hiScore: number,
) {
  // 반투명 박스
  ctx.fillStyle = LCD_PALETTE.light;
  ctx.fillRect(16, 32, VIEW_W - 32, 44);
  ctx.fillStyle = LCD_PALETTE.ink;
  ctx.fillRect(16, 32, VIEW_W - 32, 1);
  ctx.fillRect(16, 75, VIEW_W - 32, 1);
  ctx.fillRect(16, 32, 1, 44);
  ctx.fillRect(VIEW_W - 17, 32, 1, 44);

  const titleFont = "bold 8px monospace";
  const titleW = measureCached(ctx, titleFont, "GAME OVER");
  ctx.fillStyle = LCD_PALETTE.ink;
  ctx.font = titleFont;
  ctx.fillText("GAME OVER", Math.floor((VIEW_W - titleW) / 2), 44);

  drawPixelText(
    ctx,
    `${s.distance}m`,
    Math.floor((VIEW_W - String(s.distance).length * 4 - 4) / 2),
    52,
  );

  const best = Math.max(s.distance, hiScore);
  drawPixelText(
    ctx,
    `★${best}m`,
    Math.floor((VIEW_W - (String(best).length * 4 + 5)) / 2),
    60,
    LCD_PALETTE.dark,
  );

  const retryFont = "6px monospace";
  const retryW = measureCached(ctx, retryFont, "TAP 로 다시");
  ctx.font = retryFont;
  ctx.fillText("TAP 로 다시", Math.floor((VIEW_W - retryW) / 2), 70);
}
