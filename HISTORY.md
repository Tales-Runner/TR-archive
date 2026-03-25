# TR Utils - 작업 히스토리

## 프로젝트 개요

테일즈런너(TalesRunner) 유틸리티 웹페이지. 공식 사이트에서 할 수 없는 **비교/계산** 기능을 제공.

- 위치: `/Users/ren/IdeaProjects/tr-utils`
- 스택: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- 실행: `cd ~/IdeaProjects/tr-utils && npx next dev --port 3456`

---

## 1. 리서치 (2026-03-25)

### 기존 유틸 사이트 분석

| 사이트 | 기능 | 비고 |
|--------|------|------|
| [FLEC](https://tr.xflec.com/) | 어획물 계산기, 칭호 검색, 맵, 크래프트 | 가장 종합적 |
| [TRFishCalculator](https://strode0496.github.io/TRFishCalculator/) | 어획물→경험치 레벨업 예측 | 단일 기능 |
| [trfish.streamlit.app](https://trfish.streamlit.app/) | 낚시 계산기 | 접속 불안정 |

**결론:** 낚시/경험치 계산은 포화. 캐릭터 비교, 변경권 확률 같은 영역이 빈자리.

### 공식 API 리버스 엔지니어링

공식 사이트(`tr.rhaon.co.kr`)는 React SPA. JS 번들(`Footer-639c2ec0.js`, ~900KB)을 분석해서 API 엔드포인트를 발견.

**Base URL:** `https://tr.rhaon.co.kr/webb/`

핵심 변수: `$h="/webb"` → 모든 API 호출에 `/webb` 프리픽스.

#### 인증 없이 사용 가능한 API

```
GET /webb/trintro/character/all          — 전체 캐릭터 목록 (35명)
GET /webb/trintro/character/{id}         — 캐릭터 상세 (스탯, 모션시간, 고유능력, 프로필)
GET /webb/trintro/character/{id}/contents — 캐릭터 콘텐츠 (파라미터 필요)

GET /webb/trlibrary/map/type             — 맵 카테고리 7종
GET /webb/trlibrary/map/list             — 전체 맵 목록
GET /webb/trlibrary/map/{id}             — 맵 상세 (설명, 유튜브, 규칙)

GET /webb/trlibrary/guide?search-word=   — 게임 가이드 목록 (42개)
GET /webb/trlibrary/guide/{id}           — 가이드 상세 (HTML 콘텐츠)

GET /webb/trlibrary/closet/list          — 코스튬 목록
GET /webb/trlibrary/closet/{id}          — 코스튬 상세

GET /webb/trlibrary/menu                 — 라이브러리 메뉴 (스토리 목록)
GET /webb/trlibrary/trstory/list         — 웹툰 스토리 목록
GET /webb/trlibrary/archive-event        — 아카이브 이벤트
GET /webb/trlibrary/probability/trading/level — 변경권 확률 데이터 (139종)

GET /webb/main/notices                   — 공지사항
GET /webb/main/banner                    — 메인 배너
GET /webb/main/pierrotnews               — 삐에로 뉴스
GET /webb/main/contents                  — 메인 콘텐츠 링크
GET /webb/main/runnercloset              — 최신 코스튬

GET /webb/code/all/0001                  — 코드 테이블
GET /webb/code/maintenance               — 점검 상태
```

#### 인증 필요 (로그인 세션 필요, 외부 접근 불가)

```
/webb/trb/api/v1/ranking/*     — 랭킹 (daily/weekly/monthly/total)
/webb/trb/api/v1/community     — 커뮤니티
/webb/trb/api/v1/user          — 유저 정보
/webb/news/notices             — 뉴스 상세
/webb/news/updates             — 업데이트 상세
```

#### 기타 서버 주소 (JS 번들에서 발견)

```
서비스 길드: http://119.28.233.129/guild/
서비스 웹:   http://43.155.175.197/webb/
이벤트:     https://event.rhaon.co.kr
인증:       https://auth.rhaon.co.kr
이미지 CDN: https://trimage.rhaon.co.kr
```

### 방향 결정

- 게임 스킬/템 조합 가이드 → **제외** (업데이트마다 바뀜, 전문가 영역)
- 공식 사이트 데이터 그대로 보여주기 → **제외** (공식에서 보면 됨)
- **채택:**
  1. 캐릭터 스탯 비교 (공식은 1명씩만 볼 수 있음 → 35명 한 테이블)
  2. 변경권 확률 계산기 (확률 데이터 + 기대값 시뮬레이션)
  3. 마스코트: 엘림스 스마일 (아카이브 담당 학자 캐릭터)

---

## 2. 구현 내용

### 프로젝트 구조

```
tr-utils/
├── src/
│   ├── app/
│   │   ├── layout.tsx              — 다크 테마 레이아웃 + 엘림스 아이콘 헤더
│   │   ├── globals.css             — 다크 보라 테마 CSS 변수
│   │   ├── page.tsx                — 홈: 비주얼노벨 스타일
│   │   ├── vn-scene.tsx            — VN 대화창 (타이핑 애니메이션 + 선택지)
│   │   ├── characters/
│   │   │   ├── page.tsx            — 캐릭터 비교 서버 컴포넌트
│   │   │   └── character-table.tsx — 클라이언트: 정렬/필터/탭 테이블
│   │   └── probability/
│   │       ├── page.tsx            — 변경권 계산기 서버 컴포넌트
│   │       └── probability-calculator.tsx — 클라이언트: 그룹/아이템 선택 + 시뮬레이터
│   ├── data/
│   │   ├── characters.json         — 35캐릭터 상세 데이터 (API에서 수집)
│   │   └── probability.json        — 139종 변경권 확률 데이터 (API에서 수집)
│   └── lib/
│       └── types.ts                — TypeScript 타입 정의
├── tsconfig.json                   — @/* 경로 별칭 설정
└── package.json
```

### 페이지별 기능

#### 홈 (`/`)
- 미연시/비주얼노벨 UI
- 보라빛 그라데이션 배경 + 엘림스 스마일 일러스트
- 타이핑 애니메이션 대사 4줄 → 클릭으로 진행
- 마지막에 선택지 2개 (캐릭터 비교 / 변경권 계산기)

#### 캐릭터 비교 (`/characters`)
- 탭: 기본 스탯 / 모션 시간
- 기본 스탯: 속도, 가속, 컨트롤, 힘, 합계 (바 차트 + 수치)
- 모션 시간: 부활, 허들, 착지, 분노, 수영, 벌집, 감전, 스턴 (초록=최고, 빨강=최저)
- 열 클릭으로 정렬 (오름/내림)
- 카테고리 필터: 전체/런너/스토리
- 텍스트 검색 (이름, 캐치프레이즈, 고유능력)
- 고유능력 컬럼 표시

#### 변경권 계산기 (`/probability`)
- 그룹 필터 (아틀리에, New.2, New.1, 5th, 4th, ... 1st, 연도별 등)
- 변경권 선택 드롭다운
- 확률표: 현재등급 → 결과등급 + 확률
- 기대값 시뮬레이터: 목표 등급 선택 + 시행 횟수 입력 → 누적 확률 바
- 횟수별 참고 테이블 (1, 5, 10, 20, 50회)

### 디자인
- 전체 다크 테마 (보라+검정)
- 반투명 글래스모피즘 카드
- 엘림스 스마일 = 사이트 마스코트 (헤더 아이콘 + 홈 일러스트)

---

## 3. 미구현 / 향후 TODO

- [ ] 낚시 살림망 경험치 계산기 (레벨 테이블은 수동 입력 필요)
- [ ] 캐릭터 상세 모달/페이지 (클릭 시 프로필, 모든 모션 시간, 일러스트 표시)
- [ ] 변경권 데이터 자동 갱신 스크립트 (API → JSON)
- [ ] 배포 (Vercel / GitHub Pages)
- [ ] 모바일 반응형 세부 조정
- [ ] 메타 태그 / OG 이미지 세팅
- [ ] select 드롭다운 다크모드 옵션 색상 수정 (현재 OS 기본 밝은 배경)
- [ ] 엘림스 대사 더 추가 / 각 페이지 진입 시 한마디씩

---

## 4. 참고 링크

- 공식 홈페이지: https://tr.rhaon.co.kr
- 공식 아카이브: https://tr.rhaon.co.kr/archive/
- 나무위키 시스템: https://namu.wiki/w/테일즈런너/시스템
- 나무위키 캐릭터: https://namu.wiki/w/테일즈런너/캐릭터
- FLEC 유틸: https://tr.xflec.com/
- 이미지 CDN: https://trimage.rhaon.co.kr/
