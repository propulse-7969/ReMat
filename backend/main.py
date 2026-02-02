from fastapi import FastAPI
import app.core.firebase
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ReMat Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",     
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import bins, auth

app.include_router(bins.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"status": "Backend running"}
