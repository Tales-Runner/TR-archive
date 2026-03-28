import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("기본 메시지 렌더링", () => {
    render(<EmptyState />);
    expect(screen.getByText("검색 결과가 없습니다")).toBeInTheDocument();
  });

  it("커스텀 메시지 렌더링", () => {
    render(<EmptyState message="조건에 맞는 캐릭터가 없습니다" />);
    expect(screen.getByText("조건에 맞는 캐릭터가 없습니다")).toBeInTheDocument();
  });

  it("필터 안내 문구 포함", () => {
    render(<EmptyState />);
    expect(screen.getByText("필터나 검색어를 바꿔 보세요")).toBeInTheDocument();
  });
});
