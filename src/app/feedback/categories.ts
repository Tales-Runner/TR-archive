export const FEEDBACK_CATEGORIES = [
  { value: "bug", label: "버그 제보", desc: "사이트 오류나 깨짐" },
  { value: "feature", label: "기능 건의", desc: "이런 기능이 있으면 좋겠다" },
  { value: "data", label: "데이터 오류", desc: "정보가 틀려요" },
  { value: "other", label: "기타", desc: "그 외 하고 싶은 말" },
] as const;

export const CATEGORY_LABEL_MAP: Record<string, string> = Object.fromEntries(
  FEEDBACK_CATEGORIES.map((c) => [c.value, c.label]),
);
