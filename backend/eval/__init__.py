"""Rotinas de avaliação de qualidade do RAG (golden-set, LLM-as-judge — US-16-03).

Nunca importado por `app/` nem por `tests/` — bate na API real de propósito
(mede qualidade de verdade), então roda só sob demanda, nunca em pytest/CI.
"""
