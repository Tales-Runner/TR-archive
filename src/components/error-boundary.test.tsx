import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "./error-boundary";

function ThrowingComponent(): never {
  throw new Error("test error");
}

function GoodComponent() {
  return <div>정상 렌더링</div>;
}

describe("ErrorBoundary", () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it("정상 children을 그대로 렌더링", () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("정상 렌더링")).toBeInTheDocument();
  });

  it("에러 발생 시 에러 UI 표시", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("페이지를 불러오는 중 오류가 발생했습니다")).toBeInTheDocument();
  });

  it("다시 시도 버튼이 표시됨", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("다시 시도")).toBeInTheDocument();
  });
});
