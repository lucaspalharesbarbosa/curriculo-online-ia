# Convenção de nomes de teste — código em inglês, display em PT-BR

Regra: tudo o que é **código** (nome de arquivo, função, variável, `describe`, asserts, dados de mock) fica em **inglês**, seguindo a mesma convenção de identificadores do resto do projeto (`docs/agents/CONTEXTO-PROJETO.md`). O **display** — o texto que aparece quando o teste roda (terminal, CI, relatório do `@qa-engineer`) — fica em **português brasileiro**, para leitura rápida de quem acompanha o projeto no dia a dia.

Vale para todo teste novo ou tocado (frontend e backend). Não é retrabalho retroativo obrigatório na suíte já existente — aplicar ao editar/criar.

---

## Frontend (Vitest + Testing Library)

O título passado a `it()`/`test()` **é** o display (é literalmente o que o Vitest imprime ao rodar). Esse título vai em PT-BR; o resto (nome do `describe`, variáveis, helpers, asserts) continua em inglês.

```ts
// ANTES
describe("ContactSection", () => {
  it("renders contact channels and pdf download link", () => {
    render(<ContactSection contact={mockContact} />);
    expect(screen.getByText(mockContact.email)).toBeInTheDocument();
  });
});

// DEPOIS
describe("ContactSection", () => {
  it("exibe os canais de contato e o link de download do PDF", () => {
    render(<ContactSection contact={mockContact} />);
    expect(screen.getByText(mockContact.email)).toBeInTheDocument();
  });
});
```

- `describe(...)` continua com o nome do componente/módulo (inglês, casa com o arquivo) — não é display, é identificador de agrupamento
- O título do `it()` descreve o **comportamento observável**, não a implementação (mesma regra de sempre, só muda o idioma)

## Backend (pytest)

Python não comporta bem função com nome em PT-BR acentuado como identificador de rotina (quebra `-k`, node id, greps cruzados com o resto do código em inglês) — o nome da função continua em inglês, `test_` + cenário. O display vira a **docstring de uma linha**, imediatamente abaixo da assinatura, em PT-BR.

```python
# ANTES
def test_chat_returns_fallback_on_llm_error():
    ...

# DEPOIS
def test_chat_returns_fallback_on_llm_error():
    """Retorna mensagem de fallback quando o LLM falha."""
    ...
```

- Docstring de **uma linha**, presente do indicativo, descreve o cenário testado — não repete o nome da função, complementa
- Sem docstring multi-linha (mesma regra geral de comentário do projeto: só o necessário)

## Ao revisar (`@tech-lead-review` / `@qa-engineer`)

- Teste novo sem display em PT-BR (título do `it()` em inglês, ou função pytest sem docstring) → nit, não bloqueia sozinho, mas sinalizar
- Identificador de teste (função, variável, describe) em português → sinalizar, quebra a convenção de código em inglês do projeto
