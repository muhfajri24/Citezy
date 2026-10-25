import asyncio
from typing import Dict, Optional
from ..schemas.research import ResearchRun


class MemoryRunStore:
    def __init__(self):
        self._runs: Dict[str, ResearchRun] = {}
        self._lock = asyncio.Lock()

    async def get(self, run_id: str) -> Optional[ResearchRun]:
        async with self._lock:
            run = self._runs.get(run_id)
            if run is None:
                return None
            # Return deep copy via model_copy to prevent external mutation issues
            return run.model_copy(deep=True)

    async def save(self, run: ResearchRun) -> None:
        async with self._lock:
            self._runs[run.id] = run.model_copy(deep=True)

    async def exists(self, run_id: str) -> bool:
        async with self._lock:
            return run_id in self._runs


run_store = MemoryRunStore()
