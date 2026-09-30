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
from collections.abc import Iterable
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
# ADR-018: peso do bônus léxico da busca híbrida. Soma até LEXICAL_WEIGHT ao
# cosseno de um chunk que contém os termos distintivos da pergunta (termo
# exato, ex.: 'Kubernetes'), que o embedding sozinho às vezes não prioriza.
LEXICAL_WEIGHT = 0.2
_STOPWORDS = frozenset(
    {
        "que",
        "qual",
        "quais",
        "quando",
        "onde",
        "como",
        "para",
        "por",
        "com",
        "sem",
        "uma",
        "uns",
        "umas",
        "dos",
        "das",
        "nos",
        "nas",
        "voce",
        "meu",
        "minha",
        "meus",
        "minhas",
        "ele",
        "ela",
        "foi",
        "fui",
        "era",
        "sao",
        "tem",
        "tenho",
        "tinha",
        "fica",
        "ser",
        "estar",
        "mais",
        "muito",
        "sobre",
        "entre",
        "pelo",
        "pela",
        "trabalhou",
        "trabalhei",
        "trabalho",
        "usei",
        "usou",
        "uso",
        "ja",
        "ainda",
        "algum",
        "alguma",
        "cidade",
        "empresa",
    }
)


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


# Travessão do título do hero ("Cargo, áreas"), escrito por código para não
# depender do caractere no fonte.
TITLE_SEPARATOR = " " + chr(0x2014) + " "


def _describe_title(title: str) -> str:
    """Só o cargo do título do hero ("Cargo, travessão, áreas separadas por barra").

    As áreas ("AI Engineering | Agentic AI") já estão no texto do resumo. Em
    lista crua, o modelo as lia como nome de empresa ("especializado na
    empresa Agentic AI").
    """
    role = title.partition(TITLE_SEPARATOR)[0].replace(" | ", ", ")
    return f"Cargo: {role}."


def _chunk_resume_summary(resume: Resume) -> Chunk:
    # ADR-013: chunk dedicado ao resumo/bio (hero.summary + about) — texto
    # livre que já descreve a atuação atual em prosa, como sinal redundante
    # ao roteamento por seção/recência para perguntas gerais ("o que você
    # faz hoje?").
    # ADR-020: também carrega nome, cargo e cidade, que não estavam em nenhum
    # chunk ("onde ele mora?" não tinha resposta).
    hero = resume.hero
    text = (
        f"{hero.name}. {_describe_title(hero.title)} Mora em {hero.location}. "
        f"{hero.summary} {resume.about}"
    )
    return Chunk(id="summary-0", section="summary", text=text)


def _chunk_contact(resume: Resume) -> Chunk:
    # ADR-020: contatos públicos (os mesmos links do cabeçalho do site).
    contact = resume.contact
    parts = []
    if contact.email:
        parts.append(f"e-mail: {contact.email}")
    parts.append(f"LinkedIn: {contact.linkedin}")
    if contact.github:
        parts.append(f"GitHub: {contact.github}")
    if contact.whatsapp:
        parts.append(f"WhatsApp: {contact.whatsapp}")
    text = f"Contato de {resume.hero.name}: " + "; ".join(parts) + "."
    return Chunk(id="contact-0", section="contact", text=text)


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
    chunks = [_chunk_resume_summary(resume), _chunk_contact(resume)]
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
    """Hash do que vira índice: o currículo E o texto dos chunks gerados.

    Invalida o cache do índice quando o `resume.json` muda ou quando a lógica de
    chunking muda (ADR-020: o chunk novo de contato não entrava num índice
    antigo em disco, pois só o conteúdo do currículo era hasheado).
    """
    payload = resume.model_dump_json(by_alias=True)
    chunk_texts = json.dumps(
        [(chunk.id, chunk.text) for chunk in build_chunks(resume)],
        ensure_ascii=False,
    )
    return hashlib.sha256(f"{payload}|{chunk_texts}".encode()).hexdigest()


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
    lexical_weight: float = 0.0,
) -> list[tuple[Chunk, float]]:
    """Retorna os `top_k` chunks mais similares à pergunta, por similaridade desc.

    `section` restringe a busca aos chunks dessa seção antes de aplicar
    `top_k` (ADR-010 seção 1); se a seção não tiver chunks, cai de volta para
    o índice inteiro. `sort_by_recency` seleciona os `top_k` chunks de maior
    `Chunk.recency_key` (mais recente/atual primeiro) entre os candidatos, em
    vez de os mais similares (ADR-018).

    `lexical_weight` > 0 liga a busca híbrida (ADR-018): o score de cada chunk
    ganha um bônus proporcional à fração de termos distintivos da pergunta
    que aparecem no texto dele. Com 0 (padrão) o comportamento é o anterior.
    """
    question_embedding = embedding_provider.embed_text(question)
    candidates = (
        [item for item in index if item.chunk.section == section]
        if section is not None
        else index
    )
    if not candidates:
        candidates = index
    question_tokens = _distinctive_tokens(question) if lexical_weight > 0 else set()
    scored = [
        (
            item.chunk,
            cosine_similarity(question_embedding, item.embedding)
            + _lexical_bonus(question_tokens, item.chunk.text, lexical_weight),
        )
        for item in candidates
    ]
    scored.sort(key=lambda scored_item: scored_item[1], reverse=True)
    if sort_by_recency:
        # ADR-018: pergunta de recência ("última empresa") seleciona as mais
        # recentes, não as mais similares. Escolher o top_k por similaridade e só
        # então reordenar deixava o cargo atual de fora quando os scores das
        # experiências ficavam próximos. O sort é estável: empate mantém a ordem
        # de similaridade.
        return sorted(
            scored,
            key=lambda scored_item: scored_item[0].recency_key or "",
            reverse=True,
        )[:top_k]
    return scored[:top_k]


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

# ADR-020: intenções que antes caíam na similaridade pura e erravam perguntas
# básicas (contato, cidade, "quem é") ou truncavam listas em TOP_K itens.
_CONTACT_INTENT_KEYWORDS = {
    "email",
    "e-mail",
    "linkedin",
    "github",
    "whatsapp",
    "contato",
    "telefone",
    "celular",
}
_SUMMARY_INTENT_KEYWORDS = {
    "mora",
    "moro",
    "reside",
    "localizacao",
    "quem e lucas",
    "quem e ele",
    "quem e voce",
    "sobre ele",
    "sobre voce",
    "apresente",
    "apresentacao",
    "resumo",
    "perfil",
}
_CERTIFICATION_INTENT_KEYWORDS = {
    "certificacoes",
    "certificacao",
    "certificados",
    "certificado",
    "cursos",
}
_ARTICLE_INTENT_KEYWORDS = {"artigos", "artigo", "publicacoes", "escreveu"}
_RECOGNITION_INTENT_KEYWORDS = {
    "reconhecimentos",
    "reconhecimento",
    "premios",
    "premio",
}
_PROJECT_INTENT_KEYWORDS = {"projetos"}
_SKILL_INTENT_KEYWORDS = {"skills", "habilidades", "competencias", "stack"}

SECTION_INTENT_KEYWORDS: dict[str, set[str]] = {
    "education": _EDUCATION_INTENT_KEYWORDS,
    "experience": _EXPERIENCE_INTENT_KEYWORDS,
    "contact": _CONTACT_INTENT_KEYWORDS,
    "summary": _SUMMARY_INTENT_KEYWORDS,
    "certification": _CERTIFICATION_INTENT_KEYWORDS,
    "article": _ARTICLE_INTENT_KEYWORDS,
    "recognition": _RECOGNITION_INTENT_KEYWORDS,
    "project": _PROJECT_INTENT_KEYWORDS,
    "skill": _SKILL_INTENT_KEYWORDS,
}
# Seções cuja pergunta pede o conjunto inteiro ("quais certificações?"): a
# busca devolve todos os itens da seção (até MAX_LIST_TOP_K), não só TOP_K.
LIST_SECTIONS = frozenset(
    {"certification", "article", "recognition", "project", "skill"}
)
MAX_LIST_TOP_K = 12
# Com uma empresa na pergunta ("que skills usei no Itaú?") a resposta está no
# chunk da experiência, então o roteamento por seção de lista é ignorado.
_GENERIC_COMPANY_TOKENS = frozenset({"banco", "grupo", "de", "da", "do"})


def _normalize(text: str) -> str:
    """Minúsculo e sem acento — casa "última" com "ultima" no dicionário."""
    decomposed = unicodedata.normalize("NFKD", text.lower())
    return "".join(char for char in decomposed if not unicodedata.combining(char))


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"\w+", _normalize(text)))


def _distinctive_tokens(text: str) -> set[str]:
    """Tokens que carregam significado na pergunta: sem stopwords e sem
    palavras curtas demais."""
    return {
        token
        for token in _tokenize(text)
        if len(token) >= 3 and token not in _STOPWORDS
    }


def _lexical_bonus(question_tokens: set[str], chunk_text: str, weight: float) -> float:
    if not question_tokens or weight <= 0:
        return 0.0
    overlap = len(question_tokens & _tokenize(chunk_text))
    return weight * overlap / len(question_tokens)


def _mentions_company(question_tokens: set[str], company_names: Iterable[str]) -> bool:
    return any(
        (_tokenize(company) - _GENERIC_COMPANY_TOKENS) & question_tokens
        for company in company_names
    )


def detect_section_intent(
    question: str, company_names: Iterable[str] = ()
) -> str | None:
    """Seção-alvo da pergunta, por palavra-chave (ADR-010); `None` se nenhuma bater.

    Casa por conjunto de tokens, não substring literal — tolera palavras
    inseridas entre os termos da keyword (ex. "onde Lucas trabalha" ainda
    casa com a keyword "onde trabalha", que exige só os tokens "onde" e
    "trabalha" em qualquer posição da pergunta).

    `company_names` (ADR-020) desliga o roteamento para seções de lista quando
    a pergunta cita uma empresa do currículo.
    """
    question_tokens = _tokenize(question)
    company_named = _mentions_company(question_tokens, company_names)
    for section, keywords in SECTION_INTENT_KEYWORDS.items():
        if section in LIST_SECTIONS and company_named:
            continue
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
    lexical_weight: float = 0.0,
    company_names: Iterable[str] = (),
) -> list[tuple[Chunk, float]]:
    """`search()` com roteamento por seção/recência (ADR-010); fallback = busca atual.

    Pergunta sem palavra-chave reconhecida chama `search()` sem restrição de
    seção, comportamento idêntico ao pré-ADR-010, sem regressão. Em seção de
    lista (ADR-020) o `top_k` cresce para cobrir a seção inteira.
    """
    section = detect_section_intent(question, company_names)
    sort_by_recency = section == "experience" and wants_recency(question)
    if section in LIST_SECTIONS:
        section_size = sum(1 for item in index if item.chunk.section == section)
        top_k = max(top_k, min(section_size, MAX_LIST_TOP_K))
    return search(
        question,
        index,
        embedding_provider,
        top_k=top_k,
        section=section,
        sort_by_recency=sort_by_recency,
        lexical_weight=lexical_weight,
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
