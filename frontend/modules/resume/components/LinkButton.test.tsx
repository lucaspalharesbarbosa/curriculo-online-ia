import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ExternalLink } from "lucide-react";

import { LinkButton } from "./LinkButton";

afterEach(() => {
  cleanup();
});

describe("LinkButton", () => {
  it("renderiza link externo com ícone, texto e aria-label", () => {
    render(
      <LinkButton
        href="https://example.com/certificado"
        label="Ver certificado"
        icon={<ExternalLink data-testid="icon" />}
        ariaLabel="Ver certificado Curso X"
      />,
    );

    const link = screen.getByRole("link", { name: "Ver certificado Curso X" });
    expect(link).toHaveAttribute("href", "https://example.com/certificado");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Ver certificado")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
