import uuid
from supabase import create_client
from fastapi import UploadFile, HTTPException
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

BUCKET_NAME = "pickup-requests"
MAX_FILE_SIZE = 5 * 1024 * 1024  
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "images/jpg"}


def upload_pickup_image(file: UploadFile, user_id: str) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Invalid image type")

    contents = file.file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, "Image size exceeds 5MB limit")

    file_ext = file.filename.split(".")[-1]
    file_name = f"user_{user_id}/{uuid.uuid4()}.{file_ext}"

    try:
        response = supabase.storage.from_(BUCKET_NAME).upload(
            path=file_name,
            file=contents,
            file_options={
                "content-type": file.content_type,
                "upsert": False
            }
        )
    except Exception as e:
        print("❌ SUPABASE SDK ERROR:", e)
        raise


    if response is None:
        print("❌ Upload response is None")
        raise HTTPException(500, "Supabase upload returned None")

    if isinstance(response, dict) and response.get("error"):
        print("❌ SUPABASE UPLOAD ERROR:", response["error"])
        raise HTTPException(500, response["error"]["message"])

    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_name)

    print("✅ Uploaded image URL:", public_url)
    return public_url


def delete_pickup_image(image_url: str) -> None:
    """Delete a pickup image from Supabase storage by its public URL."""
    if not image_url or not image_url.strip():
        return
    # Supabase public URL format: .../storage/v1/object/public/{BUCKET_NAME}/{path}
    prefix = f"/object/public/{BUCKET_NAME}/"
    if prefix not in image_url:
        return
    path = image_url.split(prefix, 1)[1].split("?")[0].strip()
    if not path:
        return
    try:
        supabase.storage.from_(BUCKET_NAME).remove([path])
    except Exception as e:
        print("⚠️ Failed to delete pickup image from storage:", e)
