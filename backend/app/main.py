from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, vaults, passwords, users, devices
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.logging import LoggingMiddleware
import logging

# Configure basic logging formatting
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Kizuna Backend", version="1.0.0")

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Custom request processing middlewares
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIdMiddleware)

# Include all API routers
app.include_router(auth.router)
app.include_router(vaults.router)
app.include_router(passwords.router)
app.include_router(users.router)
app.include_router(devices.router)

@app.get('/')
def read_root():
    return {"message": "Kizuna backend is running"}