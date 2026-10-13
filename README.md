# Portafolio personal

Página de portafolio construida con Python, FastAPI y Jinja2.

## Ejecutar localmente

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

## Cambiar el contenido

- **Proyectos:** `static/data/projects.json`. Cada proyecto tiene los campos `id`, `name`,
  `description`, `url`, `repo`, `image`, `tags` (lista) y `featured` (`true`/`false`).
- **Experiencia laboral:** `static/data/jobExperience.json`. Cada trabajo tiene los campos
  `charge`, `company`, `location`, `period` y `achievements` (lista de textos).

## Estructura principal

- `main.py`: backend FastAPI, ruta principal y `/api/github/data` (con caché en memoria de 10 minutos).
- `templates/`: vistas de Jinja2.
- `static/`: estilos CSS, JavaScript, imágenes y datos (`static/data/`).
