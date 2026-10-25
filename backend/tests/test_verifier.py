import pytest
from app.services.verifier import (
    verify_quote_in_text,
    extract_numbers,
    check_numeric_consistency,
    normalize_whitespace,
)


def test_normalize_whitespace():
    assert normalize_whitespace("  hello   world \n \t test ") == "hello world test"


def test_verify_quote_in_text_exact():
    source = "Large language models show remarkable performance on reasoning tasks."
    quote = "remarkable performance on reasoning"
    found, offset = verify_quote_in_text(quote, source)
    assert found is True
    assert offset == 27


def test_verify_quote_in_text_whitespace_normalized():
    source = "Large language models \n show   remarkable\nperformance on reasoning."
    quote = "show remarkable performance"
    found, offset = verify_quote_in_text(quote, source)
    assert found is True


def test_verify_quote_in_text_not_found():
    source = "Small language models require parameter efficient fine tuning."
    quote = "completely fabricated quote"
    found, offset = verify_quote_in_text(quote, source)
    assert found is False
    assert offset is None


def test_extract_numbers():
    text = "The model achieved 89.5% accuracy across 1200 benchmarks with 3.2x speedup."
    numbers = extract_numbers(text)
    assert "89.5%" in numbers
    assert "1200" in numbers
    assert "3.2" in numbers


def test_check_numeric_consistency():
    excerpt = "We observe a 2.4x acceleration on GSM8K and 89.2% accuracy."
    
    # Matching claim numbers
    valid_claim = "The approach attains 2.4x speedup with 89.2% accuracy."
    ok, err = check_numeric_consistency(valid_claim, excerpt)
    assert ok is True
    assert err is None

    # Mismatched/invented number in claim
    invalid_claim = "The approach attains 4.8x speedup on GSM8K."
    ok, err = check_numeric_consistency(invalid_claim, excerpt)
    assert ok is False
    assert "4.8" in err
