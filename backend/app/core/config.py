import os
from dotenv import load_dotenv

load_dotenv()

ADMIN_EMAILS = set(
    email.strip().lower()
    for email in os.getenv("ADMIN_EMAILS", "").split(",")
    if email.strip()
)