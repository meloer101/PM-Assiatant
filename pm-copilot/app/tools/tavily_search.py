import os
from tavily import TavilyClient

MAX_CONTENT_CHARS = 1500


def tavily_search(query: str, max_results: int = 3) -> dict:
    """Search the web using Tavily API and return structured results.

    Args:
        query: The search query string.
        max_results: Maximum number of results to return (default 3).

    Returns:
        A dict with 'results' list, each containing title, url, content.
    """
    client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    response = client.search(
        query=query,
        max_results=max_results,
        include_answer=True,
        include_raw_content=False,
    )

    results = []
    for item in response.get("results", []):
        content = item.get("content", "")
        if len(content) > MAX_CONTENT_CHARS:
            content = content[:MAX_CONTENT_CHARS] + "..."
        results.append({
            "title": item.get("title", ""),
            "url": item.get("url", ""),
            "content": content,
        })

    return {
        "answer": response.get("answer", ""),
        "results": results,
    }
