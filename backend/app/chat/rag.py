"""Chunking, ranking e roteamento do fluxo de RAG (ADR-003, ADR-010, ADR-012).

Domínio puro: recebe `EmbeddingProvider` (`ports.py`) por parâmetro em vez de
instanciar `openai.OpenAI` direto — a implementação real do provider vive em
`adapters/openai_adapter.py`.
"""

from __future__ import annotations

import hashlib
import json
import math
import re
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

from app.chat.ports import EmbeddingProvider
from app.resume.models import (
    Article,
    Certification,
    Education,
    Experience,
    Project,
    Recognition,
    Resume,
    SkillGroup,
)

RESUME_JSON_PATH = (
    Path(__file__).resolve().parents[3] / "frontend" / "content" / "resume.json"
)
INDEX_CACHE_PATH = Path(__file__).resolve().parent / "rag_index.json"


@dataclass(frozen=True)
class Chunk:
    id: str
    section: str
    text: str
    # ADR-010 seção 1: chave de recência textual ("YYYY-MM"), só preenchida em
    # chunks de `experience`. `None`/cargo atual vira sentinela alta para
    # ordenar primeiro num sort descendente por string.
    recency_key: str | None = field(default=None)


@dataclass(frozen=True)
class EmbeddedChunk:
    chunk: Chunk
    embedding: list[float]


def load_resume(path: Path = RESUME_JSON_PATH) -> Resume:
    data = json.loads(path.read_text(encoding="utf-8"))
    return Resume.model_validate(data)


EXPERIENCE_ONGOING_RECENCY_KEY = "9999-99"


def _chunk_resume_summary(resume: Resume) -> Chunk:
    # ADR-013: chunk dedicado ao resumo/bio (hero.summary + about) — texto
    # livre que já descreve a atuação atual em prosa, como sinal redundante
    # ao roteamento por seção/recência para perguntas gerais ("o que você
    # faz hoje?").
    text = f"{resume.hero.summary} {resume.about}"
    return Chunk(id="summary-0", section="summary", text=text)


def _chunk_experience(index: int, experience: Experience) -> Chunk:
    period = f"{experience.start_date} a {experience.end_date or 'o momento'}"
    # ADR-013: highlights como lista com marcadores, não uma frase corrida —
    # preserva a estrutura que ajuda o modelo a "ler" itens distintos.
    highlights = "\n".join(f"- {highlight}" for highlight in experience.highlights)
    technologies = ", ".join(experience.technologies)
    text = (
        f"{experience.role} na {experience.company}, {period}, "
        f"{experience.location} ({experience.modality}).\n{highlights}\n"
        f"Tecnologias: {technologies}."
    )
    # Sem end_date = cargo atual → sentinela alta, ordena primeiro (ADR-010).
    recency_key = experience.end_date or EXPERIENCE_ONGOING_RECENCY_KEY
    return Chunk(
        id=f"experience-{index}",
        section="experience",
        text=text,
        recency_key=recency_key,
    )


SKILL_LEVEL_LABELS = {
    1: "iniciante",
    2: "básico",
    3: "intermediário",
    4: "avançado",
    5: "especialista",
}


def _chunk_skill_group(index: int, group: SkillGroup) -> Chunk:
    items = ", ".join(
        f"{item.name} ({SKILL_LEVEL_LABELS.get(item.level, 'intermediário')})"
        for item in group.items
    )
    text = f"Skills de {group.category}: {items}."
    return Chunk(id=f"skill-{index}", section="skill", text=text)


def _chunk_project(index: int, project: Project) -> Chunk:
    technologies = ", ".join(project.technologies)
    text = (
        f"Projeto {project.title}: {project.description} "
        f"Tecnologias: {technologies}."
    )
    return Chunk(id=f"project-{index}", section="project", text=text)


def _chunk_certification(index: int, certification: Certification) -> Chunk:
    validity = (
        f", válido até {certification.expires_at}"
        if certification.expires_at is not None
        else ""
    )
    text = (
        f"Certificação/reconhecimento: {certification.name}, "
        f"emitido por {certification.issuer} em {certification.issued_at}"
        f"{validity}."
    )
    return Chunk(id=f"certification-{index}", section="certification", text=text)


def _chunk_recognition(index: int, recognition: Recognition) -> Chunk:
    description = f" {recognition.description}" if recognition.description else ""
    text = (
        f"Reconhecimento interno: {recognition.title}, "
        f"concedido por {recognition.issuer} em {recognition.year}.{description}"
    )
    return Chunk(id=f"recognition-{index}", section="recognition", text=text)


def _chunk_education(index: int, education: Education) -> Chunk:
    text = (
        f"Formação: {education.degree} em {education.institution}, "
        f"{education.start_date} a {education.end_date}."
    )
    return Chunk(id=f"education-{index}", section="education", text=text)


def _chunk_article(index: int, article: Article) -> Chunk:
    text = (
        f"Artigo escrito: {article.title}. {article.description} "
        f"Publicado em {article.source}."
    )
    return Chunk(id=f"article-{index}", section="article", text=text)


def build_chunks(resume: Resume) -> list[Chunk]:
    """Um chunk de resumo/bio + um chunk por experiência, grupo de skills, projeto,
    certificação, reconhecimento, formação e artigo (ADR-003 seção 1, ampliado
    pela ADR-006, seu addendum e pela ADR-013)."""
    chunks = [_chunk_resume_summary(resume)]
    chunks += [
        _chunk_experience(i, experience)
        for i, experience in enumerate(resume.experiences)
    ]
    chunks += [_chunk_skill_group(i, group) for i, group in enumerate(resume.skills)]
    chunks += [_chunk_project(i, project) for i, project in enumerate(resume.projects)]
    chunks += [
        _chunk_certification(i, certification)
        for i, certification in enumerate(resume.certifications)
    ]
    chunks += [
        _chunk_recognition(i, recognition)
        for i, recognition in enumerate(resume.recognitions)
    ]
    chunks += [
        _chunk_education(i, education) for i, education in enumerate(resume.education)
    ]
    chunks += [_chunk_article(i, article) for i, article in enumerate(resume.articles)]
    return chunks


def embed_chunks(
    chunks: list[Chunk], embedding_provider: EmbeddingProvider
) -> list[EmbeddedChunk]:
    return [
        EmbeddedChunk(chunk=chunk, embedding=embedding_provider.embed_text(chunk.text))
        for chunk in chunks
    ]


def resume_hash(resume: Resume) -> str:
    """Hash do conteúdo do currículo — usado para invalidar o cache do índice
    quando o `resume.json` muda (ver `load_or_build_index`)."""
    payload = resume.model_dump_json(by_alias=True).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def save_index(
    embedded_chunks: list[EmbeddedChunk],
    path: Path = INDEX_CACHE_PATH,
    resume_hash_value: str | None = None,
) -> None:
    chunks_payload = [
        {
            "id": item.chunk.id,
            "section": item.chunk.section,
            "text": item.chunk.text,
            "recency_key": item.chunk.recency_key,
            "embedding": item.embedding,
        }
        for item in embedded_chunks
    ]
    payload = {"resume_hash": resume_hash_value, "chunks": chunks_payload}
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def load_index(path: Path = INDEX_CACHE_PATH) -> list[EmbeddedChunk]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    # Cache antigo (pré hash de invalidação) era uma lista solta de chunks.
    chunks_payload = payload["chunks"] if isinstance(payload, dict) else payload
    return [
        EmbeddedChunk(
            chunk=Chunk(
                id=item["id"],
                section=item["section"],
                text=item["text"],
                # .get(): cache antigo (pré-ADR-010) não tem o campo.
                recency_key=item.get("recency_key"),
            ),
            embedding=item["embedding"],
        )
        for item in chunks_payload
    ]


def load_cached_resume_hash(path: Path = INDEX_CACHE_PATH) -> str | None:
    """Hash do currículo salvo junto com o cache; `None` se ausente/formato antigo."""
    payload = json.loads(path.read_text(encoding="utf-8"))
    return payload.get("resume_hash") if isinstance(payload, dict) else None


def build_index(
    embedding_provider: EmbeddingProvider, resume: Resume | None = None
) -> list[EmbeddedChunk]:
    """Gera embeddings dos chunks do currículo (chamado 1x, nunca por request)."""
    resume = resume if resume is not None else load_resume()
    return embed_chunks(build_chunks(resume), embedding_provider)


def load_or_build_index(
    embedding_provider: EmbeddingProvider,
    path: Path = INDEX_CACHE_PATH,
    resume: Resume | None = None,
) -> list[EmbeddedChunk]:
    """Carrega o índice cacheado em JSON; gera e cacheia se não existir ou se o
    `resume.json` tiver mudado desde que o cache foi gerado (ADR-003 §3)."""
    resume = resume if resume is not None else load_resume()
    current_hash = resume_hash(resume)
    if path.exists() and load_cached_resume_hash(path) == current_hash:
        return load_index(path)
    index = build_index(embedding_provider, resume)
    save_index(index, path, resume_hash_value=current_hash)
    return index


def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot_product = sum(x * y for x, y in zip(a, b, strict=True))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)


def search(
    question: str,
    index: list[EmbeddedChunk],
    embedding_provider: EmbeddingProvider,
    top_k: int = 3,
    section: str | None = None,
    sort_by_recency: bool = False,
) -> list[tuple[Chunk, float]]:
    """Retorna os `top_k` chunks mais similares à pergunta, por similaridade desc.

    `section` restringe a busca aos chunks dessa seção antes de aplicar
    `top_k` (ADR-010 seção 1); se a seção não tiver chunks, cai de volta para
    o índice inteiro. `sort_by_recency` reordena o `top_k` resultante por
    `Chunk.recency_key` (mais recente/atual primeiro), sem mudar quais chunks
    foram selecionados — só a ordem em que entram no prompt.
    """
    question_embedding = embedding_provider.embed_text(question)
    candidates = (
        [item for item in index if item.chunk.section == section]
        if section is not None
        else index
    )
    if not candidates:
        candidates = index
    scored = [
        (item.chunk, cosine_similarity(question_embedding, item.embedding))
        for item in candidates
    ]
    scored.sort(key=lambda scored_item: scored_item[1], reverse=True)
    top = scored[:top_k]
    if sort_by_recency:
        top = sorted(
            top, key=lambda scored_item: scored_item[0].recency_key or "", reverse=True
        )
    return top


# ADR-010 seção 1: dicionário pequeno de palavras-chave → seção, não um
# classificador novo. Termos já normalizados sem acento (ver `_normalize`).
_EDUCATION_INTENT_KEYWORDS = {
    "estudei",
    "estudou",
    "estudo",
    "formacao",
    "faculdade",
    "graduacao",
    "universidade",
    "onde estudei",
    "onde estudou",
}
_EXPERIENCE_INTENT_KEYWORDS = {
    "empresa",
    "trabalho atual",
    "trabalho hoje",
    "onde trabalho",
    "onde voce trabalha",
    "onde trabalha",
    "ultima empresa",
    "emprego atual",
    "trabalha atualmente",
    "ultima experiencia",
    "experiencia atual",
}
_RECENCY_INTENT_KEYWORDS = {"ultima", "ultimo", "atual", "recente", "hoje", "agora"}

SECTION_INTENT_KEYWORDS: dict[str, set[str]] = {
    "education": _EDUCATION_INTENT_KEYWORDS,
    "experience": _EXPERIENCE_INTENT_KEYWORDS,
}


def _normalize(text: str) -> str:
    """Minúsculo e sem acento — casa "última" com "ultima" no dicionário."""
    decomposed = unicodedata.normalize("NFKD", text.lower())
    return "".join(char for char in decomposed if not unicodedata.combining(char))


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"\w+", _normalize(text)))


def detect_section_intent(question: str) -> str | None:
    """Seção-alvo da pergunta, por palavra-chave (ADR-010); `None` se nenhuma bater.

    Casa por conjunto de tokens, não substring literal — tolera palavras
    inseridas entre os termos da keyword (ex. "onde Lucas trabalha" ainda
    casa com a keyword "onde trabalha", que exige só os tokens "onde" e
    "trabalha" em qualquer posição da pergunta).
    """
    question_tokens = _tokenize(question)
    for section, keywords in SECTION_INTENT_KEYWORDS.items():
        for keyword in keywords:
            if _tokenize(keyword) <= question_tokens:
                return section
    return None


def wants_recency(question: str) -> bool:
    """`True` se a pergunta pede o cargo/experiência mais recente/atual (ADR-010)."""
    normalized_question = _normalize(question)
    return any(keyword in normalized_question for keyword in _RECENCY_INTENT_KEYWORDS)


def search_with_routing(
    question: str,
    index: list[EmbeddedChunk],
    embedding_provider: EmbeddingProvider,
    top_k: int = 3,
) -> list[tuple[Chunk, float]]:
    """`search()` com roteamento por seção/recência (ADR-010); fallback = busca atual.

    Pergunta sem palavra-chave reconhecida chama `search()` sem restrição de
    seção — comportamento idêntico ao pré-ADR-010, sem regressão.
    """
    section = detect_section_intent(question)
    sort_by_recency = section == "experience" and wants_recency(question)
    return search(
        question,
        index,
        embedding_provider,
        top_k=top_k,
        section=section,
        sort_by_recency=sort_by_recency,
    )


def extract_known_entities(resume: Resume) -> list[str]:
    """Nomes de entidades citáveis do currículo (ADR-010 seção 2, US-11-07).

    Usado por `chat.py` para decidir se a busca web pode ser acionada — a
    pergunta precisa citar uma entidade que já existe no `resume.json`
    (empresa, instituição, certificação/curso, habilidade ou projeto), não
    hardcoded aqui.
    """
    entities: list[str] = []
    entities += [experience.company for experience in resume.experiences]
    entities += [education.institution for education in resume.education]
    entities += [certification.name for certification in resume.certifications]
    entities += [certification.issuer for certification in resume.certifications]
    entities += [item.name for group in resume.skills for item in group.items]
    entities += [project.title for project in resume.projects]
    return [entity for entity in entities if entity]
