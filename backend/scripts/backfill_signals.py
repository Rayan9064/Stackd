import asyncio

from backend.db import db, ensure_db_connected
from backend.ingestion.runner import run_all_adapters


async def source_names_for_signals(signals):
    names = set()
    for signal in signals:
        signal_sources = await db.signalsource.find_many(where={"signalId": signal.id})
        for signal_source in signal_sources:
            if not signal_source.sourceId:
                continue
            source = await db.source.find_unique(where={"id": signal_source.sourceId})
            if source:
                names.add(source.name)
        if signal.sourceId:
            source = await db.source.find_unique(where={"id": signal.sourceId})
            if source:
                names.add(source.name)
    return names


async def prune_low_evidence_companies():
    trusted_creation_sources = {"Startup Directory", "Product Hunt", "YC Directory", "Startup India/DPIIT"}
    companies = await db.company.find_many(take=1000)
    pruned = 0

    for company in companies:
        signals = await db.signal.find_many(where={"companyId": company.id})
        domains = await db.companydomain.find_many(where={"companyId": company.id})
        source_names = await source_names_for_signals(signals)
        has_trusted_source = bool(source_names & trusted_creation_sources)
        source_count = len(source_names)

        should_prune = (
            not company.website
            and not domains
            and not has_trusted_source
            and (source_count < 2 or len(signals) < 2)
            and company.confidenceScore < 0.8
        )

        if should_prune:
            await db.company.delete(where={"id": company.id})
            pruned += 1

    return pruned


async def run():
    await ensure_db_connected()
    adapter_results = await run_all_adapters()
    return {
        "adapters": adapter_results,
        "prunedLowEvidenceCompanies": await prune_low_evidence_companies(),
    }


async def run_cli():
    results = await run()
    await db.disconnect()
    return results


if __name__ == "__main__":
    print(asyncio.run(run_cli()))
