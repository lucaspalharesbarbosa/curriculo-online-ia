import { NextResponse } from "next/server";

/** Backend FastAPI — server-only; default local. Em produção (Vercel): URL do Render. */
const API_URL =
  process.env.API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

/**
 * Proxy same-origin do chat (US-07-13 / ADR-002).
 * O browser chama `/api/chat`; o Next encaminha ao FastAPI — sem CORS no client.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "JSON inválido." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { detail: "Backend de chat indisponível." },
      { status: 502 },
    );
  }
}
