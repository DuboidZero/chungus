"""Brute-force protection for login endpoints.

Sliding-window failed-attempt tracker, keyed by (client IP, identifier).
After MAX_FAILURES failed logins within WINDOW_SECONDS, further attempts for
that key are rejected with 429 until the window expires. A successful login
clears the counter.

In-memory, so limits reset on restart and are per-process. For multi-worker
production deployments, move this state to Redis or similar.
"""
import time
import threading
from fastapi import HTTPException, status

MAX_FAILURES = 5
WINDOW_SECONDS = 15 * 60

_lock = threading.Lock()
_failures: dict[tuple[str, str], list[float]] = {}


def _prune(timestamps: list[float], now: float) -> list[float]:
    cutoff = now - WINDOW_SECONDS
    return [t for t in timestamps if t > cutoff]


def check_not_locked(client_ip: str, identifier: str) -> None:
    """Raise 429 if this (ip, identifier) has too many recent failures."""
    key = (client_ip, identifier.lower())
    now = time.time()
    with _lock:
        recent = _prune(_failures.get(key, []), now)
        _failures[key] = recent
        if len(recent) >= MAX_FAILURES:
            retry_after = int(recent[0] + WINDOW_SECONDS - now) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed login attempts. Try again later.",
                headers={"Retry-After": str(retry_after)},
            )


def record_failure(client_ip: str, identifier: str) -> None:
    key = (client_ip, identifier.lower())
    now = time.time()
    with _lock:
        _failures[key] = _prune(_failures.get(key, []), now) + [now]


def record_success(client_ip: str, identifier: str) -> None:
    with _lock:
        _failures.pop((client_ip, identifier.lower()), None)
