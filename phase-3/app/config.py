import os
from pathlib import Path
from typing import List

def find_env_key(key_name: str) -> str:
    env_val = os.getenv(key_name)
    if env_val:
        return env_val.strip()

    search_paths = [
        Path(__file__).resolve().parent.parent / ".env",
        Path(__file__).resolve().parents[2] / "phase-1" / ".env",
        Path(__file__).resolve().parents[2] / "phase-2" / ".env",
        Path(__file__).resolve().parents[2] / ".env",
    ]

    for p in search_paths:
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith(f"{key_name}=") and len(line) > len(key_name) + 1:
                            val = line.split("=", 1)[1].strip().strip('"').strip("'")
                            if val:
                                return val
            except Exception:
                pass
    return ""

class Settings:
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:5000,http://127.0.0.1:5173,http://127.0.0.1:5000",
        ).split(",")
        if origin.strip()
    ]
    XAI_API_KEY: str = find_env_key("XAI_API_KEY")
    XAI_BASE_URL: str = os.getenv("XAI_BASE_URL", "https://api.x.ai/v1")
    GROK_MODEL: str = os.getenv("GROK_MODEL", "grok-2-latest")

settings = Settings()
