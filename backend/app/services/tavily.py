"""Live-only source retrieval. Search snippets are not passed off as full text."""
from urllib.parse import urlsplit, urlunsplit
import httpx
from ..config import settings
from .errors import ResearchServiceError, has_credential


def canonical_url(value: str) -> str | None:
    try:
        url = urlsplit(value)
        if url.scheme not in {"http", "https"} or not url.hostname or url.username or url.password:
            return None
        return urlunsplit((url.scheme.lower(), url.netloc.lower(), url.path, url.query, ""))
    except (ValueError, TypeError):
        return None


class TavilyService:
    def __init__(self, api_key=None, transport=None):
        self.api_key = settings.TAVILY_API_KEY if api_key is None else api_key
        self.transport = transport

    async def search(self, query: str, max_results: int = 8) -> list[dict]:
        if not has_credential(self.api_key):
            raise ResearchServiceError("SEARCH_NOT_CONFIGURED", "Live search access is not configured. No sources were retrieved.")
        try:
            async with httpx.AsyncClient(timeout=20, transport=self.transport, follow_redirects=False) as client:
                response = await client.post("https://api.tavily.com/search", headers={"Authorization": f"Bearer {self.api_key}"}, json={
                    "query": query, "search_depth": "advanced",
                    "include_raw_content": True, "max_results": min(max_results, 8),
                })
                response.raise_for_status()
                data = response.json()
                if not isinstance(data, dict) or not isinstance(data.get("results"), list):
                    raise ValueError("invalid results")
        except (httpx.HTTPError, ValueError):
            raise ResearchServiceError("SEARCH_UNAVAILABLE", "Live source search failed. No substitute sources were generated.") from None
        sources, seen = [], set()
        for item in data["results"]:
            if not isinstance(item, dict):
                continue
            url = canonical_url(item.get("url", ""))
            if not url or url in seen:
                continue
            seen.add(url)
            raw = item.get("raw_content")
            # A snippet can be displayed as metadata but is not evidence from a retrieved document.
            readable = isinstance(raw, str) and bool(raw.strip())
            sources.append({"title": str(item.get("title") or "Untitled source"), "url": url,
                            "domain": urlsplit(url).hostname, "raw_text": raw[:16000] if readable else "",
                            "access_status": "accessible" if readable else "unavailable"})
            if len(sources) >= max_results:
                break
        return sources


tavily_service = TavilyService()
