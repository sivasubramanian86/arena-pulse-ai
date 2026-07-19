"""Test suite validating backend Coverage Gap functionality."""

from unittest.mock import AsyncMock, patch

import pytest

from app.core.agents.base import ArenaAgent
from app.core.fifa_data import FIFAMatchEngine
from app.core.orchestrator import ArenaPulseOrchestrator


@pytest.mark.asyncio
async def test_arena_agent_mock_fallback_branches(monkeypatch):
    """Verify that the arena agent mock fallback branches logic operates correctly."""
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    agent = ArenaAgent(name="TestAgent", instruction="test", model="gemini-2.5-flash")

    # 1. Test fallback when a LIVE match matches prompt "live"
    res_live = agent._mock_fallback("live")
    assert "Live Match" in res_live

    # 2. Test fallback when a COMPLETED match matches prompt "completed"
    res_completed = agent._mock_fallback("completed")
    assert "Post-Match" in res_completed

    # 3. Test fallback when a SCHEDULED match matches prompt "scheduled"
    res_scheduled = agent._mock_fallback("scheduled")
    assert "Match Preparation" in res_scheduled

def test_arena_agent_fallback_exception():
    """Verify that the arena agent fallback exception logic operates correctly."""
    # Test fallback exception branch to hit lines 116-117 in base.py
    agent = ArenaAgent(name="TestAgent", instruction="test", model="gemini-2.5-flash")
    with patch("app.core.fifa_data.FIFAMatchEngine.search_matches", side_effect=ValueError("Test exception")):
        res = agent._mock_fallback("test")
        assert "[MOCK_FALLBACK] TestAgent" in res

def test_fifa_data_engine_coverage():
    """Verify that the fifa data engine coverage logic operates correctly."""
    # 1. get_all_matches
    matches = FIFAMatchEngine.get_all_matches()
    assert len(matches) > 0

    # 2. get_all_venues
    venues = FIFAMatchEngine.get_all_venues()
    assert "metlife" in venues

    # 3. query_fifa_context with empty results (matches line 186->189 True branch)
    ctx = FIFAMatchEngine.query_fifa_context("nonexistent_query")
    assert "<FIFA_WORLD_CUP_2026_CONTEXT>" in ctx

    # 4. query_fifa_context with matches found (covers 186->189 False branch)
    ctx_found = FIFAMatchEngine.query_fifa_context("live")
    assert "<FIFA_WORLD_CUP_2026_CONTEXT>" in ctx_found

@pytest.mark.asyncio
async def test_orchestrator_no_fifa_context_branch():
    """Verify that the orchestrator no fifa context branch logic operates correctly."""
    # Test orchestrator with mocked empty fifa context to hit 257->260 branch
    with patch("app.core.fifa_data.FIFAMatchEngine.query_fifa_context", return_value=""):
        orchestrator = ArenaPulseOrchestrator()
        # Mock the worker responses and supervisor response so it completes quickly
        orchestrator.crowd_worker.generate_response = AsyncMock(return_value="Crowd OK")
        orchestrator.transit_worker.generate_response = AsyncMock(return_value="Transit OK")
        orchestrator.logistics_worker.generate_response = AsyncMock(return_value="Logistics OK")
        orchestrator.supervisor.generate_response = AsyncMock(return_value="Supervisor Decision")

        # Consume the async generator stream
        steps = []
        async for step in orchestrator.execute_task_stream("test query without fifa"):
            steps.append(step)

        assert len(steps) > 0
