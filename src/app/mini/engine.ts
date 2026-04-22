/**
 * Endless-runner engine for 테일즈런너 미니 (feature-phone homage).
 *
 * 의도적으로 React / DOM 비의존. 단일 virtual canvas 좌표계 (144×108) 에서
 * 동작하고, 렌더러는 이 state 를 읽어 그린다. 추후 별도 레포 (heznpc/
 * tr-fan-game) 로 분리할 수 있도록 tr-archive 특화 import 없음.
 *
 * 해상도 선택: 144×108 은 피처폰 시절 QVGA 일부 기종의 가로 바이너리
 * 해상도와 비슷하고, 16:12 = 4:3 로 Game Boy 원비 (160×144) 와
 * 근친. 픽셀 1칸 = 가상 1 단위.
 */

export const VIEW_W = 144;
export const VIEW_H = 108;
export const GROUND_Y = 88; // 플레이어 발이 닿는 y 기준선

const GRAVITY = 0.45;
const JUMP_V = -6.2;
export const PLAYER_X = 36;
export const PLAYER_W = 10;
export const PLAYER_H = 12;

const MIN_GAP = 48; // 장애물 사이 최소 간격 (px, 가상 좌표)
const MAX_GAP = 96;

export type ObstacleKind = "stump" | "rock" | "bird";

export interface Obstacle {
  kind: ObstacleKind;
  x: number;
  y: number; // ground-line 기준 top-y; 지상 장애물은 GROUND_Y - h
  w: number;
  h: number;
  /** 판정 여유 — 너무 타이트하면 프레임 단위로 불공정해짐 */
  hitboxInset: number;
}

export interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

export type GameState = "ready" | "running" | "over";

export interface GameStateSnapshot {
  state: GameState;
  tick: number;
  /** world scroll offset (px). 플레이어는 고정, 배경/장애물이 좌로 흐름 */
  scroll: number;
  speed: number;
  player: {
    y: number;
    vy: number;
    onGround: boolean;
    /** 점프 직후 잠깐 강제되는 플래그 — 버퍼 + coyote 용 */
    sinceJump: number;
  };
  obstacles: Obstacle[];
  coins: Coin[];
  /** 달린 거리 (m) — scroll / 10 반올림 */
  distance: number;
  coinsCollected: number;
  /** 파티클 / 효과용 seed */
  rng: number;
}

export interface GameInput {
  /** 현재 프레임에 점프 입력이 눌렸는지 (엣지) */
  jumpPressed: boolean;
  /** 현재 시작 / 재시작 입력 (엣지) */
  startPressed: boolean;
}

export function initialState(): GameStateSnapshot {
  return {
    state: "ready",
    tick: 0,
    scroll: 0,
    speed: 2.0,
    player: { y: GROUND_Y - PLAYER_H, vy: 0, onGround: true, sinceJump: 0 },
    obstacles: [],
    coins: [],
    distance: 0,
    coinsCollected: 0,
    rng: 1,
  };
}

/** LCG — 재현 가능한 랜덤, seed-based 장애물 스폰에 쓴다 */
function nextRng(rng: number): number {
  return (rng * 1664525 + 1013904223) >>> 0;
}

function randRange(rng: number, min: number, max: number): [number, number] {
  const n = nextRng(rng);
  return [min + (n % (max - min + 1)), n];
}

function difficultyForTick(tick: number): { speed: number; gapScale: number } {
  // 0~1800틱 (30초) 동안 천천히 가속, 이후 완만하게 계속.
  const t = tick / 60; // 초
  const speed = Math.min(2.0 + t * 0.06, 5.5);
  const gapScale = Math.max(1.0 - t * 0.004, 0.55);
  return { speed, gapScale };
}

function spawnObstacle(
  rng: number,
  lastRightEdge: number,
  gapScale: number,
): { obstacle: Obstacle; rng: number } {
  const [kindRoll, rng1] = randRange(rng, 0, 9);
  const [gap, rng2] = randRange(
    rng1,
    Math.floor(MIN_GAP * gapScale),
    Math.floor(MAX_GAP * gapScale),
  );

  let obstacle: Obstacle;
  if (kindRoll < 5) {
    // stump — 낮은 그루터기, 반드시 점프해야 통과
    const h = 10;
    obstacle = {
      kind: "stump",
      x: lastRightEdge + gap,
      y: GROUND_Y - h,
      w: 8,
      h,
      hitboxInset: 1,
    };
  } else if (kindRoll < 8) {
    // rock — 좀 더 큰 돌
    const h = 14;
    obstacle = {
      kind: "rock",
      x: lastRightEdge + gap,
      y: GROUND_Y - h,
      w: 12,
      h,
      hitboxInset: 2,
    };
  } else {
    // bird — 낮은 비행체, 숙이기 불가라 점프 타이밍이 중요 (타이트한 점프)
    const h = 6;
    obstacle = {
      kind: "bird",
      x: lastRightEdge + gap,
      y: GROUND_Y - 22,
      w: 12,
      h,
      hitboxInset: 1,
    };
  }
  return { obstacle, rng: rng2 };
}

function spawnCoinArc(
  rng: number,
  startX: number,
): { coins: Coin[]; rng: number } {
  // 공중에 작은 아치형 코인 3개 — 점프 보상
  const [countRoll, rng1] = randRange(rng, 3, 5);
  const coins: Coin[] = [];
  const baseY = GROUND_Y - 26;
  for (let i = 0; i < countRoll; i++) {
    const dx = i * 10;
    const dy = Math.round(-Math.sin((i / (countRoll - 1)) * Math.PI) * 6);
    coins.push({ x: startX + dx, y: baseY + dy, collected: false });
  }
  return { coins, rng: rng1 };
}

function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function step(
  s: GameStateSnapshot,
  input: GameInput,
): GameStateSnapshot {
  if (s.state === "ready") {
    if (input.startPressed || input.jumpPressed) {
      return { ...s, state: "running", tick: 0 };
    }
    return s;
  }
  if (s.state === "over") {
    if (input.startPressed) {
      return { ...initialState(), state: "running" };
    }
    return s;
  }

  // running
  const diff = difficultyForTick(s.tick);
  const speed = diff.speed;
  const scroll = s.scroll + speed;

  // --- player physics ---
  let { y, vy, onGround, sinceJump } = s.player;
  sinceJump = Math.max(0, sinceJump - 1);

  // Jump buffer + coyote 은 단순하게: onGround 면 jump 즉시 허용.
  if (input.jumpPressed && onGround) {
    vy = JUMP_V;
    onGround = false;
    sinceJump = 8;
  }
  vy += GRAVITY;
  y += vy;
  if (y >= GROUND_Y - PLAYER_H) {
    y = GROUND_Y - PLAYER_H;
    vy = 0;
    onGround = true;
  }

  // --- obstacles: scroll + despawn + maybe spawn ---
  const obstacles = s.obstacles
    .map((o) => ({ ...o, x: o.x - speed }))
    .filter((o) => o.x + o.w > -4);

  const coins = s.coins
    .map((c) => ({ ...c, x: c.x - speed }))
    .filter((c) => c.x > -4);

  // 가장 오른쪽 장애물 끝 좌표 기준으로 간격 체크
  let rng = s.rng;
  const rightmost = obstacles.reduce(
    (acc, o) => Math.max(acc, o.x + o.w),
    VIEW_W,
  );
  if (rightmost < VIEW_W + 48) {
    const res = spawnObstacle(rng, rightmost, diff.gapScale);
    obstacles.push(res.obstacle);
    rng = res.rng;

    // 50% 확률로 코인 아치 배치 (점프 유도)
    const [coinRoll, rng2] = randRange(rng, 0, 9);
    rng = rng2;
    if (coinRoll < 5) {
      const arc = spawnCoinArc(rng, res.obstacle.x + res.obstacle.w + 6);
      coins.push(...arc.coins);
      rng = arc.rng;
    }
  }

  // --- coin collection ---
  let coinsCollected = s.coinsCollected;
  for (const c of coins) {
    if (c.collected) continue;
    if (
      rectsOverlap(
        PLAYER_X,
        y,
        PLAYER_W,
        PLAYER_H,
        c.x - 2,
        c.y - 2,
        5,
        5,
      )
    ) {
      c.collected = true;
      coinsCollected += 1;
    }
  }

  // --- collision with obstacles ---
  for (const o of obstacles) {
    if (
      rectsOverlap(
        PLAYER_X + o.hitboxInset,
        y + o.hitboxInset,
        PLAYER_W - o.hitboxInset * 2,
        PLAYER_H - o.hitboxInset * 2,
        o.x,
        o.y,
        o.w,
        o.h,
      )
    ) {
      return {
        ...s,
        state: "over",
        tick: s.tick + 1,
        scroll,
        speed,
        player: { y, vy, onGround, sinceJump },
        obstacles,
        coins,
        distance: Math.floor(scroll / 10),
        coinsCollected,
        rng,
      };
    }
  }

  return {
    state: "running",
    tick: s.tick + 1,
    scroll,
    speed,
    player: { y, vy, onGround, sinceJump },
    obstacles,
    coins,
    distance: Math.floor(scroll / 10),
    coinsCollected,
    rng,
  };
}

export const ENGINE_META = { VIEW_W, VIEW_H, GROUND_Y, PLAYER_X, PLAYER_W, PLAYER_H };
