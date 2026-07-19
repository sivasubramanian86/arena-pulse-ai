"""Test suite validating backend Cache functionality."""

from app.core.cache import SemanticCache


def test_semantic_cache_exact_hit():
    """Verify that the semantic cache exact hit logic operates correctly."""
    cache = SemanticCache()
    res = cache.get("Where is Gate C?")
    assert res is not None
    assert "Concourse Zone 1" in res["answer"]
    assert "semantic cache hit" in res["thinkingSteps"][0].lower()

def test_semantic_cache_similar_hit():
    """Verify that the semantic cache similar hit logic operates correctly."""
    cache = SemanticCache()
    res = cache.get("where is gate c")
    assert res is not None
    assert "Concourse Zone 1" in res["answer"]

def test_semantic_cache_miss():
    """Verify that the semantic cache miss logic operates correctly."""
    cache = SemanticCache()
    res = cache.get("Is it going to rain during the World Cup?")
    assert res is None

def test_semantic_cache_empty():
    """Verify that the semantic cache empty logic operates correctly."""
    cache = SemanticCache()
    assert cache.get("") is None
