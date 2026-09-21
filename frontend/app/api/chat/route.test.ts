import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

describe("POST /api/chat (proxy)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("encaminha o body para o backend e repassa status/corpo da resposta", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 200,
      headers: new Headers({ "Content-Type": "application/json" }),
      text: async () =>
        JSON.stringify({ answer: "Resposta real.", source: "resume" }),
    } as unknown as Response);

    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ question: "Onde você trabalha?" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      answer: "Resposta real.",
      source: "resume",
    });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/chat",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("encaminha o campo history sem alteração (T04, ADR-014)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 200,
      headers: new Headers({ "Content-Type": "application/json" }),
      text: async () =>
        JSON.stringify({ answer: "Fica em SP.", source: "resume" }),
    } as unknown as Response);
    const bodyWithHistory = {
      question: "Onde fica a matriz da empresa?",
      history: [
        { role: "user", content: "Onde Lucas trabalha?" },
        { role: "assistant", content: "Na Engineering Brasil." },
      ],
    };

    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify(bodyWithHistory),
    });

    await POST(request);

    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/chat",
      expect.objectContaining({ body: JSON.stringify(bodyWithHistory) }),
    );
  });

  it("retorna 400 sem chamar o backend quando o body não é JSON válido", async () => {
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      body: "isso não é JSON",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("retorna 502 quando o backend de chat está indisponível", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network error"));

    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ question: "Onde você trabalha?" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      detail: "Backend de chat indisponível.",
    });
  });
});
