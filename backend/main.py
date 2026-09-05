from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from routers import auth
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Nebula Mail App API")

# We need a session middleware for Authlib to store state during OAuth flow
app.add_middleware(SessionMiddleware, secret_key=os.environ.get("SESSION_SECRET", "super-secret-key"))

app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Nebula Mail App API"}
