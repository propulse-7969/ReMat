from fastapi import FastAPI
import app.core.firebase
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ReMat Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import bins, auth, user, bin_panel, routes, admin_pickup, user_request

app.include_router(bins.router)
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(bin_panel.router)
app.include_router(routes.router)
app.include_router(admin_pickup.router)
app.include_router(user_request.router)



@app.head("/health")
def root():
    return {"status": "Backend running"}
