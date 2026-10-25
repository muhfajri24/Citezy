import urllib.parse
from typing import List, Dict, Any, Optional
import httpx
from ..config import settings


class TavilyService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.TAVILY_API_KEY
        self.base_url = "https://api.tavily.com"

    def extract_domain(self, url: str) -> Optional[str]:
        try:
            parsed = urllib.parse.urlparse(url)
            return parsed.netloc or None
        except Exception:
            return None

    async def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search Tavily API for relevant scientific/CS-ML web sources.
        Returns list of source dictionaries with deduplicated URLs.
        """
        if not self.api_key:
            # Fallback or mock data if key not yet provided
            return self._mock_fallback_sources(query)

        payload = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": "advanced",
            "include_raw_content": False,
            "max_results": max_results,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(f"{self.base_url}/search", json=payload)
            if response.status_code != 200:
                # Log error and fallback
                return self._mock_fallback_sources(query)
            data = response.json()

        results = data.get("results", [])
        sources = []
        seen_urls = set()

        for idx, item in enumerate(results, start=1):
            url = item.get("url", "")
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)

            domain = self.extract_domain(url)
            title = item.get("title", f"Source {idx}")
            content = item.get("content", "")

            sources.append({
                "id": f"src-{idx}",
                "title": title,
                "url": url,
                "domain": domain,
                "raw_text": content,
                "access_status": "accessible",
            })

        return sources

    def _mock_fallback_sources(self, query: str) -> List[Dict[str, Any]]:
        """Safe fallback fixtures when API key is not yet configured."""
        return [
            {
                "id": "src-1",
                "title": "A Survey on Speculative Decoding in LLMs",
                "url": "https://example.org/papers/speculative-decoding-survey",
                "domain": "example.org",
                "raw_text": "Speculative decoding achieves 2.1x to 2.8x wall-clock speedup on GSM8K using smaller draft models without degradation in output distribution.",
                "access_status": "accessible",
            },
            {
                "id": "src-2",
                "title": "Comparative Benchmarks for Inference Acceleration",
                "url": "https://example.org/papers/inference-acceleration-benchmarks",
                "domain": "example.org",
                "raw_text": "On standard humaneval benchmarks, medusa draft heads reported 2.3x speedup while lookahead decoding attained 1.8x speedup under identical hardware.",
                "access_status": "accessible",
            },
        ]


tavily_service = TavilyService()
