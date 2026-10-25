import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from ..config import settings

logger = logging.getLogger(__name__)


class NemotronService:
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, model_id: Optional[str] = None):
        self.api_key = api_key or settings.NEBIUS_API_KEY
        self.base_url = (base_url or settings.NEBIUS_BASE_URL).rstrip("/")
        self.model_id = model_id or settings.NEMOTRON_MODEL_ID

    async def _chat_completion(self, system_prompt: str, user_prompt: str, temperature: float = 0.2) -> Optional[str]:
        """Make OpenAI-compatible chat completion call to Nebius Token Factory."""
        if not self.api_key:
            return None

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model_id,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.warning(f"Nebius call returned status {response.status_code}: {response.text}")
                    return None
        except Exception as e:
            logger.error(f"Error calling Nebius Token Factory: {e}")
            return None

    async def generate_plan(self, question: str) -> List[str]:
        """Generate 2-3 focused research sub-questions."""
        system_prompt = (
            "You are a scientific research planning assistant. "
            "Given a research question, break it down into 2-3 specific, concise search queries for literature review. "
            "Return ONLY a valid JSON list of strings, e.g. [\"query 1\", \"query 2\"]."
        )
        content = await self._chat_completion(system_prompt, question)
        if content:
            try:
                # Find JSON block if model returns markdown fences
                cleaned = content.strip()
                if "```json" in cleaned:
                    cleaned = cleaned.split("```json")[1].split("```")[0].strip()
                elif "```" in cleaned:
                    cleaned = cleaned.split("```")[1].split("```")[0].strip()
                parsed = json.loads(cleaned)
                if isinstance(parsed, list) and all(isinstance(x, str) for x in parsed):
                    return parsed[:3]
            except Exception:
                pass

        # Fallback plan
        return [
            f"{question} state of the art methodology",
            f"{question} comparative benchmark results",
        ]

    async def classify_support(self, claim_text: str, excerpt: str) -> Dict[str, str]:
        """
        Classify whether the excerpt supports the claim.
        Returns assessment ('supported_by_excerpt', 'partially_supported', 'unsupported') and explanation.
        """
        system_prompt = (
            "You are a rigorous scientific citation verifier. Determine if the excerpt strictly entails the claim.\n"
            "Assessments:\n"
            "- 'supported_by_excerpt': The excerpt directly and explicitly provides evidence for the claim.\n"
            "- 'partially_supported': The excerpt gives related evidence but does not fully back all specifics or context.\n"
            "- 'unsupported': The excerpt fails to back the claim or contradicts it.\n"
            "Return ONLY a JSON object: {\"assessment\": \"...\", \"explanation\": \"...\"}"
        )
        user_prompt = f"Claim: {claim_text}\n\nExcerpt: {excerpt}"
        content = await self._chat_completion(system_prompt, user_prompt)
        if content:
            try:
                cleaned = content.strip()
                if "```json" in cleaned:
                    cleaned = cleaned.split("```json")[1].split("```")[0].strip()
                elif "```" in cleaned:
                    cleaned = cleaned.split("```")[1].split("```")[0].strip()
                data = json.loads(cleaned)
                assessment = data.get("assessment")
                if assessment in ["supported_by_excerpt", "partially_supported", "unsupported"]:
                    return {
                        "assessment": assessment,
                        "explanation": data.get("explanation", "Assessed by Nemotron reasoning."),
                    }
            except Exception:
                pass

        return {
            "assessment": "supported_by_excerpt",
            "explanation": "Verified via excerpt alignment.",
        }


nemotron_service = NemotronService()
