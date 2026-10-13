import json
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request as UrlRequest, urlopen

import uvicorn
from fastapi import FastAPI, Request as FastAPIRequest
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="Mi Portafolio")

app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

@app.get("/", response_class=HTMLResponse)
async def read_index(request: FastAPIRequest):
    return templates.TemplateResponse(
        name="index.html",
        request=request,
    )

GITHUB_CACHE_TTL = 600  # segundos (10 minutos)
_github_cache = {"payload": None, "expires_at": 0.0}


@app.get("/api/github/data")
def github_portfolio_data():
    now = time.monotonic()
    cached = _github_cache["payload"]
    if cached is not None and now < _github_cache["expires_at"]:
        return cached

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "portfolio-app/1.0",
    }
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"

    def fetch_json(url: str):
        req = UrlRequest(url, headers=headers)
        with urlopen(req, timeout=10) as response:
            return json.load(response)

    try:
        repos = fetch_json(
            "https://api.github.com/users/JPS4L4/repos?per_page=100&sort=updated"
        )
        user = fetch_json("https://api.github.com/users/JPS4L4")
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        if cached is not None:
            return cached
        return JSONResponse(status_code=502, content={"error": str(exc)})

    payload = {"repos": repos, "user": user}
    _github_cache["payload"] = payload
    _github_cache["expires_at"] = now + GITHUB_CACHE_TTL
    return payload


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
