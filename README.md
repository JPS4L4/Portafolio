# Portafolio personal

Página básica de portafolio construida con Python, FastAPI y Jinja2.

## Ejecutar localmente

1. Activar el entorno virtual:

```powershell
& .\.venv\Scripts\Activate.ps1
```

2. Ejecutar la aplicación:

```powershell
python main.py
```

O bien desde la raíz del proyecto:

```powershell
uvicorn main:app --reload
```

3. Abrir en el navegador:

`http://127.0.0.1:8000`

## Cambiar los proyectos

Los proyectos aparecen en `main.py` dentro de la lista `projects`.
Puedes modificar los campos `title`, `description`, `stack`, `year`, `tag` y `url`.

## Estructura principal

- `main.py`: backend FastAPI y ruta principal.
- `templates/`: vistas de Jinja2.
- `static/`: estilos CSS.
