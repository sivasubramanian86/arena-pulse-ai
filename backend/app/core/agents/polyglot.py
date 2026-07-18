from app.core.agents.base import ArenaAgent

class PolyglotWorker(ArenaAgent):
    """Worker specializing in fast, low-cost localized translations."""

    def __init__(self) -> None:
        super().__init__(
            name="PolyglotWorker",
            instruction=(
                "You translate operational commands and statements into target languages. "
                "Keep translations precise, direct, and free of explanations."
            ),
            model="gemini-2.5-flash"  # Simple translation tasks route to Flash
        )

    def _mock_fallback(self, prompt: str) -> str:
        if "hola" in prompt.lower() or "spanish" in prompt.lower():
            return "Hola, bienvenido al estadio MetLife. ¿Cómo puedo ayudarte hoy?"
        return "Bienvenue au stade. Veuillez suivre les flèches d'évacuation."
