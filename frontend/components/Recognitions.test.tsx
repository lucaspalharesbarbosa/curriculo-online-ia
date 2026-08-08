import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Recognitions } from "./Recognitions";

describe("Recognitions", () => {
  afterEach(() => {
    cleanup();
  });

  it("renderiza reconhecimento com título, emissor, ano e descrição visível", () => {
    render(
      <Recognitions
        items={[
          {
            title: "Reconhecimento PRAD — Alto Desempenho",
            issuer: "Itaú Unibanco",
            year: "2023 e 2024",
            description: "Avaliação com classificação de destaque.",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /reconhecimentos/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Reconhecimento PRAD — Alto Desempenho"),
    ).toBeInTheDocument();
    expect(screen.getByText("Itaú Unibanco")).toBeInTheDocument();
    expect(screen.getByText("2023 e 2024")).toBeInTheDocument();
    expect(
      screen.getByText("Avaliação com classificação de destaque."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /o que é/i }),
    ).not.toBeInTheDocument();
  });

  it("não renderiza foto — só o ícone decorativo", () => {
    render(
      <Recognitions
        items={[
          {
            title: "Reconhecimento de Mérito",
            issuer: "Itaú Unibanco",
            year: "2024",
            description: null,
          },
        ]}
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("não renderiza nada quando não há reconhecimentos", () => {
    const { container } = render(<Recognitions items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("permite colapsar a seção", () => {
    render(
      <Recognitions
        items={[
          {
            title: "Reconhecimento de Mérito",
            issuer: "Itaú Unibanco",
            year: "2024",
            description: "Texto.",
          },
        ]}
      />,
    );

    const toggle = screen.getByRole("button", { name: /reconhecimentos/i });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
