"""Regressão: recência seleciona as experiências mais recentes (`ADR-018`)."""

from __future__ import annotations

from app.chat import rag
from tests.chat.fakes import FakeEmbeddingProviderByText

QUESTION = "Qual a última empresa que você trabalhou?"


def _chunk(index: int, recency: str, embedding: list[float]) -> rag.EmbeddedChunk:
    return rag.EmbeddedChunk(
        chunk=rag.Chunk(
            id=f"experience-{index}",
            section="experience",
            text=f"Cargo {index}",
            recency_key=recency,
        ),
        embedding=embedding,
    )


def _index() -> list[rag.EmbeddedChunk]:
    # O cargo atual é o MENOS similar à pergunta; os antigos são mais próximos.
    return [
        _chunk(0, rag.EXPERIENCE_ONGOING_RECENCY_KEY, [0.5, 0.87]),
        _chunk(1, "2025-09", [0.9, 0.44]),
        _chunk(2, "2022-07", [0.95, 0.31]),
        _chunk(3, "2020-09", [0.97, 0.24]),
        _chunk(4, "2018-05", [0.99, 0.14]),
    ]


def _provider() -> FakeEmbeddingProviderByText:
    return FakeEmbeddingProviderByText({QUESTION: [1.0, 0.0]})


def test_recencia_inclui_o_cargo_atual_mesmo_sendo_o_menos_similar() -> None:
    """Antes do ADR-018 o top_k por similaridade deixava o cargo atual de fora."""
    results = rag.search_with_routing(QUESTION, _index(), _provider(), top_k=3)

    assert [chunk.id for chunk, _ in results] == [
        "experience-0",
        "experience-1",
        "experience-2",
    ]


def test_sem_recencia_a_selecao_continua_por_similaridade() -> None:
    """Pergunta sem palavra de recência não muda: top_k mais similares."""
    results = rag.search(
        "Onde você trabalhou?",
        _index(),
        FakeEmbeddingProviderByText({"Onde você trabalhou?": [1.0, 0.0]}),
        top_k=2,
        section="experience",
    )

    assert [chunk.id for chunk, _ in results] == ["experience-4", "experience-3"]
