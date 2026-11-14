"""Copia los JSON de data_engineering/ a web/public/data/ (la web solo lee esa carpeta)."""
import shutil
import sys
from pathlib import Path

PROYECTO = Path(__file__).resolve().parents[2]
RAIZ = PROYECTO / "data_engineering"
DESTINO = PROYECTO / "web" / "public" / "data"

if not (PROYECTO / "web").exists():
    sys.exit("Aún no existe web/. Primero crea la app (ver docs/web_setup.md).")

COPIAS = [
    (RAIZ / "datasets" / "municipios.json", DESTINO / "municipios.json"),
    (RAIZ / "datasets" / "suelo.json", DESTINO / "suelo.json"),
]
DIRECTORIOS = [
    (RAIZ / "metrics", DESTINO / "metricas"),
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
