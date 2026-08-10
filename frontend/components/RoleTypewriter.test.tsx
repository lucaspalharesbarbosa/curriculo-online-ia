import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const useReducedMotionMock = vi.fn(() => true);

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => useReducedMotionMock(),
  };
});

import { RoleTypewriter } from "./RoleTypewriter";

describe("RoleTypewriter", () => {
  beforeEach(() => {
    useReducedMotionMock.mockReturnValue(true);
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("com reduced-motion mostra cada cargo em linha própria com prefixo >_", () => {
    render(
      <RoleTypewriter lines={["Tech Lead", "Senior Software Engineer"]} />,
    );

    expect(
      screen.getByLabelText("Tech Lead e Senior Software Engineer"),
    ).toBeInTheDocument();
    expect(screen.getAllByText(">_")).toHaveLength(2);
    expect(screen.getByText("Tech Lead")).toBeInTheDocument();
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
  });

  it("sem reduced-motion escreve a primeira linha no loop de typewriter", () => {
    useReducedMotionMock.mockReturnValue(false);
    vi.useFakeTimers();

    render(<RoleTypewriter lines={["Tech Lead", "Senior"]} />);

    expect(screen.getByLabelText("Tech Lead e Senior")).toBeInTheDocument();

    // pause inicial e depois digita caractere a caractere
    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => {
      vi.advanceTimersByTime(48 * 9);
    });

    expect(screen.getByText("Tech Lead")).toBeInTheDocument();
  });
});
