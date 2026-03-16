"""CLI tool for importing documents into the ChromaDB knowledge base.

Usage:
    python -m app.tools.knowledge_manager import <file_path>
    python -m app.tools.knowledge_manager import-dir <directory>   # e.g. docs/
    python -m app.tools.knowledge_manager list
"""

import re
import sys
from pathlib import Path

import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter

sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from app.config import config

COLLECTION_NAME = "company_knowledge"
SUPPORTED_SUFFIXES = (".txt", ".md", ".pdf")


def _sanitize_stem(stem: str) -> str:
    """Normalize filename stem for chunk IDs (ASCII, no spaces/special chars)."""
    s = stem.strip()
    s = re.sub(r"[^\w\u4e00-\u9fff\-]", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s or "doc"


def _get_collection() -> chromadb.Collection:
    persist_dir = config.chroma_persist_dir
    Path(persist_dir).mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=persist_dir)
    return client.get_or_create_collection(name=COLLECTION_NAME)


def import_document(file_path: str) -> None:
    """Import a document into the knowledge base."""
    path = Path(file_path)
    if not path.exists():
        print(f"Error: File not found: {file_path}")
        return

    suffix = path.suffix.lower()
    if suffix in (".txt", ".md"):
        text = path.read_text(encoding="utf-8")
    elif suffix == ".pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(str(path))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except ImportError:
            print("Error: pypdf not installed. Run: pip install pypdf")
            return
    else:
        print(f"Error: Unsupported file type: {suffix}. Use .txt, .md, or .pdf")
        return

    if not text.strip():
        print(f"Warning: File is empty: {file_path}")
        return

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.rag_chunk_size,
        chunk_overlap=config.rag_chunk_overlap,
    )
    chunks = splitter.split_text(text)

    collection = _get_collection()

    safe_stem = _sanitize_stem(path.stem)
    ids = [f"{safe_stem}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [
        {"source_file": path.name, "chunk_index": i}
        for i in range(len(chunks))
    ]

    collection.upsert(
        ids=ids,
        documents=chunks,
        metadatas=metadatas,
    )

    print(f"Imported {len(chunks)} chunks from '{path.name}' into knowledge base.")


def list_documents() -> None:
    """List all documents in the knowledge base."""
    collection = _get_collection()
    count = collection.count()

    if count == 0:
        print("Knowledge base is empty.")
        return

    all_data = collection.get(include=["metadatas"])
    sources = set()
    for meta in all_data["metadatas"] or []:
        sources.add(meta.get("source_file", "unknown"))

    print(f"Knowledge base: {count} chunks from {len(sources)} document(s)")
    for src in sorted(sources):
        chunk_count = sum(
            1 for m in (all_data["metadatas"] or [])
            if m.get("source_file") == src
        )
        print(f"  - {src} ({chunk_count} chunks)")


def import_dir(dir_path: str) -> None:
    """Import all supported documents from a directory (e.g. docs/)."""
    root = Path(dir_path)
    if not root.is_dir():
        print(f"Error: Not a directory: {dir_path}")
        return
    files = [
        f for f in root.iterdir()
        if f.is_file() and f.suffix.lower() in SUPPORTED_SUFFIXES
    ]
    if not files:
        print(f"No .txt, .md or .pdf files in {root}")
        return
    for f in sorted(files):
        import_document(str(f))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python -m app.tools.knowledge_manager import <file_path>")
        print("  python -m app.tools.knowledge_manager import-dir <directory>")
        print("  python -m app.tools.knowledge_manager list")
        sys.exit(1)

    command = sys.argv[1]
    if command == "import" and len(sys.argv) >= 3:
        import_document(sys.argv[2])
    elif command == "import-dir" and len(sys.argv) >= 3:
        import_dir(sys.argv[2])
    elif command == "list":
        list_documents()
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
