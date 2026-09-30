"""Testes da busca híbrida, semântica mais léxica (`ADR-018`)."""

from __future__ import annotations

import pytest

from app.chat import rag, service
from tests.chat.fakes import (
    FakeChatCompletionProvider,
    FakeEmbeddingProviderByText,
    FakeWebSearchProvider,
)

QUESTION = "Já trabalhou com Kubernetes?"
KUBERNETES_CHUNK = rag.Chunk(
    id="experience-0", section="experience", text="Banco BV. Tecnologias: Kubernetes."
)
SEMANTIC_CHUNK = rag.Chunk(
    id="skill-0", section="skill", text="Skills de DevOps: Docker, Git, GitLab."
)


def _index() -> list[rag.EmbeddedChunk]:
    # O chunk sem o termo exato é semanticamente um pouco mais próximo.
    return [
        rag.EmbeddedChunk(chunk=SEMANTIC_CHUNK, embedding=[0.9, 0.436]),
        rag.EmbeddedChunk(chunk=KUBERNETES_CHUNK, embedding=[0.8, 0.6]),
    ]


def _provider() -> FakeEmbeddingProviderByText:
    return FakeEmbeddingProviderByText({QUESTION: [1.0, 0.0]})


def test_sem_peso_lexical_o_comportamento_e_o_anterior() -> None:
    """Peso 0 (padrão) ordena só por cosseno, como antes do ADR-018."""
    results = rag.search(QUESTION, _index(), _provider(), top_k=2)

    assert results[0][0].id == "skill-0"


def test_bonus_lexical_sobe_o_chunk_com_o_termo_exato() -> None:
    """O termo exato 'Kubernetes' passa à frente do chunk só semanticamente próximo."""
    results = rag.search(
        QUESTION, _index(), _provider(), top_k=2, lexical_weight=rag.LEXICAL_WEIGHT
    )

    assert results[0][0].id == "experience-0"


def test_bonus_e_proporcional_aos_termos_distintivos_encontrados() -> None:
    """Stopwords e verbos genéricos ('já', 'trabalhou', 'com') não contam."""
    tokens = rag._distinctive_tokens(QUESTION)

    assert tokens == {"kubernetes"}


def test_sem_termo_distintivo_nao_ha_bonus() -> None:
    """Pergunta só de stopwords não altera o score."""
    assert rag._lexical_bonus(set(), "qualquer texto", 0.2) == 0.0
    assert rag._lexical_bonus({"x"}, "outro texto", 0.0) == 0.0


def test_search_with_routing_repassa_o_peso_lexical() -> None:
    """O roteamento por seção não descarta o peso da busca híbrida."""
    results = rag.search_with_routing(
        QUESTION, _index(), _provider(), top_k=2, lexical_weight=rag.LEXICAL_WEIGHT
    )

    assert results[0][0].id == "experience-0"


@pytest.mark.parametrize(
    ("flag", "expected"), [(True, rag.LEXICAL_WEIGHT), (False, 0.0)]
)
def test_service_liga_a_busca_hibrida_pelo_parametro(
    monkeypatch: pytest.MonkeyPatch, flag: bool, expected: float
) -> None:
    """`enable_hybrid` decide o peso lexical enviado ao retrieval."""
    captured: dict[str, float] = {}

    def fake_search(
        question, index, provider, top_k=3, lexical_weight=0.0, company_names=()
    ):
        captured["weight"] = lexical_weight
        return [(KUBERNETES_CHUNK, 0.9)]

    monkeypatch.setattr(rag, "search_with_routing", fake_search)
    monkeypatch.setattr(service, "_index_cache", _index())

    service.answer_question(
        QUESTION,
        _provider(),
        FakeChatCompletionProvider(answer="ok"),
        FakeWebSearchProvider(),
        enable_hybrid=flag,
    )

    assert captured["weight"] == expected
