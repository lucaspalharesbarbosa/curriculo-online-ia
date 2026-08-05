import pytest

from app import rag
from app.models.resume import Resume
from app.rag import (
    Chunk,
    EmbeddedChunk,
    build_chunks,
    cosine_similarity,
    embed_text,
    search,
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
            {"category": "Linguagens", "items": ["Python", "Java"]},
            {"category": "Cloud", "items": ["AWS"]},
        ],
        "certifications": [],
        "projects": [
            {
                "title": "Projeto X",
                "description": "Descrição do projeto X.",
                "technologies": ["Next.js"],
                "repositoryUrl": "https://github.com/exemplo/projeto-x",
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


def test_build_chunks_gera_um_chunk_por_experiencia_skill_e_projeto() -> None:
    chunks = build_chunks(FIXTURE_RESUME)

    total_esperado = (
        len(FIXTURE_RESUME.experiences)
        + len(FIXTURE_RESUME.skills)
        + len(FIXTURE_RESUME.projects)
    )
    assert len(chunks) == total_esperado


def test_build_chunks_nao_gera_texto_vazio() -> None:
    chunks = build_chunks(FIXTURE_RESUME)

    assert all(chunk.text.strip() for chunk in chunks)


def test_build_chunks_cobre_as_tres_secoes() -> None:
    chunks = build_chunks(FIXTURE_RESUME)

    sections = {chunk.section for chunk in chunks}
    assert sections == {"experience", "skill", "project"}


def test_chunk_de_experiencia_contem_empresa_e_tecnologias() -> None:
    chunks = build_chunks(FIXTURE_RESUME)

    experience_chunk = next(c for c in chunks if c.id == "experience-0")
    assert "Empresa A" in experience_chunk.text
    assert "Python" in experience_chunk.text


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
