import pytest

from app import rag
from app.models.resume import Resume
from app.rag import (
    Chunk,
    EmbeddedChunk,
    build_chunks,
    cosine_similarity,
    detect_section_intent,
    embed_text,
    extract_known_entities,
    search,
    search_with_routing,
    wants_recency,
)

FIXTURE_RESUME = Resume.model_validate(
    {
        "hero": {
            "name": "Fulano de Tal",
            "title": "Engenheiro de Software",
            "location": "Remoto",
            "summary": "Resumo curto.",
        },
        "about": "Sobre o Fulano.",
        "experiences": [
            {
                "company": "Empresa A",
                "role": "Dev Sênior",
                "startDate": "2022-01",
                "endDate": None,
                "location": "Remoto",
                "modality": "Remoto",
                "highlights": ["Fez X", "Fez Y"],
                "technologies": ["Python", "FastAPI"],
            },
            {
                "company": "Empresa B",
                "role": "Dev Pleno",
                "startDate": "2019-01",
                "endDate": "2021-12",
                "location": "São Paulo, SP",
                "modality": "Presencial",
                "highlights": ["Fez Z"],
                "technologies": ["Java"],
            },
        ],
        "education": [
            {
                "institution": "Faculdade X",
                "degree": "Ciência da Computação",
                "startDate": "2015",
                "endDate": "2018",
            }
        ],
        "skills": [
            {
                "category": "Linguagens",
                "items": [
                    {"name": "Python", "level": 4},
                    {"name": "Java", "level": 5},
                ],
            },
            {"category": "Cloud", "items": [{"name": "AWS", "level": 4}]},
        ],
        "certifications": [
            {
                "name": "Certificação Exemplo",
                "issuer": "Instituto Exemplo",
                "issuedAt": "2020-05",
                "expiresAt": None,
                "credentialUrl": None,
            }
        ],
        "recognitions": [
            {
                "title": "Reconhecimento Exemplo",
                "issuer": "Empresa A",
                "year": "2023",
                "description": "Descrição do reconhecimento exemplo.",
            }
        ],
        "projects": [
            {
                "title": "Projeto X",
                "description": "Descrição do projeto X.",
                "technologies": ["Next.js"],
                "repositoryUrl": "https://github.com/exemplo/projeto-x",
            }
        ],
        "articles": [
            {
                "title": "Artigo Exemplo",
                "description": "Descrição do artigo exemplo.",
                "url": "https://blog.exemplo.com/artigo-exemplo",
                "source": "Blog Exemplo",
                "publishedAt": None,
            }
        ],
        "contact": {
            "linkedin": "https://www.linkedin.com/in/exemplo/",
            "email": "fulano@example.com",
            "github": "https://github.com/exemplo",
            "resumePdfUrl": None,
        },
    }
)


def test_build_chunks_gera_um_chunk_por_secao_do_curriculo() -> None:
    chunks = build_chunks(FIXTURE_RESUME)

    total_esperado = (
        len(FIXTURE_RESUME.experiences)
        + len(FIXTURE_RESUME.skills)
        + len(FIXTURE_RESUME.projects)
        + len(FIXTURE_RESUME.certifications)
        + len(FIXTURE_RESUME.recognitions)
        + len(FIXTURE_RESUME.education)
        + len(FIXTURE_RESUME.articles)
    )
    assert len(chunks) == total_esperado


def test_build_chunks_nao_gera_texto_vazio() -> None:
    chunks = build_chunks(FIXTURE_RESUME)

    assert all(chunk.text.strip() for chunk in chunks)


def test_build_chunks_cobre_as_sete_secoes() -> None:
    chunks = build_chunks(FIXTURE_RESUME)

    sections = {chunk.section for chunk in chunks}
    assert sections == {
        "experience",
        "skill",
        "project",
        "certification",
        "recognition",
        "education",
        "article",
    }


def test_chunk_de_experiencia_contem_empresa_e_tecnologias() -> None:
    chunks = build_chunks(FIXTURE_RESUME)

    experience_chunk = next(c for c in chunks if c.id == "experience-0")
    assert "Empresa A" in experience_chunk.text
    assert "Python" in experience_chunk.text


def test_chunk_de_experiencia_sem_end_date_recebe_sentinela_de_recencia_alta() -> None:
    """CA-002 (US-11-06): cargo atual (sem end_date) deve ordenar primeiro."""
    chunks = build_chunks(FIXTURE_RESUME)

    current_role = next(c for c in chunks if c.id == "experience-0")
    past_role = next(c for c in chunks if c.id == "experience-1")
    assert current_role.recency_key == rag.EXPERIENCE_ONGOING_RECENCY_KEY
    assert past_role.recency_key == "2021-12"
    assert current_role.recency_key > past_role.recency_key


def test_chunk_de_certificacao_contem_nome_e_emissor() -> None:
    """Chunk de certificação inclui nome e emissor no texto."""
    chunks = build_chunks(FIXTURE_RESUME)

    certification_chunk = next(c for c in chunks if c.id == "certification-0")
    assert "Certificação Exemplo" in certification_chunk.text
    assert "Instituto Exemplo" in certification_chunk.text


def test_chunk_de_reconhecimento_contem_titulo_emissor_e_descricao() -> None:
    """Chunk de reconhecimento inclui título, emissor e descrição no texto."""
    chunks = build_chunks(FIXTURE_RESUME)

    recognition_chunk = next(c for c in chunks if c.id == "recognition-0")
    assert "Reconhecimento Exemplo" in recognition_chunk.text
    assert "Empresa A" in recognition_chunk.text
    assert "Descrição do reconhecimento exemplo." in recognition_chunk.text


class _FakeEmbeddingData:
    def __init__(self, embedding: list[float]) -> None:
        self.embedding = embedding


class _FakeEmbeddingResponse:
    def __init__(self, embedding: list[float]) -> None:
        self.data = [_FakeEmbeddingData(embedding)]


class _FakeEmbeddingsResource:
    def __init__(self, embedding_by_text: dict[str, list[float]]) -> None:
        self._embedding_by_text = embedding_by_text

    def create(self, model: str, input: str) -> _FakeEmbeddingResponse:  # noqa: A002
        return _FakeEmbeddingResponse(self._embedding_by_text[input])


class _FakeOpenAIClient:
    def __init__(self, embedding_by_text: dict[str, list[float]]) -> None:
        self.embeddings = _FakeEmbeddingsResource(embedding_by_text)


def test_get_client_configura_timeout_e_max_retries(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-001/CA-002: timeout explícito e no máximo 1 retry (ADR-004)."""
    monkeypatch.setenv("LLM_API_KEY", "test-key-not-real")
    rag.get_client.cache_clear()

    client = rag.get_client()

    assert client.timeout == rag.OPENAI_TIMEOUT_SECONDS
    assert client.timeout == 20.0
    assert 15.0 <= client.timeout <= 30.0
    assert client.max_retries == rag.OPENAI_MAX_RETRIES
    assert client.max_retries == 1

    rag.get_client.cache_clear()


def test_embed_text_retorna_vetor_do_client_mockado(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    fake_client = _FakeOpenAIClient({"pergunta": [0.1, 0.2, 0.3]})
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    embedding = embed_text("pergunta")

    assert embedding == [0.1, 0.2, 0.3]


def test_embed_chunks_associa_cada_chunk_ao_seu_embedding(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    chunks = [
        Chunk(id="a", section="skill", text="texto a"),
        Chunk(id="b", section="skill", text="texto b"),
    ]
    fake_client = _FakeOpenAIClient({"texto a": [1.0, 0.0], "texto b": [0.0, 1.0]})
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    embedded = rag.embed_chunks(chunks)

    assert [item.chunk.id for item in embedded] == ["a", "b"]
    assert embedded[0].embedding == [1.0, 0.0]
    assert embedded[1].embedding == [0.0, 1.0]


def test_cosine_similarity_identicos_e_ortogonais() -> None:
    assert cosine_similarity([1.0, 0.0], [1.0, 0.0]) == pytest.approx(1.0)
    assert cosine_similarity([1.0, 0.0], [0.0, 1.0]) == pytest.approx(0.0)


def test_search_retorna_chunk_mais_similar_primeiro(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    index = [
        EmbeddedChunk(
            chunk=Chunk(id="a", section="skill", text="Python"), embedding=[1.0, 0.0]
        ),
        EmbeddedChunk(
            chunk=Chunk(id="b", section="skill", text="Java"), embedding=[0.0, 1.0]
        ),
    ]
    fake_client = _FakeOpenAIClient({"pergunta sobre python": [1.0, 0.0]})
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    results = search("pergunta sobre python", index, top_k=1)

    assert len(results) == 1
    assert results[0][0].id == "a"
    assert results[0][1] == pytest.approx(1.0)


def test_save_e_load_index_faz_round_trip_via_json(tmp_path) -> None:  # noqa: ANN001
    path = tmp_path / "rag_index.json"
    embedded_chunks = [
        EmbeddedChunk(
            chunk=Chunk(id="a", section="skill", text="Python"), embedding=[1.0, 0.0]
        )
    ]

    rag.save_index(embedded_chunks, path)
    loaded = rag.load_index(path)

    assert path.exists()
    assert loaded == embedded_chunks


def test_load_or_build_index_reaproveita_cache_existente_sem_chamar_client(
    tmp_path, monkeypatch: pytest.MonkeyPatch  # noqa: ANN001
) -> None:
    path = tmp_path / "rag_index.json"
    cached = [
        EmbeddedChunk(
            chunk=Chunk(id="a", section="skill", text="Python"), embedding=[1.0, 0.0]
        )
    ]
    rag.save_index(cached, path)

    def _fail_if_called() -> None:
        raise AssertionError("build_index não deveria ser chamado com cache existente")

    monkeypatch.setattr(rag, "build_index", lambda *a, **k: _fail_if_called())

    loaded = rag.load_or_build_index(path)

    assert loaded == cached


def test_load_or_build_index_gera_e_cacheia_quando_nao_existe(
    tmp_path, monkeypatch: pytest.MonkeyPatch  # noqa: ANN001
) -> None:
    path = tmp_path / "rag_index.json"
    built = [
        EmbeddedChunk(
            chunk=Chunk(id="a", section="skill", text="Python"), embedding=[1.0, 0.0]
        )
    ]
    monkeypatch.setattr(rag, "build_index", lambda *a, **k: built)

    loaded = rag.load_or_build_index(path)

    assert loaded == built
    assert path.exists()
    assert rag.load_index(path) == built


def test_cosine_similarity_com_vetor_nulo_retorna_zero() -> None:
    assert cosine_similarity([0.0, 0.0], [1.0, 0.0]) == 0.0


# --- US-11-06: roteamento por seção/recência (ADR-010 seção 1) ---------------


def test_detect_section_intent_reconhece_pergunta_de_formacao() -> None:
    assert detect_section_intent("Onde você estudou?") == "education"
    assert detect_section_intent("Qual foi sua faculdade?") == "education"


def test_detect_section_intent_reconhece_pergunta_de_experiencia() -> None:
    assert detect_section_intent("Qual a última empresa que trabalhei?") == "experience"
    assert detect_section_intent("Onde você trabalha atualmente?") == "experience"


def test_detect_section_intent_retorna_none_sem_palavra_chave_reconhecida() -> None:
    assert detect_section_intent("Já trabalhou com Kubernetes?") is None


def test_wants_recency_reconhece_termos_de_atualidade() -> None:
    assert wants_recency("Qual a última empresa que trabalhei?") is True
    assert wants_recency("Onde você trabalha atualmente?") is True
    assert wants_recency("Já trabalhou com Kubernetes?") is False


def test_search_com_secao_restringe_candidatos_a_secao(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Sem `section`, o chunk fora da seção venceria por similaridade pura."""
    index = [
        EmbeddedChunk(
            chunk=Chunk(id="education-0", section="education", text="Formação X"),
            embedding=[0.0, 1.0],
        ),
        EmbeddedChunk(
            chunk=Chunk(id="experience-0", section="experience", text="Empresa X"),
            embedding=[1.0, 0.0],
        ),
    ]
    fake_client = _FakeOpenAIClient({"onde estudei?": [0.9, 0.1]})
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    unrestricted = search("onde estudei?", index, top_k=1)
    restricted = search("onde estudei?", index, top_k=1, section="education")

    assert unrestricted[0][0].id == "experience-0"
    assert restricted[0][0].id == "education-0"


def test_search_com_sort_by_recency_reordena_chunks_por_recencia(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    index = [
        EmbeddedChunk(
            chunk=Chunk(
                id="experience-0",
                section="experience",
                text="Cargo atual",
                recency_key=rag.EXPERIENCE_ONGOING_RECENCY_KEY,
            ),
            embedding=[0.5, 0.5],
        ),
        EmbeddedChunk(
            chunk=Chunk(
                id="experience-1",
                section="experience",
                text="Cargo antigo",
                recency_key="2019-12",
            ),
            embedding=[1.0, 0.0],
        ),
    ]
    fake_client = _FakeOpenAIClient({"pergunta": [1.0, 0.0]})
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    by_similarity = search("pergunta", index, top_k=2)
    by_recency = search("pergunta", index, top_k=2, sort_by_recency=True)

    # Sem recência: o cargo antigo vence por similaridade pura de embedding.
    assert [chunk.id for chunk, _score in by_similarity] == [
        "experience-1",
        "experience-0",
    ]
    # Com recência: o cargo atual (sentinela mais alta) vem primeiro.
    assert [chunk.id for chunk, _score in by_recency] == [
        "experience-0",
        "experience-1",
    ]


def test_search_with_routing_prioriza_educacao_para_pergunta_de_formacao(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-001 (US-11-06): "onde estudei?" retorna o chunk de education."""
    index = [
        EmbeddedChunk(
            chunk=Chunk(id="education-0", section="education", text="Formação X"),
            embedding=[0.0, 1.0],
        ),
        EmbeddedChunk(
            chunk=Chunk(id="skill-0", section="skill", text="Skills"),
            embedding=[1.0, 0.0],
        ),
    ]
    fake_client = _FakeOpenAIClient({"onde estudei?": [0.9, 0.1]})
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    results = search_with_routing("onde estudei?", index, top_k=1)

    assert results[0][0].id == "education-0"


def test_search_with_routing_prioriza_experiencia_recente_para_ultima_empresa(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-002 (US-11-06): "última empresa" retorna experiência mais recente primeiro."""
    index = [
        EmbeddedChunk(
            chunk=Chunk(
                id="experience-0",
                section="experience",
                text="Cargo atual na Empresa A",
                recency_key=rag.EXPERIENCE_ONGOING_RECENCY_KEY,
            ),
            embedding=[0.5, 0.5],
        ),
        EmbeddedChunk(
            chunk=Chunk(
                id="experience-1",
                section="experience",
                text="Cargo antigo na Empresa B",
                recency_key="2019-12",
            ),
            embedding=[1.0, 0.0],
        ),
    ]
    fake_client = _FakeOpenAIClient(
        {"qual a última empresa que trabalhei?": [1.0, 0.0]}
    )
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    results = search_with_routing(
        "qual a última empresa que trabalhei?", index, top_k=2
    )

    assert results[0][0].id == "experience-0"


def test_search_with_routing_sem_palavra_chave_busca_sem_restricao(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CA-003 (US-11-06): sem regressão — pergunta específica busca o índice todo."""
    index = [
        EmbeddedChunk(
            chunk=Chunk(id="skill-0", section="skill", text="Python"),
            embedding=[1.0, 0.0],
        ),
        EmbeddedChunk(
            chunk=Chunk(id="skill-1", section="skill", text="Java"),
            embedding=[0.0, 1.0],
        ),
    ]
    fake_client = _FakeOpenAIClient({"já trabalhou com kubernetes?": [1.0, 0.0]})
    monkeypatch.setattr(rag, "get_client", lambda: fake_client)

    routed = search_with_routing("já trabalhou com kubernetes?", index, top_k=1)
    plain = search("já trabalhou com kubernetes?", index, top_k=1)

    assert routed == plain


def test_extract_known_entities_retorna_nomes_citaveis_do_curriculo() -> None:
    entities = extract_known_entities(FIXTURE_RESUME)

    assert "Empresa A" in entities
    assert "Faculdade X" in entities
    assert "Certificação Exemplo" in entities
    assert "Instituto Exemplo" in entities
    assert "Python" in entities
    assert "Projeto X" in entities
