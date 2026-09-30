"""Regressão das perguntas básicas que o assistente errava (ADR-020).

Causas raiz cobertas aqui:
1. Cidade, cargo e contatos não estavam em nenhum chunk: "onde ele mora?",
   "qual o e-mail?" e "qual o LinkedIn?" não tinham como ser respondidas.
2. `TOP_K=3` truncava perguntas de listagem: 9 certificações viravam 2.
3. Perguntas de listagem citando uma empresa ("skills no Itaú") não podem ser
   desviadas para a seção de lista: a resposta está no chunk da experiência.
"""

from __future__ import annotations

import pytest

from app.chat import rag
from app.chat.rag import Chunk, EmbeddedChunk, build_chunks, detect_section_intent
from app.resume.models import Resume
from tests.chat.fakes import FakeEmbeddingProvider
from tests.chat.test_rag import FIXTURE_RESUME

COMPANIES = ["Itaú Unibanco", "Banco BV", "Engineering Brasil", "Shift"]


def _chunk(section: str, index: int) -> EmbeddedChunk:
    return EmbeddedChunk(
        chunk=Chunk(
            id=f"{section}-{index}", section=section, text=f"{section} {index}"
        ),
        embedding=[1.0, 0.0],
    )


def test_chunk_de_resumo_carrega_nome_cargo_e_cidade() -> None:
    summary = next(c for c in build_chunks(FIXTURE_RESUME) if c.section == "summary")

    assert "Fulano de Tal" in summary.text
    assert "Cargo: Engenheiro de Software." in summary.text
    assert "Mora em Remoto" in summary.text


def test_chunk_de_contato_tem_email_linkedin_e_github() -> None:
    contact = next(c for c in build_chunks(FIXTURE_RESUME) if c.section == "contact")

    assert "fulano@example.com" in contact.text
    assert "https://www.linkedin.com/in/exemplo/" in contact.text
    assert "https://github.com/exemplo" in contact.text


def test_chunk_de_contato_inclui_whatsapp_quando_existe() -> None:
    data = FIXTURE_RESUME.model_dump(by_alias=True, mode="json")
    data["contact"]["whatsapp"] = "https://wa.me/5511999999999"
    resume = Resume.model_validate(data)

    contact = next(c for c in build_chunks(resume) if c.section == "contact")

    assert "https://wa.me/5511999999999" in contact.text


@pytest.mark.parametrize(
    ("question", "section"),
    [
        ("Qual o email de contato?", "contact"),
        ("Qual o e-mail dele?", "contact"),
        ("Qual o LinkedIn dele?", "contact"),
        ("Qual o GitHub do Lucas?", "contact"),
        ("Como entro em contato com ele?", "contact"),
        ("Onde ele mora?", "summary"),
        ("Em que cidade o Lucas mora?", "summary"),
        ("Quem é o Lucas?", "summary"),
        ("Fala sobre ele", "summary"),
        ("Quais certificações ele tem?", "certification"),
        ("O Lucas escreveu algum artigo?", "article"),
        ("Quais reconhecimentos ele recebeu?", "recognition"),
        ("Quais projetos ele fez?", "project"),
        ("Quais são as principais skills?", "skill"),
    ],
)
def test_perguntas_basicas_sao_roteadas_para_a_secao_certa(
    question: str, section: str
) -> None:
    assert detect_section_intent(question, COMPANIES) == section


@pytest.mark.parametrize(
    "question",
    [
        "Que skills usei na Itaú Unibanco?",
        "Quais projetos ele fez no Banco BV?",
        "Que certificações ele ganhou na Engineering Brasil?",
    ],
)
def test_pergunta_de_lista_com_empresa_nao_e_desviada_para_a_lista(
    question: str,
) -> None:
    assert detect_section_intent(question, COMPANIES) is None


def test_experiencia_e_formacao_seguem_antes_das_novas_secoes() -> None:
    assert detect_section_intent("Onde ele trabalha e mora?", COMPANIES) == "experience"
    assert detect_section_intent("Onde ele estudou?", COMPANIES) == "education"


def test_listagem_traz_a_secao_inteira_e_nao_so_tres_itens() -> None:
    """Regressão: 9 certificações viravam 2 na resposta por causa do TOP_K=3."""
    index = [_chunk("certification", i) for i in range(9)] + [
        _chunk("skill", i) for i in range(5)
    ]

    results = rag.search_with_routing(
        "Quais certificações ele tem?",
        index,
        FakeEmbeddingProvider(),
        top_k=3,
        company_names=COMPANIES,
    )

    assert len(results) == 9
    assert {chunk.section for chunk, _ in results} == {"certification"}


def test_listagem_respeita_o_teto_de_itens() -> None:
    index = [_chunk("skill", i) for i in range(30)]

    results = rag.search_with_routing(
        "Quais são as skills?",
        index,
        FakeEmbeddingProvider(),
        top_k=3,
        company_names=COMPANIES,
    )

    assert len(results) == rag.MAX_LIST_TOP_K


def test_pergunta_sem_lista_continua_com_top_k_padrao() -> None:
    index = [_chunk("certification", i) for i in range(9)]

    results = rag.search_with_routing(
        "Já usou Kubernetes?",
        index,
        FakeEmbeddingProvider(),
        top_k=3,
        company_names=COMPANIES,
    )

    assert len(results) == 3


def test_titulo_do_chunk_leva_so_o_cargo() -> None:
    """Regressão: "Agentic AI" do título era lido como nome de empresa."""
    title = (
        "Tech Lead | Senior Software Engineer"
        + rag.TITLE_SEPARATOR
        + "AI Engineering | Agentic AI"
    )

    assert rag._describe_title(title) == "Cargo: Tech Lead, Senior Software Engineer."
    assert "Agentic" not in rag._describe_title(title)
