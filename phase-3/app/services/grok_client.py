from typing import Optional
from openai import OpenAI
from app.config import settings

def get_client() -> Optional[OpenAI]:
    if not settings.XAI_API_KEY:
        return None
    try:
        return OpenAI(
            api_key=settings.XAI_API_KEY,
            base_url=settings.XAI_BASE_URL,
            timeout=10.0,
        )
    except Exception:
        return None

def call_grok(
    prompt: str,
    system_prompt: str = "You are Grok, an advanced climate intelligence and urban heat risk AI assistant.",
    json_mode: bool = False,
    temperature: float = 0.2,
) -> Optional[str]:
    client = get_client()
    if not client:
        return None

    try:
        kwargs = {
            "model": settings.GROK_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": 1024,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        response = client.chat.completions.create(**kwargs)
        if response.choices and len(response.choices) > 0:
            content = response.choices[0].message.content
            return content.strip() if content else None
        return None
    except Exception:
        return None
