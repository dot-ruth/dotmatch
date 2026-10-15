import threading
import time
from collections import deque


class RateLimiter:
    """Sliding-window call limiter keyed by an arbitrary string (usually a client IP)."""

    def __init__(self, max_calls: int, window_seconds: float) -> None:
        self.max_calls = max_calls
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = {}
        self._lock = threading.Lock()

    def check(self, key: str) -> bool:
        """Record a hit for key. Returns False once the key is over its limit."""
        now = time.monotonic()
        with self._lock:
            hits = self._hits.setdefault(key, deque())
            while hits and now - hits[0] >= self.window_seconds:
                hits.popleft()
            if len(hits) >= self.max_calls:
                return False
            hits.append(now)
            self._prune(now)
            return True

    def _prune(self, now: float) -> None:
        if len(self._hits) < 4096:
            return
        expired = [k for k, v in self._hits.items() if not v or now - v[-1] >= self.window_seconds]
        for key in expired:
            del self._hits[key]
