# 기여 가이드

엘림스의 비공식 아카이브에 관심을 가져주셔서 감사합니다.

테일즈런너를 좋아하는 분이라면 누구나 기여할 수 있습니다. 코드를 못 짜도 괜찮아요 — 버그 제보나 아이디어만으로도 큰 도움이 됩니다.

## 코드 없이 기여하기

- **버그 제보** — [여기서](https://github.com/Tales-Runner/TR-archive/issues/new?template=bug_report.yml) 어떤 페이지에서 뭐가 이상한지 알려주세요.
- **기능 요청** — [여기서](https://github.com/Tales-Runner/TR-archive/issues/new?template=feature_request.yml) 이런 기능이 있으면 좋겠다! 하는 걸 알려주세요.
- **데이터 오류 제보** — 캐릭터 스탯이나 맵 정보가 틀렸다면 Issue로 알려주세요.
- **대사 제안** — 엘림스/R/닥터헬/카이 대사가 캐릭터성에 안 맞다면 알려주세요.

처음 기여하시는 분은 [`good first issue`](https://github.com/Tales-Runner/TR-archive/labels/good%20first%20issue) 라벨이 붙은 이슈를 확인해보세요.

## 코드로 기여하기

### 요구 사항

- Node.js 22+
- npm

### 시작하기

```bash
# Fork 후 클론
git clone https://github.com/YOUR_USERNAME/TR-archive.git
cd TR-archive

# 설치
npm install

# 개발 서버
npm run dev

# 빌드 확인
npm run build
```

### PR 보내기

1. 새 브랜치를 만듭니다. (`git checkout -b feature/기능이름`)
2. 변경사항을 커밋합니다.
3. Push하고 PR을 생성합니다.

### PR 규칙

- **main 브랜치에 직접 push할 수 없습니다.** 반드시 PR을 통해 머지합니다.
- PR은 최소 1명의 리뷰 후 머지됩니다.
- `npm run build`가 에러 없이 통과해야 합니다.
- UI 변경이 있다면 모바일(375px)에서도 확인해주세요.
- `src/data/` 파일은 직접 수정하지 마세요. 데이터는 `scripts/fetch-data.ts`로 갱신합니다.

## 프로젝트 구조

```
src/
├── app/              # 페이지 및 컴포넌트
│   ├── characters/   # 런너 능력치
│   ├── probability/  # 변경권 확률
│   ├── exp/          # 경험치 계산기
│   ├── maps/         # 맵 도감
│   ├── closet/       # 코스튬
│   ├── guides/       # 가이드
│   ├── stories/      # 스토리
│   └── notices/      # 공지사항
├── data/             # 정적 JSON 데이터 (자동 생성, 직접 수정 X)
└── lib/              # 타입 정의, 유틸리티 함수
```

### 파일 패턴

각 페이지는 동일한 구조를 따릅니다:

- `page.tsx` — 서버 컴포넌트. JSON import, 메타데이터, ScholarComment, 클라이언트 컴포넌트 렌더링.
- `*-catalog.tsx` / `*-calculator.tsx` 등 — 클라이언트 컴포넌트. `"use client"`, useState/useMemo로 필터/정렬/검색.

### 스타일 컨벤션

- Tailwind CSS 사용
- 메인 색상: teal (엘림스), accent/gold (제목)
- 카드: `rounded-xl border border-white/10 bg-surface-card`
- 활성 버튼: `bg-teal-600 text-white`
- 비활성 버튼: `bg-white/5 text-white/40`

## 데이터 갱신

```bash
npx tsx scripts/fetch-data.ts
```

공식 API에서 캐릭터, 맵, 코스튬, 가이드, 스토리 데이터를 수집합니다. GitHub Actions로 매일 자동 실행됩니다.

## 데이터 출처

모든 게임 데이터는 [테일즈런너 공식 홈페이지](https://tr.rhaon.co.kr) API에서 수집됩니다.
