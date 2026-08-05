# Padrões de Implementação — Currículo Online

Guia prático para o `@senior-developer`. Projeto solo, pequeno — manter simples.

---

## 1. Estrutura do monorepo

```
frontend/
  app/
  components/
  content/resume.json
backend/
  app/
    main.py
    rag.py
    chat.py
  requirements.txt
```

---

## 2. Componente de UI (Next.js + TS + Tailwind)

```tsx
import resume from "@/content/resume.json";

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <article className="rounded-lg border p-4">
      <h3 className="font-semibold">{experience.role} — {experience.company}</h3>
      <p className="text-sm text-muted-foreground">{experience.period}</p>
      <ul className="mt-2 list-disc pl-4">
        {experience.highlights.map((h) => <li key={h}>{h}</li>)}
      </ul>
    </article>
  );
}
```

### Checklist

- [ ] Tipado (interface/type do dado vindo de `resume.json`)
- [ ] Sem string de conteúdo hardcoded — vem do JSON
- [ ] Alt em imagens, contraste ok, navegável por teclado
- [ ] Teste com Testing Library

---

## 3. Teste de componente

Identificador em inglês, display (título do `it()`/`test()`) em PT-BR — `../../qa-engineer/references/test-naming-convention.md`:

```tsx
import { render, screen } from "@testing-library/react";
import { ExperienceCard } from "./ExperienceCard";

test("exibe cargo e empresa", () => {
  render(<ExperienceCard experience={{ role: "Dev", company: "X", period: "2020-2023", highlights: [] }} />);
  expect(screen.getByText(/Dev — X/)).toBeInTheDocument();
});
```

---

## 4. Endpoint FastAPI

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        answer = generate_answer(request.question)
    except OpenAIError:
        # mapeamento de erro do DoR: falha do LLM -> 503 com mensagem de fallback
        raise HTTPException(status_code=503, detail="Não foi possível gerar a resposta agora.")
    return ChatResponse(answer=answer)
```

### Checklist

- [ ] Request/response tipados com Pydantic
- [ ] CORS restrito ao domínio do frontend
- [ ] Sem chave de API hardcoded (`os.environ`)
- [ ] Erros implementados batem com o mapeamento do DoR (exceção → HTTP → body → mensagem)
- [ ] Teste com `TestClient` cobrindo caso feliz e cada erro do mapeamento

---

## 5. RAG simples (`rag.py`)

```python
import json
from pathlib import Path

def load_chunks(resume_path: Path) -> list[str]:
    resume = json.loads(resume_path.read_text())
    chunks = []
    for exp in resume["experiences"]:
        chunks.append(f"{exp['role']} na {exp['company']}: {'; '.join(exp['highlights'])}")
    return chunks

def most_similar(question_embedding, chunk_embeddings, chunks, top_k=3) -> list[str]:
    # similaridade de cosseno simples, sem banco vetorial
    ...
```

Cuidados:
- Chunk por seção do `resume.json` (experiência, skill, projeto) — não o JSON inteiro de uma vez
- Embeddings gerados uma vez e cacheados (arquivo/memória), não recalculados por request
- Sem framework pesado (LangChain/LlamaIndex) — o objetivo do plano é RAG "do zero"

---

## 6. Teste de endpoint

Identificador em inglês, docstring de uma linha em PT-BR como display — `../../qa-engineer/references/test-naming-convention.md`:

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chat_returns_answer():
    """Retorna a resposta gerada quando a pergunta é válida."""
    response = client.post("/chat", json={"question": "Quais projetos em React?"})
    assert response.status_code == 200
    assert "answer" in response.json()


def test_chat_returns_fallback_on_llm_error():
    """Retorna 503 com mensagem de fallback quando o LLM falha."""
    ...
```

```bash
cd backend
pytest
```

---

## 7. Atualizar `resume.json`

Ao adicionar/alterar seção do currículo:
1. Editar só o JSON
2. Rodar os testes de componentes que leem aquele campo
3. Se mudou o schema (campo renomeado/removido), atualizar `rag.py` (chunking) também
