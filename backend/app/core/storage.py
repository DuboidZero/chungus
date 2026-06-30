import os
import uuid
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "portfolio-files")

_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
            raise RuntimeError("Supabase storage is not configured (missing SUPABASE_URL or SUPABASE_SECRET_KEY)")
        _client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)
    return _client


def upload_file(file_bytes: bytes, filename: str, content_type: str) -> str:
    """Upload bytes to Supabase Storage, return the public URL."""
    # Unique path so files never collide: e.g. "a1b2c3d4.png"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
    key = f"{uuid.uuid4().hex}.{ext}"

    client = _get_client()
    client.storage.from_(SUPABASE_BUCKET).upload(
        path=key,
        file=file_bytes,
        file_options={"content-type": content_type},
    )
    # Public URL (bucket is public)
    return client.storage.from_(SUPABASE_BUCKET).get_public_url(key)