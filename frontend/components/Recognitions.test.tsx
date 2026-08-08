import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Recognitions } from "./Recognitions";

describe("Recognitions", () => {
  afterEach(() => {
    cleanup();
  });

  it("renderiza reconhecimento com título, emissor, ano e descrição", () => {
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
  });

  it("expõe a descrição via botão de informação com tooltip associado (aria-describedby)", () => {
    render(
      <Recognitions
        items={[
          {
            title: "Reconhecimento PRAD — Alto Desempenho",
            issuer: "Itaú Unibanco",
            year: "2024",
            description: "PRAD — Programa de Remuneração de Alto Desempenho.",
          },
        ]}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: /o que é reconhecimento prad/i,
    });
    const describedById = trigger.getAttribute("aria-describedby");
    expect(describedById).toBeTruthy();

    const tooltip = document.getElementById(describedById as string);
    expect(tooltip).toHaveAttribute("role", "tooltip");
    expect(tooltip).toHaveTextContent(
      "PRAD — Programa de Remuneração de Alto Desempenho.",
    );
  });

  it("não renderiza foto — só o ícone decorativo de medalha", () => {
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
});
