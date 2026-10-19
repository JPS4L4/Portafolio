"""Genera el sitio estático en dist/ (para Cloudflare Pages).

Renderiza las plantillas de templates/ con Jinja2, copia static/ y los
archivos de Cloudflare (_headers). Solo necesita jinja2 (requirements-build.txt).

Uso: python build.py
"""

import shutil
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

BASE_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"
DIST_DIR = BASE_DIR / "dist"

# Plantillas que solo se heredan (no son páginas). Las páginas son el resto.
LAYOUTS = {"base.html"}
# Archivos de la raíz que Cloudflare Pages lee desde la salida del build.
CLOUDFLARE_FILES = ["_headers", "_redirects"]


def render_pages() -> list[str]:
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(["html", "xml"]),
    )
    rendered = []
    for template_path in sorted(TEMPLATES_DIR.glob("*.html")):
        if template_path.name in LAYOUTS:
            continue
        # Las plantillas no usan variables de contexto (ni request/url_for).
        html = env.get_template(template_path.name).render()
        target = DIST_DIR / template_path.name
        target.write_text(html, encoding="utf-8", newline="\n")
        rendered.append(template_path.name)
    return rendered


def main() -> None:
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True)

    pages = render_pages()
    shutil.copytree(STATIC_DIR, DIST_DIR / "static")
    for name in CLOUDFLARE_FILES:
        source = BASE_DIR / name
        if source.is_file():
            shutil.copy2(source, DIST_DIR / name)

    print(f"dist/ listo: {len(pages)} página(s) ({', '.join(pages)}) + static/")


if __name__ == "__main__":
    main()
