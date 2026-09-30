import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RESUME_CHAT_RATE_LIMIT_MESSAGE } from "../lib/chat-client";
import { openAssistChat } from "../lib/open-chat";
import { FIXTURES } from "../lib/tool-results.fixtures";
import { ChatAside } from "./ChatAside";

function mockChatResponse(body: unknown, status = 200) {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: status < 400,
    status,
    json: async () => body,
  } as Response);
}

function ask(text: string) {
  fireEvent.change(
    screen.getByLabelText(/pergunte ao assistente sobre a carreira/i),
    { target: { value: text } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
}

describe("ChatAside", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("mostra a introdução, as sugestões e o explicativo dos selos", () => {
    render(<ChatAside />);

    expect(
      screen.getByRole("complementary", { name: /assistente de ia/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/pergunte qualquer coisa sobre a carreira/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /quantos anos de python/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /onde trabalhei antes do itaú/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /por que este projeto não usa banco vetorial/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Fonte: web")).toBeInTheDocument();
  });

  it("resposta sem tools (pipeline determinístico) mostra texto e selo, sem chips", async () => {
    mockChatResponse({
      answer: "Trabalho na Engineering Brasil.",
      source: "resume",
    });
    render(<ChatAside />);

    ask("Onde Lucas trabalha hoje?");

    expect(
      await screen.findByText("Trabalho na Engineering Brasil."),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        body: JSON.stringify({ question: "Onde Lucas trabalha hoje?" }),
      }),
    );
    expect(screen.getAllByText("Fonte: currículo").length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("list", { name: /ferramentas usadas/i }),
    ).not.toBeInTheDocument();
  });

  it("renderiza markdown da resposta (negrito e lista) sem mostrar os asteriscos", async () => {
    mockChatResponse({
      answer: "Lucas trabalha na **Engineering Brasil**.\n- **Python**\n- Java",
      source: "resume",
    });
    render(<ChatAside />);

    ask("Onde Lucas trabalha hoje?");

    const answer = await screen.findByTestId("chat-answer");
    expect(answer.querySelectorAll("strong")).toHaveLength(2);
    expect(answer.querySelectorAll("li")).toHaveLength(2);
    expect(answer.textContent).not.toContain("**");
  });

  it("resposta com tools mostra chips, detalhe expansível e o card de experiência", async () => {
    mockChatResponse({
      answer: "Lucas tem 3 anos e 8 meses de Python.",
      source: "resume",
      tools: [
        {
          name: "calculate_experience",
          arguments: { skill_or_company: "Python" },
          result: FIXTURES.calculate,
        },
      ],
    });
    render(<ChatAside />);

    fireEvent.click(
      screen.getByRole("button", { name: /quantos anos de python/i }),
    );

    const chip = await screen.findByRole("button", {
      name: "Calculou experiência",
    });
    expect(await screen.findByText("Cargos considerados")).toBeInTheDocument();
    expect(screen.getByText(/44 meses/)).toBeInTheDocument();

    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByLabelText("Resultado de calculate_experience"),
    ).toBeInTheDocument();
  });

  it("mostra o selo de web quando a resposta veio da busca externa", async () => {
    mockChatResponse({
      answer: "SDD é uma abordagem guiada por especificação.",
      source: "web",
      tools: [
        { name: "search_web", arguments: { query: "SDD" }, result: "..." },
      ],
    });
    render(<ChatAside />);

    ask("O que é SDD?");

    expect(
      await screen.findByRole("button", { name: "Pesquisou na web" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Fonte: web")).toBeInTheDocument();
  });

  it("mantém a resposta e cai no detalhe simples quando o formato da tool não é reconhecido", async () => {
    mockChatResponse({
      answer: "Resposta.",
      source: "resume",
      tools: [
        { name: "calculate_experience", arguments: {}, result: "formato novo" },
      ],
    });
    render(<ChatAside />);

    ask("Quanto tempo de Java?");

    fireEvent.click(
      await screen.findByRole("button", { name: "Calculou experiência" }),
    );
    expect(
      screen.getByLabelText("Resultado de calculate_experience"),
    ).toHaveTextContent("formato novo");
    expect(screen.queryByText("Cargos considerados")).not.toBeInTheDocument();
  });

  it("envia o histórico na segunda pergunta e registra o feedback", async () => {
    mockChatResponse({ answer: "Primeira.", source: "resume" });
    render(<ChatAside />);

    ask("Primeira?");
    await screen.findByText("Primeira.");
    mockChatResponse({ answer: "Segunda.", source: "resume" });
    ask("Segunda?");
    await screen.findByText("Segunda.");

    const secondBody = JSON.parse(
      (vi
        .mocked(fetch)
        .mock.calls.find(([, init]) =>
          (init?.body as string).includes("Segunda?"),
        )?.[1]?.body ?? "{}") as string,
    );
    expect(secondBody.history).toEqual([
      { role: "user", content: "Primeira?" },
      { role: "assistant", content: "Primeira." },
    ]);

    fireEvent.click(
      screen.getAllByRole("button", { name: "Resposta útil" })[0],
    );
    expect(
      screen.getAllByRole("button", { name: "Resposta útil" })[0],
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("mostra a mensagem amigável de rate limit como alerta", async () => {
    mockChatResponse({ detail: "x" }, 429);
    render(<ChatAside />);

    ask("Pergunta");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      RESUME_CHAT_RATE_LIMIT_MESSAGE,
    );
  });

  it("anuncia o carregamento enquanto aguarda a resposta", async () => {
    vi.mocked(fetch).mockReturnValueOnce(new Promise(() => {}));
    render(<ChatAside />);

    ask("Pergunta lenta");

    expect(await screen.findByRole("status")).toHaveTextContent(
      /buscando contexto/i,
    );
    expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "true");
  });

  it("abre em tela cheia pelo evento, foca o campo, e fecha pelo botão devolvendo o foco", async () => {
    render(
      <>
        <button type="button" onClick={openAssistChat}>
          Abrir
        </button>
        <ChatAside />
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Abrir" });
    trigger.focus();

    fireEvent.click(trigger);

    const aside = screen.getByRole("complementary", {
      name: /assistente de ia/i,
    });
    await waitFor(() => expect(aside.className).toContain("max-lg:fixed"));
    expect(
      screen.getByLabelText(/pergunte ao assistente sobre a carreira/i),
    ).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Fechar chat" }));

    expect(aside.className).toContain("max-lg:hidden");
    expect(trigger).toHaveFocus();
  });

  it("fecha com Esc no mobile e trava a rolagem enquanto aberto", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: true,
      }) as unknown as typeof window.matchMedia,
    );
    render(<ChatAside />);

    act(() => openAssistChat());
    await waitFor(() => expect(document.body.style.overflow).toBe("hidden"));

    fireEvent.keyDown(document, { key: "Escape" });

    const aside = screen.getByRole("complementary", {
      name: /assistente de ia/i,
    });
    expect(aside.className).toContain("max-lg:hidden");
    expect(document.body.style.overflow).toBe("");
  });
});
