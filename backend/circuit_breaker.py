"""Strict timed circuit breaker with fallback logic.

Implements the classic three-state circuit-breaker pattern — ``CLOSED``,
``OPEN`` and ``HALF_OPEN`` — with a hard-coded ``8000ms`` threshold. When a
protected call exceeds the timeout (or raises) repeatedly, the breaker trips
``OPEN`` and serves fast-fail/fallback responses instead of hammering a
degraded upstream (e.g. the Gemini API). After a cooldown period it transitions
to ``HALF_OPEN`` to probe recovery.
"""

from __future__ import annotations

import threading
import time
from enum import Enum
from typing import Any, Callable, TypeVar

CircuitState = Enum(
    "CircuitState", {"CLOSED": "closed", "OPEN": "open", "HALF_OPEN": "half_open"}
)

T = TypeVar("T")

DEFAULT_TIMEOUT_MS = 8000
DEFAULT_FAILURE_THRESHOLD = 3
DEFAULT_RECOVERY_TIMEOUT_S = 5.0


class CircuitOpenError(RuntimeError):
    """Raised when a call is rejected while the breaker is in the OPEN state."""


class CircuitBreaker:
    """A thread-safe timed circuit breaker.

    Parameters
    ----------
    timeout_ms:
        The strict per-call execution threshold in milliseconds. Defaults to
        the required ``8000ms``.
    max_failures:
        Number of consecutive failures before the breaker trips ``OPEN``.
    recovery_timeout_s:
        Cooldown (seconds) before the breaker re-probes in ``HALF_OPEN``.
    """

    def __init__(
        self,
        timeout_ms: int = DEFAULT_TIMEOUT_MS,
        max_failures: int = DEFAULT_FAILURE_THRESHOLD,
        recovery_timeout_s: float = DEFAULT_RECOVERY_TIMEOUT_S,
    ) -> None:
        self.timeout_ms = timeout_ms
        self.max_failures = max_failures
        self.recovery_timeout_s = recovery_timeout_s
        self.state: CircuitState = CircuitState.CLOSED
        self._failures = 0
        self._opened_at: float | None = None
        self._lock = threading.RLock()

    # -- internal state transitions -------------------------------------
    def _open(self) -> None:
        """Open the circuit and record the trip timestamp."""
        with self._lock:
            self.state = CircuitState.OPEN
            self._failures = 0
            self._opened_at = time.monotonic()

    def _probe(self) -> bool:
        """Decide whether a HALF_OPEN probe is permitted.

        Returns
        -------
        bool
            ``True`` when the recovery cooldown has elapsed.
        """
        with self._lock:
            if self._opened_at is None:
                return True
            return (time.monotonic() - self._opened_at) >= self.recovery_timeout_s

    def _on_success(self) -> None:
        """Reset the breaker to a healthy CLOSED state on success."""
        with self._lock:
            self._failures = 0
            self._opened_at = None
            if self.state != CircuitState.CLOSED:
                self.state = CircuitState.CLOSED

    def _on_failure(self) -> None:
        """Increment the failure counter, tripping OPEN at the threshold."""
        with self._lock:
            self._failures += 1
            if self._failures >= self.max_failures:
                self._open()

    # -- public API -----------------------------------------------------
    def call(self, func: Callable[..., T], *args: Any, **kwargs: Any) -> T:
        """Protect a callable behind the circuit breaker.

        Parameters
        ----------
        func:
            The callable to protect.
        *args:
            Positional arguments forwarded to ``func``.
        **kwargs:
            Keyword arguments forwarded to ``func``.

        Returns
        -------
        T
            The result of ``func``.

        Raises
        ------
        CircuitOpenError
            If the circuit is OPEN and the cooldown has not elapsed.
        TimeoutError
            If ``func`` does not complete before ``timeout_ms`` elapses.
        """
        if self.state == CircuitState.OPEN and not self._probe():
            raise CircuitOpenError(
                f"Circuit breaker OPEN for {self.recovery_timeout_s}s; call rejected."
            )

        if self.state == CircuitState.HALF_OPEN or (
            self.state == CircuitState.OPEN and self._probe()
        ):
            # Allow a single probe call through to test recovery.
            with self._lock:
                self.state = CircuitState.HALF_OPEN

        started = time.monotonic()
        try:
            result = func(*args, **kwargs)
        except Exception:
            self._on_failure()
            raise

        elapsed_ms = (time.monotonic() - started) * 1000
        if elapsed_ms > self.timeout_ms:
            self._on_failure()
            raise TimeoutError(
                f"Call exceeded {self.timeout_ms}ms threshold (took {elapsed_ms:.0f}ms)."
            )

        self._on_success()
        return result

    def call_with_fallback(
        self,
        func: Callable[..., T],
        fallback: Callable[..., T],
        *args: Any,
        **kwargs: Any,
    ) -> T:
        """Invoke ``func`` and return a fallback result on any failure/timeout.

        Parameters
        ----------
        func:
            The primary callable to protect.
        fallback:
            The callable producing the fallback result on failure.
        *args:
            Positional arguments forwarded to ``func`` (and ``fallback``).
        **kwargs:
            Keyword arguments forwarded to ``func`` (and ``fallback``).

        Returns
        -------
        T
            The primary result, or the fallback result on failure/timeout.
        """
        try:
            return self.call(func, *args, **kwargs)
        except (CircuitOpenError, TimeoutError, Exception):
            return fallback(*args, **kwargs)


def circuit_breaker(
    timeout_ms: int = DEFAULT_TIMEOUT_MS,
    max_failures: int = DEFAULT_FAILURE_THRESHOLD,
    recovery_timeout_s: float = DEFAULT_RECOVERY_TIMEOUT_S,
) -> Callable[[Callable[..., T]], Any]:
    """Decorate a callable with a strict timed circuit breaker.

    Parameters
    ----------
    timeout_ms:
        Per-call threshold in milliseconds (default ``8000``).
    max_failures:
        Failures tolerated before tripping OPEN.
    recovery_timeout_s:
        Cooldown seconds before re-probing.

    Returns
    -------
    Callable[[Callable[..., T]], Any]
        The wrapped, circuit-protected callable.
    """

    def decorator(func: Callable[..., T]) -> Any:
        breaker = CircuitBreaker(
            timeout_ms=timeout_ms,
            max_failures=max_failures,
            recovery_timeout_s=recovery_timeout_s,
        )

        def wrapper(*args: Any, **kwargs: Any) -> T:
            return breaker.call(func, *args, **kwargs)

        wrapper.breaker = breaker  # type: ignore[attr-defined]
        return wrapper

    return decorator