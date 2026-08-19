import pytest


def pytest_collection_modifyitems(items: list[pytest.Item]) -> None:
    """Anexa a docstring do teste (display em PT-BR) ao node id de `pytest -v`."""
    for item in items:
        doc = getattr(getattr(item, "obj", None), "__doc__", None)
        if doc:
            item._nodeid = f"{item._nodeid} — {doc.strip()}"
