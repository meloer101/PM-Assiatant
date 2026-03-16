import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv
from google.adk.models.lite_llm import LiteLlm

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

model = LiteLlm(
    model=os.getenv("LLM_MODEL", "deepseek/deepseek-chat"),
    api_key=os.getenv("LLM_MODEL_API_KEY"),
    api_base=os.getenv("LLM_BASE_URL"),
)


@dataclass
class Config:
    max_search_iterations: int = 2
    chroma_persist_dir: str = str(
        Path(__file__).parent.parent / "data" / "chroma_db"
    )
    tavily_max_results: int = 3
    rag_top_k: int = 5
    rag_chunk_size: int = 1000
    rag_chunk_overlap: int = 200


config = Config()
