"""Copia los JSON de datos/ y simulacion/ a web/public/data/ (la web solo lee esa carpeta)."""
import shutil
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "web" / "public" / "data"

if not (RAIZ / "web").exists():
    sys.exit("Aún no existe web/. Primero crea la app (ver docs/web_setup.md).")

COPIAS = [
    (RAIZ / "datos" / "municipios.json", DESTINO / "municipios.json"),
    (RAIZ / "datos" / "suelo.json", DESTINO / "suelo.json"),
]
DIRECTORIOS = [
    (RAIZ / "datos" / "metricas", DESTINO / "metricas"),
    (RAIZ / "simulacion" / "resultados", DESTINO / "resultados"),
]

DESTINO.mkdir(parents=True, exist_ok=True)
n = 0
for origen, destino in COPIAS:
    if origen.exists():
        shutil.copy2(origen, destino)
        n += 1
for origen, destino in DIRECTORIOS:
    if origen.exists():
        shutil.copytree(origen, destino, dirs_exist_ok=True,
                        ignore=shutil.ignore_patterns(".gitkeep"))
        n += sum(1 for _ in destino.rglob("*.json"))
print(f"Listo: {n} archivos copiados a {DESTINO}")
