import asyncio
from datetime import datetime, timezone

from backend.ingestion.runner import validate_record, normalize_domain
from backend.ingestion.types import NormalizedSignal
from backend.services.entity_resolver import is_probable_company_name


def test_normalized_signal_validation_accepts_valid_record():
    record = NormalizedSignal(
        source_key="test-source",
        external_id="1",
        company_name_raw="Acme",
        company_domain="https://acme.com",
        signal_type="PRODUCT_LAUNCH",
        title="Acme launches",
        url="https://acme.com/launch",
        published_at=datetime.now(timezone.utc),
    )

    assert validate_record(record) is None


def test_normalized_signal_validation_rejects_missing_required_fields():
    record = NormalizedSignal(
        source_key="test-source",
        external_id="",
        signal_type="PRODUCT_LAUNCH",
        title="Acme launches",
        url="https://acme.com/launch",
        published_at=datetime.now(timezone.utc),
    )

    assert validate_record(record) == "missing_external_id"


def test_domain_normalization_removes_scheme_and_www():
    assert normalize_domain("https://www.example.com/path?q=1") == "example.com"


def test_sentence_like_names_are_not_probable_companies():
    assert not is_probable_company_name("Email the mods")
    assert not is_probable_company_name("I am a CS grad looking for advice")
    assert is_probable_company_name("Stripe")


def test_website_backed_names_are_allowed():
    assert is_probable_company_name("Very Long Company Name With Many Words", "https://example.com")
