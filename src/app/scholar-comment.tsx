"use client";

/**
 * 감초 대사 컴포넌트 — 캐릭터 해석 재검토 후 복원 예정
 * 복원 시 git history에서 이전 구현을 참조할 것
 */

interface Line {
  char: string;
  text: string;
}

interface Props {
  lines: Line[];
}

interface SimpleProps {
  elims: string;
  r?: string;
}

export function ScholarComment(_props: SimpleProps) {
  return null;
}

export function CharacterComment(_props: Props) {
  return null;
}
