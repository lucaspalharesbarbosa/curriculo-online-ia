import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.models.resume import Resume

RESUME_JSON_PATH = (
    Path(__file__).resolve().parents[2] / "frontend" / "content" / "resume.json"
)


def test_resume_json_matches_schema() -> None:
    data = json.loads(RESUME_JSON_PATH.read_text(encoding="utf-8"))
    resume = Resume.model_validate(data)

    assert resume.hero.name
    assert resume.about
    assert len(resume.experiences) >= 1
    assert len(resume.education) >= 1
    assert len(resume.skills) >= 1
    assert str(resume.contact.linkedin).startswith("https://")


def test_resume_schema_rejects_invalid_data() -> None:
    with pytest.raises(ValidationError):
        Resume.model_validate({"hero": {}})
