"""Gemini LLM wrapper via Emergent Universal Key."""
import os
from emergentintegrations.llm.chat import LlmChat, UserMessage

EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]
MODEL_PROVIDER = "gemini"
MODEL_NAME = "gemini-3-flash-preview"


def make_chat(session_id: str, system_message: str) -> LlmChat:
    return LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_message,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)


async def generate(session_id: str, system: str, prompt: str) -> str:
    chat = make_chat(session_id, system)
    resp = await chat.send_message(UserMessage(text=prompt))
    # send_message returns the assistant text
    if isinstance(resp, str):
        return resp
    return getattr(resp, "content", str(resp))
