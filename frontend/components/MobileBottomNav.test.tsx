import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MobileBottomNav } from "./MobileBottomNav";

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(_callback: IntersectionObserverCallback) {}
}

afterEach(() => {
  cleanup();
});

describe("MobileBottomNav", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lista as seções principais com alvos tocáveis", () => {
    render(<MobileBottomNav />);

    expect(
      screen.getByRole("navigation", { name: /seções do currículo/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /experiência/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /certificações/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /destaques/i }),
    ).toBeInTheDocument();
  });

  it("rola até a seção ao tocar", () => {
    const target = document.createElement("div");
    target.id = "experiencia";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(<MobileBottomNav />);
    fireEvent.click(screen.getByRole("button", { name: /experiência/i }));

    expect(target.scrollIntoView).toHaveBeenCalled();
    target.remove();
  });
});
