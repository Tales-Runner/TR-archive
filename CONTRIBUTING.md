# 기여 가이드

엘림스의 비공식 아카이브에 관심을 가져주셔서 감사합니다.

## 기여 방법

### 버그 제보 / 기능 요청

[Issues](https://github.com/Tales-Runner/TR-archive/issues)에서 템플릿을 선택해 작성해주세요.

- **버그 제보**: 재현 방법과 환경을 알려주시면 빠르게 수정할 수 있습니다.
- **기능 요청**: 어떤 기능이 왜 필요한지 설명해주세요.

### 코드 기여

1. 이 저장소를 Fork합니다.
2. 새 브랜치를 만듭니다. (`git checkout -b feature/기능이름`)
3. 변경사항을 커밋합니다. (`git commit -m "설명"`)
4. 브랜치를 Push합니다. (`git push origin feature/기능이름`)
5. Pull Request를 생성합니다.

### PR 규칙

- **main 브랜치에 직접 push하지 마세요.** 반드시 PR을 통해 머지합니다.
- PR은 리뷰 후 머지됩니다.
- `npm run build`가 에러 없이 통과해야 합니다.
- 모바일 반응형을 깨뜨리지 않도록 주의해주세요.

## 개발 환경

```bash
# 설치
npm install

# 개발 서버
npm run dev

# 빌드 확인
npm run build

# 데이터 갱신 (공식 API에서 최신 데이터 수집)
npx tsx scripts/fetch-data.ts
```

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
├── data/             # 정적 JSON 데이터 (자동 생성)
└── lib/              # 타입, 유틸리티
```

## 컨벤션

- **서버 컴포넌트**: `page.tsx` — JSON import, 메타데이터, 레이아웃
- **클라이언트 컴포넌트**: 인터랙션이 필요한 경우 `"use client"` 사용
- **스타일**: Tailwind CSS, 기존 색상/간격 패턴을 따라주세요
- **데이터**: `src/data/` 파일은 직접 수정하지 마세요. `scripts/fetch-data.ts`로 갱신합니다.

## 데이터 출처

모든 게임 데이터는 [테일즈런너 공식 홈페이지](https://tr.rhaon.co.kr) API에서 수집됩니다.
