import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  it("children을 렌더링", () => {
    render(
      <Tooltip text="도움말">
        <button>버튼</button>
      </Tooltip>
    );
    expect(screen.getByText("버튼")).toBeInTheDocument();
  });

  it("초기에는 툴팁 텍스트가 보이지 않음", () => {
    render(
      <Tooltip text="도움말 텍스트">
        <button>버튼</button>
      </Tooltip>
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("마우스 진입 시 툴팁이 표시됨", () => {
    render(
      <Tooltip text="속도 설명">
        <button>속도</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText("속도").closest("div")!);
    expect(screen.getByRole("tooltip")).toHaveTextContent("속도 설명");
  });

  it("마우스 이탈 시 툴팁이 사라짐", () => {
    render(
      <Tooltip text="속도 설명">
        <button>속도</button>
      </Tooltip>
    );
    const wrapper = screen.getByText("속도").closest("div")!;
    fireEvent.mouseEnter(wrapper);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
