import os
import json
import firebase_admin
from firebase_admin import credentials


def _get_credentials():
    """Load Firebase credentials from env (production) or file (local dev)."""
    # Option 1: Full JSON in env var (safe for CI/production; no file in repo)
    cred_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if cred_json:
        try:
            return credentials.Certificate(json.loads(cred_json))
        except json.JSONDecodeError as e:
            raise ValueError("FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON") from e

    # Option 2: Path to key file (local dev; keep file in .gitignore)
    path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")
    if os.path.isfile(path):
        return credentials.Certificate(path)

    raise ValueError(
        "Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_JSON (JSON string) "
        "or FIREBASE_SERVICE_ACCOUNT_PATH (file path), or add serviceAccountKey.json locally."
    )


try:
    firebase_admin.get_app()
except ValueError:
    cred = _get_credentials()
    firebase_admin.initialize_app(cred)
