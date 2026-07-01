import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request as UrlRequest, urlopen

import uvicorn
from fastapi import FastAPI, Request as FastAPIRequest
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

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

@app.get("/api/github/data")
async def github_portfolio_data():
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "portfolio-app/1.0",
    }

    def fetch_json(url: str):
        req = UrlRequest(url, headers=headers)
        with urlopen(req, timeout=10) as response:
            return json.load(response)

    try:
        repos = fetch_json("https://api.github.com/users/JPS4L4/repos")
        user = fetch_json("https://api.github.com/users/JPS4L4")
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        return JSONResponse(status_code=502, content={"error": str(exc)})

    return {"repos": repos, "user": user}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
