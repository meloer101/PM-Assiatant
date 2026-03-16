import chromadb
from pathlib import Path

from ..config import config

_client: chromadb.ClientAPI | None = None
_collection: chromadb.Collection | None = None

COLLECTION_NAME = "company_knowledge"


def _get_collection() -> chromadb.Collection:
    global _client, _collection
    if _collection is None:
        persist_dir = config.chroma_persist_dir
        Path(persist_dir).mkdir(parents=True, exist_ok=True)
        _client = chromadb.PersistentClient(path=persist_dir)
        _collection = _client.get_or_create_collection(name=COLLECTION_NAME)
    return _collection


def search_knowledge_base(query: str, top_k: int = 5) -> list[dict]:
    """Search the company knowledge base for relevant documents.

    Args:
        query: The search query string.
        top_k: Maximum number of results to return.

    Returns:
        A list of dicts each containing content, source_file, and distance.
        Returns an empty list with a message if the knowledge base is empty.
    """
    collection = _get_collection()

    if collection.count() == 0:
        return [{"message": "Knowledge base is empty. Import documents first."}]

    results = collection.query(
        query_texts=[query],
        n_results=min(top_k, collection.count()),
    )

    output = []
    if results and results["documents"]:
        for i, doc in enumerate(results["documents"][0]):
            metadata = (
                results["metadatas"][0][i] if results["metadatas"] else {}
            )
            distance = (
                results["distances"][0][i] if results["distances"] else None
            )
            output.append({
                "content": doc,
                "source_file": metadata.get("source_file", "unknown"),
                "chunk_index": metadata.get("chunk_index", -1),
                "distance": distance,
            })

    return output
