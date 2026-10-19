"""Descarga los datos públicos de GitHub y los guarda en static/data/github.json.

Mismas dos llamadas que hacía /api/github/data en main.py. Solo se guardan los
campos que usa el front-end para que el archivo sea pequeño y los diffs mínimos.
Usa GITHUB_TOKEN si está definido (opcional).

Uso: python scripts/fetch_github_data.py
"""

import json
import os
import sys
from pathlib import Path
from urllib.request import Request, urlopen

GITHUB_USER = "JPS4L4"
OUTPUT = Path(__file__).resolve().parent.parent / "static" / "data" / "github.json"

REPO_FIELDS = [
    "id",
    "name",
    "html_url",
    "description",
    "language",
    "stargazers_count",
    "forks_count",
    "watchers_count",
    "updated_at",
    "homepage",
]
USER_FIELDS = ["login", "public_repos"]


def fetch_json(url: str):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "portfolio-build/1.0",
    }
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    with urlopen(Request(url, headers=headers), timeout=20) as response:
        return json.load(response)


def pick(source: dict, fields: list[str]) -> dict:
    return {field: source.get(field) for field in fields}


def main() -> int:
    repos = fetch_json(
        f"https://api.github.com/users/{GITHUB_USER}/repos?per_page=100&sort=updated"
    )
    user = fetch_json(f"https://api.github.com/users/{GITHUB_USER}")

    payload = {
        "repos": [pick(repo, REPO_FIELDS) for repo in repos],
        "user": pick(user, USER_FIELDS),
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"{OUTPUT}: {len(payload['repos'])} repositorios")
    return 0


if __name__ == "__main__":
    sys.exit(main())
