"""Supabase client using the service role key.

The service role key is server-side only and must never be exposed to the
frontend. It bypasses Row Level Security, which is required for the worker to
process jobs for all users.
"""

from supabase import create_client

from app import config

_client = None


def get_supabase():
    global _client

    if _client is None:
        config.ensure_configured()
        _client = create_client(
            config.SUPABASE_URL,
            config.SUPABASE_SERVICE_ROLE_KEY,
        )

    return _client
