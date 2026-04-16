# tr-archive — review

조사 일자: 2026-04-11
대상 커밋: `738efef`
스택: Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 · DOMPurify · vitest + jsdom + @testing-library/react · IndexedDB (직접 wrapper) · GitHub Actions 일일 데이터 갱신
도메인: KOG 「테일즈런너」 비공식 아카이브 (캐릭터 stat 비교 / 변경권 확률 / 맵 도감 / 코스튬 / 가이드 / 스토리 웹툰 뷰어 / 공지)

---

## 1. 원격 상태 (Tales-Runner/TR-archive)

- 미해결 이슈: **0건**
- 미해결 PR: **0건**
- 최근 PR: **3개 모두 MERGED** (#1 vite + lint, #2 brace-expansion DoS GHSA-f886-m6hf-6m8v, #3 lint warning 10건). 모두 보안/품질 hardening.
- 작업 트리: clean
- CI: 3개 워크플로우 (`ci.yml`, `update-data.yml`, `api-health.yml`)
- 배포: Vercel
- main 보호 + PR 강제 (README 명시)

→ 외부 보고 0건. 1인 fan project이지만 organization (`Tales-Runner`) 형태로 운영.

---

## 2. 코드 품질 종합

### 강점

- **CSP 명시적**: `next.config.ts:5-26` 가 strict CSP 헤더 정의. `default-src 'self'` + 외부 API/이미지 도메인 (trimage.rhaon.co.kr, tr.rhaon.co.kr) + YouTube nocookie 만 allow. `object-src 'none'`, `interest-cohort=()`, Permissions-Policy 까지. **이 17개 레포 중 가장 두꺼운 보안 헤더**.
- **IndexedDB direct wrapper**: 5개 store (runners/costumes/stories/maps/profile) 를 자체 wrapper. dexie 같은 라이브러리 의존 없음. import/export JSON 까지 자체 구현.
- **localStorage → IndexedDB 마이그레이션**: `migrateFromLocalStorage` 가 legacy key 자동 감지. 사용자가 무엇도 안 해도 마이그레이션 자동.
- **보안 fix가 즉각 적용**: brace-expansion DoS (GHSA-f886-m6hf-6m8v) 가 disclosure 후 빠르게 fix + override로 영구 핀.
- **테스트 8개 영역**: format / constants / dossier / lore / categories / empty-state / tooltip / error-boundary. 정확히 회귀 가드가 필요한 부분에 박혀 있음.
- **Static JSON data + GitHub Actions 자동 갱신**: 런타임 비용 0. README "GitHub Actions으로 매일 자동 실행".
- **API health workflow**: `api-health.yml` 가 공식 API 응답 변경을 monitoring. 깨질 때 자동 알림.
- **PWA**: README에 "PWA 지원" 명시.
- **Cmd+K 글로벌 검색**: 키보드-first.
- **i18n 없음**: 한국 게임 한국 사용자 → KO 한정 의도된 결정.
- **scholar-comment.tsx + vn-scene.tsx**: 학자 캐릭터 visual novel 인터랙션. dogfood 게임 컨셉을 사이트에 자체 적용. **이 17개 레포 중 가장 narrative-conscious**.
- **재방문 감지 (대사 축약)**: localStorage 활용한 사용자 경험 디테일.
- **maintenance-banner.tsx**: 게임 점검 상태 실시간 표시. 게임 fan tool의 가치 ↑.

### Fix TODO (우선순위순)

**[P1] CSP 의 `script-src 'unsafe-inline'`**
- 위치: `next.config.ts:9` `"script-src 'self' 'unsafe-inline'"`
- 증상: Next 16 이 inline script (`<script>` 태그) 를 일부 사용 → unsafe-inline 필요. 그러나 이건 XSS 방어를 약화시킴.
- Fix:
  - Next 16의 nonce 기반 inline script (next.js가 자동 nonce 생성하는 경우 활용).
  - 또는 'unsafe-inline'을 strict-dynamic + nonce로 대체.
  - 단기 trade-off: Next의 streaming + RSC가 unsafe-inline 없이 동작하기 어려움. nonce 도입이 우선.

**[P1] CSP 의 `style-src 'unsafe-inline'`**
- 위치: 같은 곳
- 증상: Tailwind 인라인 + emotion 같은 CSS-in-JS 사용 시 필요. 의도된 trade-off지만 XSS 방어 약함.
- Fix: hash 기반 또는 nonce 기반.

**[P2] `dbPromise` global mutable**
- 위치: `src/lib/db.ts:53` `let dbPromise: Promise<IDBDatabase> | null = null`
- 증상: 모듈 scope 변수. 첫 호출 시 생성, 이후 캐시. 한 탭 한 페이지 lifecycle에서는 OK이지만, IndexedDB connection이 끊어지면 (e.g. version upgrade) 재연결 로직 없음.
- Fix: `req.onversionchange` 핸들러 추가 → 연결 재시도. 또는 `db.close()` 후 dbPromise = null 리셋.

**[P2] `useFavorites` 의 N+1 패턴**
- 위치: `src/lib/use-favorites.ts:32-41` `toggleRunner`
- 증상: 매 toggle마다 `db.runners.get(id)` → `put/remove` → `db.runners.getAll()` 3번 IDB 호출. 즐겨찾기 100개에서 1개 toggle해도 100개 다시 fetch.
- Fix: in-memory state 직접 update (`setState((prev) => ({ ...prev, runners: prev.runners.filter(...) }))`). 또는 optimistic update 패턴.

**[P2] `migrateFromLocalStorage` 의 try/catch 빈 본문**
- 위치: `src/lib/db.ts:234` `} catch {}`
- 증상: 마이그레이션 실패가 silent. 사용자가 즐겨찾기를 잃고도 통보 못 받음.
- Fix: `console.warn` + `logger.error` 호출. 적어도 dev 모드에서는 로깅.

**[P2] `Promise.all` 안에서 import 트랜잭션 분리**
- 위치: `src/lib/db.ts:182-197` `importAll`
- 증상: 5개 store 각각 별도 트랜잭션. 일부만 성공하고 일부 fail 시 partial state. 사용자가 backup 복원 중 인터럽트되면 데이터 절반만 복원.
- Fix: 단일 트랜잭션 (`db.transaction(['runners','costumes','stories','maps','profile'], 'readwrite')`).

**[P2] CSP 에 `unsafe-eval` 포함 안 됨 — 좋지만 에러 시 디버깅 어려움**
- 증상: source map 디버깅 시 일부 도구가 eval 사용. 개발 편의성 ↓.
- Fix: 해당 trade-off를 README/CONTRIBUTING.md에 명시.

**[P3] `scripts/fetch-data.ts` 가 공식 API 변경에 어떻게 대응하는지**
- 위치: `scripts/fetch-data.ts`, `update-data.yml`
- 증상: tr.rhaon.co.kr API 가 공식이지만 비공식 사용. KOG가 schema 변경 시 즉시 깨짐.
- Fix: api-health.yml이 monitoring 한다면 OK. 단 schema 변경은 200 OK + 다른 필드 → health check 통과 + parsing fail 가능. zod validation 을 fetch-data.ts 에 추가.

**[P3] 학자 캐릭터 narrative이 중복 로딩 가능**
- 위치: `src/app/scholar-comment.tsx`
- 증상: 재방문 감지로 대사 축약하지만, 같은 페이지를 reload하면 다시 카운트되는지 확인 필요. localStorage key 정책.

**[P3] PWA manifest의 icon 출처**
- 위치: README "PWA 지원". `public/` 하위에 manifest.json/icons.
- Fix: 게임 공식 자산을 사용하지 않도록 (KOG IP 침해 회피).

**[P3] 변경권 확률 시뮬레이터의 구현 정확도**
- 위치: `src/app/probability/`
- 증상: 누적 확률 계산. P 값이 정확하지 않으면 fan 사이에서 오해 유발.
- Fix: `format.test.ts` / `constants.test.ts` 에 확률 계산 회귀 가드.

---

## 3. 테스트 상태

| 파일 | 영역 |
| --- | --- |
| src/lib/format.test.ts | 포매팅 함수 |
| src/lib/constants.test.ts | 상수/룩업 |
| src/data/dossier.test.ts | 데이터 변환 |
| src/data/lore.test.ts | 로어 파싱 |
| src/app/feedback/categories.test.ts | 피드백 카테고리 |
| src/components/empty-state.test.tsx | 컴포넌트 |
| src/components/tooltip.test.tsx | 컴포넌트 |
| src/components/error-boundary.test.tsx | 컴포넌트 |

- 8개 source 영역 테스트 (node_modules 제외).
- vitest + jsdom + @testing-library/react. CI에서 자동 실행 (`ci.yml`).
- **엉터리 테스트 없음**, 정확히 회귀가 필요한 부분 (data 변환, 컴포넌트 반응성, format) 에 박혀 있음.
- **누락 영역**: db.ts (IndexedDB wrapper), use-favorites.ts, 변경권 확률 simulator. 가장 손실 위험이 큰 영역이 untested.

---

## 4. 시장 가치 (2026-04-11 기준, 글로벌 관점)

**한 줄 평**: 시장 가치 N/A — 한국 게임 단일 작품 fan tool. **국내 fan community 안에서는 매우 가치 있음**, 글로벌 시장 적합성은 0에 가까움.

**시장 컨텍스트**

- **테일즈런너**: 2005년 출시, KOG 개발/Rhaon Entertainment 운영의 한국 캐주얼 레이싱 게임. 2026년 현재까지 21년 운영 중. **장수 게임**.
- **MAU 추정**: 정확한 통계 없음. 전성기 (2008–2012) 대비 매우 줄었지만, 한국 PC방 + 모바일 잔존 사용자 약 5만 명 추정.
- **공식 사이트**: tr.rhaon.co.kr — 본 아카이브의 데이터 source.
- **fan tool**: 비공식 wiki, 디시인사이드 갤러리 (DC inside), 공식 카페 등 분산. 본 아카이브 같은 통합 utility는 드뭄.

**경쟁/대안**

- **공식 사이트** (tr.rhaon.co.kr): UX 한계, 모바일 응답형 약함. 본 사이트가 명시적으로 "모바일 친화" 강조 — 차별화.
- **나무위키 / 디시 위키**: 텍스트 중심, 기능 비교 없음.
- **개인 블로그 / 유튜브 가이드**: 분산.
- **다른 fan tool**: 보이지 않음. 검색에서 본 아카이브가 거의 유일.

**fan project로서의 가치**

- **한국 게임 fan tool 중 코드 품질 상위**: vitest + Next 16 + TS strict + CSP + IndexedDB direct wrapper. 일반 fan blog 보다 훨씬 정교.
- **법적 위험**: KOG/Rhaon이 fan project를 admit/legal action 가능. 단, 본 사이트는 (1) 데이터 출처를 명시 (2) 공식 API 호출 (3) 이미지를 공식 CDN에서 직접 fetch (CSP의 `trimage.rhaon.co.kr` 화이트리스트). 비교적 conservative.
- **수익화 불가능**: fan project + 게임 IP. 광고도 위험.
- **유지보수**: 일일 GitHub Actions 데이터 갱신 → 사용자가 늘어도 운영비 0.

**장기 위험**

- 게임 종료 시 사이트도 의미 상실.
- KOG가 공식 사이트를 개편/IP 보호 강화 시.
- 공식 API 형식 변경 시 (api-health.yml이 alert).

**ROI 분석**

- **글로벌 가치**: ★☆☆☆☆.
- **국내 fan 가치**: ★★★★☆ (장수 게임 + 통합 fan tool 부재).
- **기술 품질**: ★★★★☆ (CSP/IndexedDB/CI/test 모두 깔끔, 17개 레포 중 상위).
- **권장**:
  1. db.ts / use-favorites.ts / probability simulator 의 unit test 추가 (P2).
  2. CSP 의 unsafe-inline을 nonce 기반으로 점진 마이그레이션 (P1).
  3. 현 상태로 유지하면서 게임 사용자 community에 outreach (디시 갤러리 / 공식 카페).

---

## 5. 한 줄 요약

> 한국 게임 fan tool 중 단연 코드 품질 높음 — Next 16 + CSP + IndexedDB + vitest + 일일 데이터 갱신 + visual novel 학자 캐릭터까지. **CSP unsafe-inline 2건과 useFavorites N+1 IDB 호출** 정리하면 fan tool의 ceiling. 글로벌 시장 가치는 N/A, 국내 fan 가치는 ★★★★☆.

## Sources

(N/A — 한국 단일 게임 fan project, 글로벌 시장 비교 무의미)
