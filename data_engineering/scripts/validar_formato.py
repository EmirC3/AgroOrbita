"""Valida que los JSON cumplan lo mínimo de docs/formato_resultados.md."""
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
COMUNES = {"formato_version", "fuente", "es_ejemplo"}
REQUERIDAS = {
    "metricas": COMUNES | {"municipio", "promedio_1985_2025", "anios"},
    "resultados": COMUNES | {"municipio", "cultivo", "resumen_por_semana", "recomendacion"},
    "rotaciones": COMUNES | {"municipio", "rotaciones"},
    "contexto": {"formato_version", "municipio", "cultivo", "es_ejemplo", "fuentes", "explicaciones"},
    "suelo": COMUNES | {"suelos"},
    "municipios": {"formato_version", "municipios"},
}

errores = []

def revisar(ruta, tipo):
    try:
        datos = json.loads(ruta.read_text(encoding="utf-8"))
    except Exception as e:
        errores.append(f"{ruta.relative_to(RAIZ)}: JSON inválido ({e})")
        return
    faltan = REQUERIDAS[tipo] - set(datos)
    if faltan:
        errores.append(f"{ruta.relative_to(RAIZ)}: faltan claves {sorted(faltan)}")
    if tipo == "rotaciones" and len(datos.get("rotaciones", [])) < 3:
        errores.append(f"{ruta.relative_to(RAIZ)}: se requieren al menos 3 rotaciones (RF-007)")

for p in (RAIZ / "datos" / "metricas").glob("*.json"):
    revisar(p, "metricas")
for p in (RAIZ / "simulacion" / "resultados").glob("*.json"):
    tipo = "rotaciones" if p.name.startswith("rotaciones_") else "resultados"
    revisar(p, tipo)
for p in (RAIZ / "simulacion" / "resultados" / "contexto_asistente").glob("*.json"):
    revisar(p, "contexto")
if (RAIZ / "datos" / "suelo.json").exists():
    revisar(RAIZ / "datos" / "suelo.json", "suelo")
if (RAIZ / "datos" / "municipios.json").exists():
    revisar(RAIZ / "datos" / "municipios.json", "municipios")

if errores:
    print("Errores de formato:")
    for e in errores:
        print(" -", e)
    sys.exit(1)
print("Formato OK")
