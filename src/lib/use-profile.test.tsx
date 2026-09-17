import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileProvider, useProfile } from "./use-profile";
import { db } from "./db";

vi.mock("./db", () => ({ db: { profile: { get: vi.fn(), put: vi.fn(), remove: vi.fn() } } }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(db.profile.get).mockResolvedValue(undefined);
});

describe("profile persistence", () => {
  it("does not finish saving or publish state before the transaction completes", async () => {
    let complete!: () => void;
    vi.mocked(db.profile.put).mockReturnValue(new Promise<void>((resolve) => { complete = resolve; }));
    const { result } = renderHook(useProfile, { wrapper: ProfileProvider });
    await waitFor(() => expect(result.current.ready).toBe(true));
    let saved = false;
    let pending!: Promise<void>;
    await act(async () => { pending = result.current.save({ nickname: "런너" }).then(() => { saved = true; }); });
    expect(saved).toBe(false);
    expect(result.current.profile).toBeNull();
    await act(async () => { complete(); await pending; });
    expect(saved).toBe(true);
    expect(result.current.profile?.nickname).toBe("런너");
  });

  it("reports a failed save and preserves the last persisted profile", async () => {
    vi.mocked(db.profile.put).mockRejectedValue(new Error("storage full"));
    const { result } = renderHook(useProfile, { wrapper: ProfileProvider });
    await waitFor(() => expect(result.current.ready).toBe(true));
    await act(async () => { await expect(result.current.save({ nickname: "런너" })).rejects.toThrow("storage full"); });
    expect(result.current.profile).toBeNull();
  });

  it("finishes loading with an explicit error when storage cannot be read", async () => {
    vi.mocked(db.profile.get).mockRejectedValue(new Error("storage unavailable"));
    const { result } = renderHook(useProfile, { wrapper: ProfileProvider });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.loadError).toBe(true);
  });
});
