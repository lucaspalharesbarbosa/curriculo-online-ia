import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

describe("POST /api/chat/feedback (proxy)", () => {
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
      text: async () => JSON.stringify({ ok: true }),
    } as unknown as Response);

    const request = new Request("http://localhost/api/chat/feedback", {
      method: "POST",
      body: JSON.stringify({
        question: "Qual sua stack?",
        answer: "Next.js e FastAPI.",
        rating: "up",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/chat/feedback",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("retorna 400 sem chamar o backend quando o body não é JSON válido", async () => {
    const request = new Request("http://localhost/api/chat/feedback", {
      method: "POST",
      body: "isso não é JSON",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("retorna 502 quando o backend de chat está indisponível", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network error"));

    const request = new Request("http://localhost/api/chat/feedback", {
      method: "POST",
      body: JSON.stringify({
        question: "Qual sua stack?",
        answer: "Next.js e FastAPI.",
        rating: "down",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      detail: "Backend de chat indisponível.",
    });
  });
});
