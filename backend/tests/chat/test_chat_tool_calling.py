"""Testes do `/chat` com a flag de tool calling (`ADR-017`)."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.chat import router as chat
from app.chat import service
from app.chat.adapters.openai_adapter import OpenAIToolCallingProvider
from app.main import app
from tests.chat.fakes import (
    FakeChatCompletionProvider,
    FakeEmbeddingProvider,
    FakeWebSearchProvider,
)
from tests.chat.test_service import FIXTURE_INDEX
from tests.chat.tool_fakes import (
    ScriptedToolCallingProvider,
    final_answer,
    tool_request,
)
from tests.tools.helpers import make_resume

client = TestClient(app)


@pytest.fixture(autouse=True)
def _state(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LLM_API_KEY", "test-key-not-real")
    monkeypatch.setattr(service, "_index_cache", FIXTURE_INDEX)
    monkeypatch.setattr(service, "_entities_cache", ["Alfa"])
    monkeypatch.setattr(
        service,
        "_resume_cache",
        make_resume([("Alfa", "2024-01", "2025-07", ["Python"])]),
    )
    chat._request_log.clear()
    yield
    app.dependency_overrides.clear()


def test_flag_desligada_por_padrao(monkeypatch: pytest.MonkeyPatch) -> None:
    """Sem `CHAT_TOOL_CALLING`, o provider é `None` e o pipeline segue igual."""
    monkeypatch.delenv("CHAT_TOOL_CALLING", raising=False)

    assert chat.get_tool_calling_provider() is None


@pytest.mark.parametrize("value", ["1", "true", "TRUE", "yes"])
def test_flag_ligada_devolve_o_adapter_openai(
    monkeypatch: pytest.MonkeyPatch, value: str
) -> None:
    """Valores verdadeiros ligam o adapter de tool calling."""
    monkeypatch.setenv("CHAT_TOOL_CALLING", value)

    assert isinstance(chat.get_tool_calling_provider(), OpenAIToolCallingProvider)


def test_chat_usa_tool_calling_quando_o_provider_esta_ligado() -> None:
    """Com provider de tools injetado, a resposta vem do loop de tools."""
    provider = ScriptedToolCallingProvider(
        [
            tool_request(
                ("c1", "calculate_experience", '{"skill_or_company": "Python"}')
            ),
            final_answer("1 ano e 6 meses de Python."),
        ]
    )
    app.dependency_overrides[chat.get_embedding_provider] = lambda: (
        FakeEmbeddingProvider([1.0, 0.0])
    )
    app.dependency_overrides[chat.get_chat_completion_provider] = lambda: (
        FakeChatCompletionProvider(answer="pipeline")
    )
    app.dependency_overrides[chat.get_web_search_provider] = lambda: (
        FakeWebSearchProvider()
    )
    app.dependency_overrides[chat.get_tool_calling_provider] = lambda: provider

    response = client.post("/chat", json={"question": "Quantos anos de Python?"})

    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == "1 ano e 6 meses de Python."
    assert body["source"] == "resume"
    assert [tool["name"] for tool in body["tools"]] == ["calculate_experience"]
    assert body["tools"][0]["arguments"] == {"skill_or_company": "Python"}
    assert "meses" in body["tools"][0]["result"]
    assert len(provider.calls) == 2
