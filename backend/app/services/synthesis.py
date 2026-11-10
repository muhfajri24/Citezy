"""Conservative synthesis: no uncited model narrative or fixed benchmark rows."""
import re
from ..schemas.research import ResearchReport, ComparisonRow
from .verifier import normalize_whitespace


def grounded_value(value, excerpt: str):
    if not value:
        return None
    span = normalize_whitespace(str(value))
    # Literal spans cannot borrow digits/names from a different token (5 != 15).
    pattern = r"(?<!\w)" + re.escape(span) + r"(?!\w)"
    return value if re.search(pattern, normalize_whitespace(excerpt)) else None


def synthesize_report(question, claims, evidence, candidates) -> ResearchReport:
    supported = [c for c in claims if c.assessment == "supported_by_excerpt"]
    summary = f"Evaluated {len(claims)} candidate claims for this question. {len(supported)} are supported by their linked excerpts. Source support is not independent fact-checking."
    if supported:
        summary += "\n\n" + "\n\n".join(f"[{c.id}] {c.text}" for c in supported)
    else:
        summary += " Insufficient supported evidence was found; no substantive conclusion is drawn."
    rows = []
    for claim in supported:
        candidate = candidates.get(claim.id)
        linked = [e for e in evidence if e.claim_id == claim.id and e.id in claim.evidence_ids]
        if candidate is None or not linked:
            continue
        excerpt = linked[0].excerpt
        method = grounded_value(candidate.method, excerpt)
        if not method:
            continue
        fields = {name: grounded_value(getattr(candidate, name), excerpt)
                  for name in ("dataset", "metric", "result", "units", "limitation")}
        # A result without dataset, metric and units has no defensible comparison context.
        if not all(fields[name] for name in ("dataset", "metric", "units")):
            fields["result"] = None
        rows.append(ComparisonRow(id=f"cmp-{len(rows)+1}", method=method, **fields,
                                  claim_ids=[claim.id],
                                  comparability_warning="Cross-source results are not established as directly comparable. Check dataset, metric and evaluation conditions in the linked excerpt."))
    return ResearchReport(summary=summary, claims=claims, comparison=rows)
