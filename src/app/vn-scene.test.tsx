import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VNScene } from "./vn-scene";
import { TYPEWRITER_SPEED_MS } from "@/lib/constants";

const choices = [{ href: "/characters", label: "런너 보기", sub: "능력치" }];

describe("VNScene", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the full line visible after skipping the typewriter", () => {
    render(<VNScene choices={choices} />);
    act(() => vi.advanceTimersByTime(TYPEWRITER_SPEED_MS * 2));
    const dialogue = screen.getByRole("button", { name: /대사 전체 보기$/ });
    fireEvent.click(dialogue);
    const completedText = dialogue.textContent;

    act(() => vi.advanceTimersByTime(TYPEWRITER_SPEED_MS * 3));
    expect(dialogue.textContent).toBe(completedText);
    expect(dialogue).toHaveAccessibleName(/다음 대사$/);

    fireEvent.click(dialogue);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(dialogue).toHaveAccessibleName(/대사 전체 보기$/);
  });

  it.each([
    { returning: false, lineCount: 3 },
    { returning: true, lineCount: 2 },
  ])("reveals choices after all $lineCount lines (returning=$returning)", ({ returning, lineCount }) => {
    if (returning) localStorage.setItem("elims-visited", "1");
    render(<VNScene choices={choices} />);

    for (let line = 0; line < lineCount; line++) {
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /대사 전체 보기$/ }));
      if (line < lineCount - 1) {
        fireEvent.click(screen.getByRole("button", { name: /다음 대사$/ }));
      }
    }

    expect(screen.getByRole("link", { name: /런너 보기/ })).toHaveAttribute("href", "/characters");
    act(() => vi.advanceTimersByTime(TYPEWRITER_SPEED_MS * 3));
    expect(screen.getByRole("link", { name: /런너 보기/ })).toBeVisible();
  });
});
