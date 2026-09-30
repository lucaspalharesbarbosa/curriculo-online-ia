import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { renderMarkdown } from "./markdown";

function html(text: string): HTMLElement {
  const { container } = render(<div>{renderMarkdown(text)}</div>);
  return container;
}

describe("renderMarkdown", () => {
  afterEach(cleanup);

  it("renderiza **negrito** como <strong> sem os asteriscos", () => {
    const container = html("Lucas é **engenheiro de software** sênior.");
    expect(container.querySelector("strong")?.textContent).toBe(
      "engenheiro de software",
    );
    expect(container.textContent).not.toContain("**");
  });

  it("renderiza __negrito__ e *itálico*", () => {
    const container = html("__forte__ e *ênfase*");
    expect(container.querySelector("strong")?.textContent).toBe("forte");
    expect(container.querySelector("em")?.textContent).toBe("ênfase");
  });

  it("renderiza `código` inline", () => {
    const container = html("Usa `FastAPI` no backend");
    expect(container.querySelector("code")?.textContent).toBe("FastAPI");
  });

  it("renderiza lista com marcadores", () => {
    const container = html("Skills:\n- **Python**\n- Java\n* React");
    expect(container.querySelectorAll("ul > li")).toHaveLength(3);
    expect(container.querySelector("ul strong")?.textContent).toBe("Python");
  });

  it("renderiza lista numerada", () => {
    const container = html("1. Itaú\n2. Engineering");
    expect(container.querySelectorAll("ol > li")).toHaveLength(2);
  });

  it("separa parágrafos por linha em branco e mantém quebra simples", () => {
    const container = html("linha 1\nlinha 2\n\nsegundo");
    expect(container.querySelectorAll("p")).toHaveLength(2);
    expect(container.querySelectorAll("br")).toHaveLength(1);
  });

  it("renderiza link http(s) com rel seguro", () => {
    const container = html("Veja [o repo](https://github.com/x/y)");
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("https://github.com/x/y");
    expect(link?.getAttribute("rel")).toContain("noopener");
  });

  it("não cria link para esquemas perigosos", () => {
    const container = html("[clique](javascript:alert(1))");
    expect(container.querySelector("a")).toBeNull();
  });

  it("exibe HTML como texto, sem interpretá-lo", () => {
    const container = html('<img src=x onerror="alert(1)"> **ok**');
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("<img");
    expect(container.querySelector("strong")?.textContent).toBe("ok");
  });

  it("deixa asterisco solto e texto puro intactos", () => {
    const container = html("2 * 3 = 6 e nada de markdown");
    expect(container.textContent).toBe("2 * 3 = 6 e nada de markdown");
  });
});
