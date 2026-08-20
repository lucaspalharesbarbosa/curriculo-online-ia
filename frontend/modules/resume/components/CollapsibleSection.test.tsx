import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CollapsibleSection } from "./CollapsibleSection";

afterEach(() => {
  cleanup();
});

describe("CollapsibleSection", () => {
  it("inicia expandido e alterna aria-expanded ao clicar", async () => {
    render(
      <CollapsibleSection
        headingId="demo-heading"
        title="Experiência"
        subtitle="Trajetória"
        icon={<span data-testid="icon" />}
      >
        <p>Conteúdo da seção</p>
      </CollapsibleSection>,
    );

    const toggle = screen.getByRole("button", { name: /experiência/i });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Conteúdo da seção")).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => {
      expect(screen.queryByText("Conteúdo da seção")).not.toBeInTheDocument();
    });

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Conteúdo da seção")).toBeInTheDocument();
  });

  it("respeita defaultOpen=false", () => {
    render(
      <CollapsibleSection
        headingId="closed-heading"
        title="Educação"
        subtitle="Formação"
        icon={<span />}
        defaultOpen={false}
      >
        <p>Oculto no início</p>
      </CollapsibleSection>,
    );

    expect(screen.getByRole("button", { name: /educação/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByText("Oculto no início")).not.toBeInTheDocument();
  });
});
