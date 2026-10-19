# Portafolio personal

Página de portafolio construida con Python y Jinja2, publicada como sitio estático en Cloudflare Workers
(durante la transición `main.py` con FastAPI sigue sirviendo el mismo contenido en Render).

## Ejecutar localmente

### Sitio estático (recomendado)

```powershell
pip install -r requirements-build.txt
python build.py
python -m http.server -d dist 8000
```

`build.py` renderiza `templates/` con Jinja2 en `dist/` y copia `static/` y `_headers`.
Abrir `http://127.0.0.1:8000`. Repite `python build.py` tras cada cambio.

### Servidor FastAPI (transición)

1. (Opcional) Copiar la configuración de ejemplo y, si quieres, añadir tu token de GitHub:

```powershell
Copy-Item .env.example .env
```

`GITHUB_TOKEN` es opcional: sin token la API de GitHub funciona, pero con un límite de peticiones menor.

2. Con el entorno virtual:

```powershell
& .\.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

También funciona `python main.py`.

3. Alternativa con [uv](https://docs.astral.sh/uv/) (usa `pyproject.toml` y `uv.lock`):

```powershell
uv sync
uv run uvicorn main:app --reload
```

4. Abrir en el navegador:

`http://127.0.0.1:8000`

## Despliegue en Cloudflare Workers

El sitio se publica como Worker de solo archivos estáticos; la configuración está en `wrangler.jsonc`
(publica `dist/` y usa `404.html` para rutas inexistentes).

1. En el dashboard de Cloudflare: **Workers & Pages → Create → Import a repository** y elegir el repo `JPS4L4/Portafolio`.
2. Ajustes del build:
   - Project name: `portafolio` (igual que `name` en `wrangler.jsonc`)
   - Build command: `pip install -r requirements-build.txt && python build.py`
   - Deploy command: `npx wrangler deploy`
   - Variable de build: `PYTHON_VERSION` = `3.13`.
3. Cada push a `main` publica; con «Preview builds» activado, el resto de ramas generan una vista previa.

No hace falta servidor: Render se retirará cuando el dominio apunte a Cloudflare.

### Datos de GitHub

`static/data/github.json` lo genera `scripts/fetch_github_data.py` (misma información que antes
daba `/api/github/data`, solo los campos que usa la web). El workflow
`.github/workflows/refresh-github-data.yml` lo ejecuta cada 6 horas (y a mano desde la pestaña Actions),
y solo hace commit si el archivo cambió; ese commit dispara el despliegue en Cloudflare.
Para regenerarlo en local: `python scripts/fetch_github_data.py` (`GITHUB_TOKEN` opcional).

## Cambiar el contenido

- **Proyectos:** `static/data/projects.json`. Cada proyecto tiene los campos `id`, `name`,
  `description`, `url`, `repo`, `image`, `tags` (lista) y `featured` (`true`/`false`).
  Opcionales: `urlLabel` (texto del botón de `url`, por defecto «Ver demo») y `category`: con
  `"datos"` el proyecto aparece en la sección «Ciencia de datos» en vez de en «Proyectos destacados».
- **Experiencia laboral:** `static/data/jobExperience.json`. Cada trabajo tiene los campos
  `charge`, `company`, `location`, `period` y `achievements` (lista de textos).

## Estructura principal

- `build.py`: genera `dist/` (sitio estático).
- `scripts/fetch_github_data.py`: actualiza `static/data/github.json`.
- `wrangler.jsonc`: configuración del Worker de Cloudflare (archivos estáticos de `dist/`).
- `_headers`: caché y cabeceras de seguridad que aplica Cloudflare.
- `main.py`: backend FastAPI temporal (Render), se eliminará tras el cambio a Cloudflare.
- `templates/`: vistas de Jinja2 (`404.html` incluida).
- `static/`: estilos CSS, JavaScript, imágenes y datos (`static/data/`).
