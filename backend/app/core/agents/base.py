import logging
import os
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional

from google import genai
from google.genai import errors, types


@dataclass
class ADKTask:
    """ADK Primitive representing a task execution context."""
    task_id: str
    intent: str
    priority: int  # 1 = Urgent, 3 = Low
    assigned_agent: str
    status: str = "PENDING"


class ADKMemory:
    """ADK Memory interface supporting short-term active states and long-term history logs."""
    def __init__(self) -> None:
        self.short_term: Dict[str, Any] = {}
        self.long_term: List[Dict[str, Any]] = []

    def remember(self, key: str, value: Any) -> None:
        """Saves telemetry or state to short-term cache."""
        self.short_term[key] = value

    def recall(self, key: str) -> Optional[Any]:
        """Recalls state from short-term cache."""
        return self.short_term.get(key)

    def log_long_term(self, event_data: Dict[str, Any]) -> None:
        """Appends event data to long-term post-match analytics log."""
        self.long_term.append(event_data)


logger = logging.getLogger(__name__)

class ArenaAgent:
    """Base class for ArenaPulseAI agents with model selection, dynamic tool injection, and ADK primitives."""

    def __init__(self, name: str, instruction: str, model: str = "gemini-2.5-flash") -> None:
        self.name = name
        self.instruction = instruction
        self.model = model
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None
        self.tools: List[Callable[..., Any]] = []
        self.memory = ADKMemory()

        use_vertex_env = os.getenv("USE_VERTEX_AI", "false").strip().lower() == "true"
        project_env = os.getenv("GOOGLE_CLOUD_PROJECT", "").strip()
        self.use_vertex = use_vertex_env or bool(project_env)
        if self.use_vertex:
            project = project_env or "genai-apac-2026-491004"
            location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
            self.client = genai.Client(vertexai=True, project=project, location=location)
        elif self.api_key:
            self.client = genai.Client(api_key=self.api_key)

    def inject_tools(self, tools_list: List[Callable[..., Any]]) -> None:
        """Dynamically injects a specific list of tools into the agent's toolset."""
        self.tools = tools_list

    async def generate_response(self, prompt: str, task: Optional[ADKTask] = None) -> str:
        """Queries Gemini using the official Client or falls back to a mock if credentials are missing."""
        context_prompt = prompt
        if task:
            context_prompt = (
                f"[ADK TASK CONTEXT: TaskID={task.task_id}, Intent={task.intent}, Priority={task.priority}]\n"
                f"{prompt}"
            )

        if not self.client:
            return self._mock_fallback(context_prompt)

        try:
            # Prepare configuration with system instructions and dynamic tools
            config_args: Dict[str, Any] = {
                "system_instruction": self.instruction,
            }
            if self.tools:
                config_args["tools"] = self.tools

            config = types.GenerateContentConfig(**config_args)

            # Execute standard call
            response = self.client.models.generate_content(
                model=self.model,
                contents=context_prompt,
                config=config
            )
            return response.text or "[Empty Response]"
        except errors.APIError:
            return self._mock_fallback(context_prompt)

    def _mock_fallback(self, prompt: str) -> str:
        """Fallback mock generator for AI-disabled state. Parses and resolves FIFA queries."""
        try:
            from app.core.fifa_data import FIFAMatchEngine
            matches = FIFAMatchEngine.search_matches(prompt)
            if matches:
                m = matches[0]
                if m["status"] == "LIVE":
                    return (
                        f"Live Match Telemetry Analyzed: {m['home_team']} vs {m['away_team']} playing at {m['venue']}. "
                        f"Current score is {m['home_score']}-{m['away_score']} ({m['minute']}' min). Crowd density at the venue is normal, and transit lines are active."
                    )
                elif m["status"] == "COMPLETED":
                    return (
                        f"Post-Match Analysis: Match {m['home_team']} vs {m['away_team']} at {m['venue']} finished "
                        f"with score {m['home_score']}-{m['away_score']}. Evacuation and transit systems successfully cleared the venue."
                    )
                else:
                    return (
                        f"Match Preparation: {m['home_team']} vs {m['away_team']} scheduled at {m['venue']} on {m['date']}. "
                        f"Pre-game security checks and volunteer placement are finalized."
                    )
        except Exception as exc:
            logger.warning("Mock fallback for %s failed: %s", self.name, exc)
        return f"[MOCK_FALLBACK] {self.name} processed: '{prompt}'"
