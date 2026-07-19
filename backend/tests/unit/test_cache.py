import pytest
from app.core.cache import SemanticCache

def test_semantic_cache_exact_hit():
    cache = SemanticCache()
    res = cache.get("Where is Gate C?")
    assert res is not None
    assert "Concourse Zone 1" in res["answer"]
    assert "semantic cache hit" in res["thinkingSteps"][0].lower()

def test_semantic_cache_similar_hit():
    cache = SemanticCache()
    res = cache.get("where is gate c")
    assert res is not None
    assert "Concourse Zone 1" in res["answer"]

def test_semantic_cache_miss():
    cache = SemanticCache()
    res = cache.get("Is it going to rain during the World Cup?")
    assert res is None

def test_semantic_cache_empty():
    cache = SemanticCache()
    assert cache.get("") is None
