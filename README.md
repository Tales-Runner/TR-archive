# 엘림스의 아카이브

테일즈런너 비공식 유틸리티 & 아카이브 사이트.

공식 사이트에서 제공하지 않는 비교/분석 기능과, 공식 데이터 기반 색인을 제공합니다.

## 기능

### 분석
- **런너 능력치** — 35캐릭터 스탯·모션 시간 비교, 캐릭터 비교기 (최대 3명)

### 도구
- **변경권 확률** — 139종 변경권 확률 조회 + 누적 확률 시뮬레이터

### 아카이브
- **맵 도감** — 52개 맵, 7종 카테고리 필터, 상세 규칙 + YouTube 영상
- **코스튬** — 75세트 갤러리, 개별 아이템 모션 미리보기
- **가이드** — 42개 공식 게임 가이드, 카테고리별 탐색
- **스토리 메타** — 198개 이벤트 스토리 색인, 연대기/관계도/통계 연결
- **공지사항** — 실시간 공식 공지 피드

### 기타
- 글로벌 검색 (Cmd+K)
- 점검 상태 배너 (실시간)
- 학자 캐릭터 코멘트 (엘림스 스마일, R, 닥터헬, 카이)
- 재방문 감지 (대사 축약)
- PWA 지원

## 도메인 경계

- **tr-archive**: 엘림스 스마일의 데이터 아카이브. 런너, 맵, 코스튬, 가이드, 확률, 경험치, 공지, 세계관 색인을 담당합니다.
- **TR Story**: 웹툰/스토리 감상 전용 부스. 모바일 뷰어, 읽기 진행률, 회차 이동은 [TR Story](https://tales-runner.github.io/TR-STORY/)에서 제공합니다.
- **도트 러너**: 실험실 메뉴에서 제공하는 팬게임입니다.

## 기술 스택

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- 빌드에 포함한 JSON 데이터와 공지·점검용 서버 API
- GitHub Actions 자동 데이터 갱신

## 실행

```bash
npm install
npm run dev
```

## 데이터 갱신

```bash
npm run data:collect -- .cache/data-candidate
npm run data:validate -- .cache/data-candidate
npm run data:apply -- .cache/data-candidate
npm test
npm run build
```

공식 API에서 캐릭터, 맵, 코스튬, 가이드, 스토리 메타 데이터를 수집합니다.
수집은 새 후보 디렉터리에만 기록합니다. 필수 필드, 중복 ID, 기존 대비 20% 초과 감소,
확률 카테고리 누락·개수·범위를 검증한 뒤에만 기존 데이터에 적용할 수 있습니다.
동일 후보 디렉터리는 재사용하지 않습니다.

GitHub Actions은 매일 **수집 → 별도 체크아웃에서 검증·빌드 → 검증된 아티팩트 보관**까지 실행합니다.
`validated-game-data`를 내려받아 위의 검증·적용 과정을 거친 뒤 변경을 검토하여 `main`에 반영하면
Vercel이 배포합니다. 수집용 토큰은 읽기 전용이며 보호된 `main`에 직접 푸시하지 않습니다.

2026-09-18 실측 API는 기존 모션 필드(`hurdleMotion`, `swimmingMotion` 등)를 제공하지 않습니다.
현재 화면의 데이터 계약과 맞지 않는 후보는 검증에서 차단하고 기존 데이터를 유지합니다.
새 `fallForwardMotion`·`fallBackwardMotion`을 기존 필드에 임의로 대응시키지 않습니다.

## 렌더링과 보안

HTML은 요청마다 렌더링합니다. `src/proxy.ts`가 새 CSP nonce를 생성하고,
루트 레이아웃의 `connection()`이 Next.js 런타임에 같은 nonce를 붙일 수 있도록 합니다.
스크립트에는 nonce와 `strict-dynamic`을 적용하며, `unsafe-eval`은 개발 서버에서만 허용합니다.
정적 JSON·이미지·JS/CSS는 HTML nonce 처리 대상에서 제외합니다. 공지·점검 API의 캐시는 각 라우트가 관리합니다.

JSON을 빌드에 포함한다고 HTML까지 정적 생성되는 것은 아닙니다. 현재는 엄격한 스크립트 CSP를 유지합니다.
정적 생성 전환은 Next.js의 실험적 SRI만 켜서 끝나는 작업이 아니며, 인라인 런타임과 클라이언트 이동까지
별도 검증해야 합니다. [Next.js CSP 문서](https://nextjs.org/docs/app/guides/content-security-policy)를 기준으로 판단합니다.

## 기여하기

버그 제보, 기능 요청, 코드 기여 모두 환영합니다.

- [Issue 생성하기](https://github.com/Tales-Runner/TR-archive/issues/new/choose) — 버그 제보 / 기능 요청
- [CONTRIBUTING.md](./CONTRIBUTING.md) — 기여 가이드

main 브랜치는 보호되어 있습니다. PR을 통해 기여해주세요.

## 데이터 출처

[테일즈런너 공식 홈페이지](https://tr.rhaon.co.kr) API
