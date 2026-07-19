"""Test suite validating backend Agents functionality."""

import pytest
from google.genai.errors import APIError

from app.core.agents.base import ADKMemory, ADKTask, ArenaAgent
from app.core.agents.crowd import CrowdWorker
from app.core.agents.logistics import LogisticsWorker
from app.core.agents.polyglot import PolyglotWorker
from app.core.agents.supervisor import OpsSupervisor
from app.core.agents.transit import TransitWorker


@pytest.mark.asyncio
async def test_agent_fallback_no_api_key(monkeypatch):
    """Verify that the agent fallback no api key logic operates correctly."""
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    agent = ArenaAgent(name="TestAgent", instruction="test", model="gemini-2.5-flash")
    resp = await agent.generate_response("hello")
    assert "[MOCK_FALLBACK] TestAgent" in resp

from unittest.mock import MagicMock, patch


@pytest.mark.asyncio
async def test_agent_generate_response_with_mock_client():
    """Verify that the agent generate response with mock client logic operates correctly."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "Mocked LLM Response"
    mock_client.models.generate_content.return_value = mock_response

    # Test WITH tools
    agent = ArenaAgent(name="TestAgent", instruction="test", model="gemini-2.5-flash")
    agent.client = mock_client
    agent.inject_tools([lambda: "test"])
    resp = await agent.generate_response("hello")
    assert resp == "Mocked LLM Response"

    # Test WITHOUT tools
    agent_no_tools = ArenaAgent(name="TestAgent", instruction="test", model="gemini-2.5-flash")
    agent_no_tools.client = mock_client
    resp_no_tools = await agent_no_tools.generate_response("hello")
    assert resp_no_tools == "Mocked LLM Response"

@pytest.mark.asyncio
async def test_agent_generate_response_exception():
    """Verify that the agent generate response exception logic operates correctly."""
    mock_client = MagicMock()
    mock_client.models.generate_content.side_effect = APIError("API call failed", response_json={})

    agent = ArenaAgent(name="TestAgent", instruction="test", model="gemini-2.5-flash")
    agent.client = mock_client

    resp = await agent.generate_response("hello")
    assert "[MOCK_FALLBACK] TestAgent" in resp

def test_agent_initialization_with_api_key(monkeypatch):
    """Verify that the agent initialization with api key logic operates correctly."""
    monkeypatch.setenv("GEMINI_API_KEY", "dummy_key")
    with patch("google.genai.Client") as mock_genai_client:
        agent = ArenaAgent(name="TestAgent", instruction="test", model="gemini-2.5-flash")
        assert agent.api_key == "dummy_key"
        mock_genai_client.assert_called_once_with(api_key="dummy_key")

@pytest.mark.asyncio
async def test_worker_classes_fallback():
    """Verify that the worker classes fallback logic operates correctly."""
    crowd = CrowdWorker()
    transit = TransitWorker()
    polyglot = PolyglotWorker()
    logistics = LogisticsWorker()
    supervisor = OpsSupervisor()

    assert "Gate B concourse is critical" in crowd._mock_fallback("test")
    assert "Adjusting Express Shuttle 1" in transit._mock_fallback("test")
    assert "Hola" in polyglot._mock_fallback("hola")
    assert "Bienvenue" in polyglot._mock_fallback("french")
    assert "volunteer squads" in logistics._mock_fallback("test")
    assert "Supervisor Dispatch Plan" in supervisor._mock_fallback("test")

def test_agent_tool_injection():
    """Verify that the agent tool injection logic operates correctly."""
    agent = CrowdWorker()
    def sample_tool():
        return "telemetry"
    agent.inject_tools([sample_tool])
    assert len(agent.tools) == 1
    assert agent.tools[0]() == "telemetry"


def test_memory_recall_and_long_term_log():
    """Verify that the memory recall and long term log logic operates correctly."""
    memory = ADKMemory()
    assert memory.recall("missing") is None

    memory.remember("gate", {"density": 0.5})
    assert memory.recall("gate") == {"density": 0.5}

    memory.log_long_term({"event": "match-close"})
    assert memory.long_term == [{"event": "match-close"}]


def test_agent_initialization_with_vertex(monkeypatch):
    """Verify that the agent initialization with vertex logic operates correctly."""
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.setenv("USE_VERTEX_AI", "true")
    monkeypatch.setenv("GOOGLE_CLOUD_PROJECT", "arena-test")
    monkeypatch.setenv("GOOGLE_CLOUD_LOCATION", "asia-south1")

    with patch("google.genai.Client") as mock_genai_client:
        agent = ArenaAgent(name="TestAgent", instruction="test")

    assert agent.use_vertex is True
    mock_genai_client.assert_called_once_with(
        vertexai=True,
        project="arena-test",
        location="asia-south1",
    )


@pytest.mark.asyncio
async def test_agent_generate_response_with_task_and_empty_response():
    """Verify that the agent generate response with task and empty response logic operates correctly."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = ""
    mock_client.models.generate_content.return_value = mock_response

    task = ADKTask(
        task_id="task-1",
        intent="crowd_density_check",
        priority=1,
        assigned_agent="CrowdWorker",
    )
    agent = ArenaAgent(name="TestAgent", instruction="test")
    agent.client = mock_client

    resp = await agent.generate_response("hello", task)

    assert resp == "[Empty Response]"
    _, kwargs = mock_client.models.generate_content.call_args
    assert "TaskID=task-1" in kwargs["contents"]


def test_supervisor_decompose_all_task_types():
    """Verify that the supervisor decompose all task types logic operates correctly."""
    supervisor = OpsSupervisor()
    tasks = supervisor.decompose_task(
        "Evacuate gate crowd to transit shuttle and dispatch volunteer staff"
    )

    assert [task.assigned_agent for task in tasks] == [
        "CrowdWorker",
        "TransitWorker",
        "LogisticsWorker",
    ]


def test_supervisor_decompose_transit_only_and_default():
    """Verify that the supervisor decompose transit only and default logic operates correctly."""
    supervisor = OpsSupervisor()

    transit_tasks = supervisor.decompose_task("Metro train outbound schedule")
    default_tasks = supervisor.decompose_task("Where are concessions?")

    assert [task.assigned_agent for task in transit_tasks] == ["TransitWorker"]
    assert default_tasks[0].task_id == "task-gen-ops"
    assert default_tasks[0].priority == 3
