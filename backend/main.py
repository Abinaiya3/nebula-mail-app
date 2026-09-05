from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, mail, copilot
from copilotkit.integrations.fastapi import add_fastapi_endpoint
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Nebula Mail App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# We need a session middleware for Authlib to store state during OAuth flow
app.add_middleware(SessionMiddleware, secret_key=os.environ.get("SESSION_SECRET", "super-secret-key"))

app.include_router(auth.router)
app.include_router(mail.router)
add_fastapi_endpoint(app, copilot.sdk, "/copilotkit")

@app.get("/")
def read_root():
    return {"message": "Welcome to Nebula Mail App API"}
