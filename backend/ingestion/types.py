from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Literal

TrustTier = Literal["strong", "medium", "weak"]


@dataclass
class NormalizedSignal:
    source_key: str
    external_id: str
    signal_type: str
    title: str
    url: str
    published_at: datetime
    company_name_raw: str | None = None
    company_domain: str | None = None
    founder_names: list[str] = field(default_factory=list)
    summary: str | None = None
    raw_payload: dict[str, Any] = field(default_factory=dict)


class SourceAdapter:
    source_key: str
    source_name: str
    trust_tier: TrustTier
    source_type: str = "adapter"
    base_url: str | None = None

    async def fetch(self) -> list[NormalizedSignal]:
        raise NotImplementedError

