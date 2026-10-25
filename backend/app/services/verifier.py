import re
from typing import Optional, Tuple, List


def normalize_whitespace(text: str) -> str:
    """Collapse consecutive whitespace and newlines to a single space."""
    return re.sub(r"\s+", " ", text).strip()


def verify_quote_in_text(quote: str, source_text: str) -> Tuple[bool, Optional[int]]:
    """
    Verify whether a proposed quote verbatim exists in the source text.
    First tries exact match, then normalized whitespace match.
    Returns (is_found, match_offset).
    """
    if not quote or not source_text:
        return False, None

    # 1. Exact match attempt
    offset = source_text.find(quote)
    if offset != -1:
        return True, offset

    # 2. Whitespace-normalized attempt
    norm_quote = normalize_whitespace(quote)
    norm_source = normalize_whitespace(source_text)

    norm_offset = norm_source.find(norm_quote)
    if norm_offset != -1:
        return True, norm_offset

    # 3. Case-insensitive fallback check
    norm_quote_lower = norm_quote.lower()
    norm_source_lower = norm_source.lower()
    lower_offset = norm_source_lower.find(norm_quote_lower)
    if lower_offset != -1:
        return True, lower_offset

    return False, None


def extract_numbers(text: str) -> List[str]:
    """Extract standalone numeric sequences, decimals, and percentages."""
    pattern = r"\b\d+(?:\.\d+)?%?"
    return re.findall(pattern, text)


def check_numeric_consistency(claim_text: str, excerpt: str) -> Tuple[bool, Optional[str]]:
    """
    Deterministic check: If a claim asserts specific numbers/percentages,
    verify that they are present in the supporting excerpt.
    """
    claim_numbers = extract_numbers(claim_text)
    if not claim_numbers:
        return True, None

    excerpt_numbers = set(extract_numbers(excerpt))

    missing = [num for num in claim_numbers if num not in excerpt_numbers]
    if missing:
        return False, f"Numbers mentioned in claim not found in excerpt: {', '.join(missing)}"

    return True, None
