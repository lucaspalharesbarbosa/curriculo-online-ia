import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home page", () => {
  it("renderiza sidebar e seções principais do currículo", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /lucas palhares barbosa/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^perfil$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^experiência$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^educação$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /certificações/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /reconhecimentos/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^destaques$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /download cv/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/nguyen tran gia si/i)).not.toBeInTheDocument();
  });
});
