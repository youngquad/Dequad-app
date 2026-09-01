import os
import uuid
import asyncio
import logging
from typing import AsyncGenerator

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
AI_MODEL = "gpt-5.4-mini"


async def stream_ai_response(system_message: str, user_text: str) -> AsyncGenerator[str, None]:
    """One-shot GPT-5.4-mini completion (bio help, icebreakers, admin
    insights — single-turn, not persisted multi-turn chats). The installed
    emergentintegrations version has no token-streaming API, so the full
    response is fetched then yielded word-by-word to give the frontend a
    live-typing SSE experience."""
    if not EMERGENT_LLM_KEY:
        raise RuntimeError("EMERGENT_LLM_KEY is not configured")

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"ai-{uuid.uuid4().hex}",
        system_message=system_message,
    ).with_model("openai", AI_MODEL)

    response = await chat.send_message(UserMessage(text=user_text))
    words = response.split(" ")
    for i, word in enumerate(words):
        yield word + (" " if i < len(words) - 1 else "")
        await asyncio.sleep(0.02)

