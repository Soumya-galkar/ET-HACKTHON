# """Gemini LLM wrapper via Emergent Universal Key."""
# import os
# from emergentintegrations.llm.chat import LlmChat, UserMessage

# EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]
# MODEL_PROVIDER = "gemini"
# MODEL_NAME = "gemini-3-flash-preview"


# def make_chat(session_id: str, system_message: str) -> LlmChat:
#     return LlmChat(
#         api_key=EMERGENT_LLM_KEY,
#         session_id=session_id,
#         system_message=system_message,
#     ).with_model(MODEL_PROVIDER, MODEL_NAME)


# async def generate(session_id: str, system: str, prompt: str) -> str:
#     chat = make_chat(session_id, system)
#     resp = await chat.send_message(UserMessage(text=prompt))
#     # send_message returns the assistant text
#     if isinstance(resp, str):
#         return resp
#     return getattr(resp, "content", str(resp))

import os
import google.generativeai as genai

# Load key and configure
GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
genai.configure(api_key=GEMINI_API_KEY)

async def generate(session_id: str, system: str, prompt: str) -> str:
    # Initialize the model with the system instruction
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",  # Fast and cost-efficient model
        system_instruction=system
    )
    
    # Call Gemini asynchronously
    response = await model.generate_content_async(prompt)
    return response.text