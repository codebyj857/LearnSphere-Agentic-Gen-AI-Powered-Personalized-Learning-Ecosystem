"""Production WSGI entry point for the LearnSphere backend.

This module boots the Flask application defined in ``app_simple.py`` using the
`waitress` production WSGI server. It is intentionally decoupled from the live
development server so that the existing ``app.run(...)`` dev entry point remains
untouched and fully functional.

Run with a production-grade process manager::

    waitress-serve --listen=0.0.0.0:5002 backend.wsgi:application

or, equivalently, from this directory::

    python -m waitress --listen=0.0.0.0:5002 wsgi:application
"""

from __future__ import annotations

import os

from waitress import serve

# The live Flask application object. Importing it here does not modify
# ``app_simple.py``; it merely reuses the already-configured app factory state.
from app_simple import app as application

DEFAULT_HOST = os.environ.get("WSGI_HOST", "0.0.0.0")
DEFAULT_PORT = int(os.environ.get("PORT", os.environ.get("WSGI_PORT", "5002")))


def _resolve_thread_count() -> int:
    """Determine a sensible worker-thread count.

    Prefers an explicit ``WSGI_THREADS`` environment variable and otherwise
    falls back to ``os.cpu_count()`` (never below 1).

    Returns
    -------
    int
        The number of waitress worker threads to allocate.
    """
    configured = os.environ.get("WSGI_THREADS")
    if configured:
        return max(1, int(configured))
    return max(1, os.cpu_count() or 1)


def run(host: str | None = None, port: int | None = None) -> None:
    """Serve the Flask application with waitress.

    Parameters
    ----------
    host:
        Bind address; defaults to ``0.0.0.0``.
    port:
        Listen port; defaults to ``5002``.
    """
    serve(
        application,
        host=host or DEFAULT_HOST,
        port=port or DEFAULT_PORT,
        threads=_resolve_thread_count(),
    )


if __name__ == "__main__":
    run()