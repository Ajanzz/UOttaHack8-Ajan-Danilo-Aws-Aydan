from typing import Dict, Any
import time

class InMemoryStore:
    def __init__(self):
        self._data: Dict[str, Any] = {}

    def put(self, key: str, value: Any) -> None:
        self._data[key] = value

    def get(self, key: str) -> Any:
        return self._data.get(key)

    def new_case_id(self) -> str:
        return f"CASE-{int(time.time() * 1000)}"

store = InMemoryStore()